<?php

namespace App\Http\Controllers;

use App\Models\BingoCard;
use App\Models\BingoCardCell;
use App\Models\Guest;
use App\Models\Submission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GameController extends Controller
{
    public function play(Request $request)
    {
        $guestId = $request->session()->get('guest_id');
        $guest = $guestId ? Guest::find($guestId) : null;
        $card = BingoCard::with('cells')->where('is_active', true)->first();

        if (! $card) {
            return Inertia::render('game/waiting', [
                'guest' => $guest ?? (object)['name' => 'Admin', 'avatar' => 'assets/avatar/default.svg'],
            ]);
        }

        // Check if card has expired
        if ($card->ends_at && now()->isAfter($card->ends_at)) {
            return redirect()->route('game.leaderboard');
        }

        // Check if user already submitted
        $submission = $guest ? Submission::where('bingo_card_id', $card->id)
            ->where('guest_id', $guest->id)
            ->first() : null;

        if ($submission) {
            return redirect()->route('game.leaderboard');
        }

        return Inertia::render('game/play', [
            'guest' => $guest,
            'card' => $card,
        ]);
    }

    public function submit(Request $request)
    {
        $request->validate([
            'card_id' => 'required|exists:bingo_cards,id',
            'selected_cells' => 'present|array',
            'selected_cells.*' => 'integer|exists:bingo_card_cells,id',
        ]);

        $guestId = $request->session()->get('guest_id');

        // Prevent duplicate
        if (Submission::where('bingo_card_id', $request->card_id)->where('guest_id', $guestId)->exists()) {
            return redirect()->route('game.leaderboard');
        }

        $card = BingoCard::find($request->card_id);
        $selectedIds = $request->selected_cells ?? [];

        $cells = BingoCardCell::whereIn('id', $selectedIds)->where('bingo_card_id', $card->id)->get();

        $guiltyCount = $cells->count();
        $weightedScore = $cells->sum('risk_weight');

        // Simple time calculation (seconds since game started)
        $submittedAtSeconds = max(0, now()->diffInSeconds($card->starts_at ?? now()));

        Submission::create([
            'bingo_card_id' => $card->id,
            'guest_id' => $guestId,
            'selected_cells_json' => $selectedIds,
            'guilty_count' => $guiltyCount,
            'weighted_score' => $weightedScore,
            'submitted_at_seconds' => $submittedAtSeconds,
            'tie_break_score' => rand(1, 1000),
        ]);

        broadcast(new \App\Events\LeaderboardUpdated())->toOthers();

        return redirect()->route('game.leaderboard');
    }

    public function leaderboard(Request $request)
    {
        $guestId = $request->session()->get('guest_id');
        $guest = $guestId ? Guest::find($guestId) : null;
        $card = BingoCard::where('is_active', true)->first();

        $submissions = [];
        if ($card) {
            // Get all guests
            $guests = Guest::all();
            
            // Get all submissions for this card
            $cardSubmissions = Submission::where('bingo_card_id', $card->id)->get()->keyBy('guest_id');

            $submissions = $guests->map(function($guest) use ($cardSubmissions) {
                $sub = $cardSubmissions->get($guest->id);
                return [
                    'id' => $sub ? $sub->id : 'guest-' . $guest->id,
                    'guest' => $guest,
                    'guilty_count' => $sub ? $sub->guilty_count : null,
                    'weighted_score' => $sub ? $sub->weighted_score : null,
                    'submitted_at_seconds' => $sub ? $sub->submitted_at_seconds : null,
                    'tie_break_score' => $sub ? $sub->tie_break_score : 0,
                    'is_submitted' => (bool)$sub,
                ];
            })->sort(function($a, $b) {
                // Submitted first
                if ($a['is_submitted'] && !$b['is_submitted']) return -1;
                if (!$a['is_submitted'] && $b['is_submitted']) return 1;

                if ($a['is_submitted'] && $b['is_submitted']) {
                    // Current ranking logic: Fewest guilty is better? 
                    // (Based on GameController's previous orderBy ASC)
                    if ($a['guilty_count'] != $b['guilty_count']) {
                        return $a['guilty_count'] <=> $b['guilty_count'];
                    }
                    if ($a['weighted_score'] != $b['weighted_score']) {
                        return $a['weighted_score'] <=> $b['weighted_score'];
                    }
                    if ($a['submitted_at_seconds'] != $b['submitted_at_seconds']) {
                        return $a['submitted_at_seconds'] <=> $b['submitted_at_seconds'];
                    }
                    return $a['tie_break_score'] <=> $b['tie_break_score'];
                }

                // Non-submitted: sort by name
                return strcasecmp($a['guest']->name, $b['guest']->name);
            })->values();
        }

        $hasSubmitted = false;
        if ($card && $guest) {
            $hasSubmitted = isset($cardSubmissions) 
                ? $cardSubmissions->has($guest->id)
                : Submission::where('bingo_card_id', $card->id)->where('guest_id', $guest->id)->exists();
        }

        return Inertia::render('game/leaderboard', [
            'guest' => $guest,
            'card' => $card,
            'submissions' => $submissions,
            'has_submitted' => $hasSubmitted,
        ]);
    }
}
