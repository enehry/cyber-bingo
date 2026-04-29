<?php

namespace App\Http\Controllers;

use App\Events\LeaderboardUpdated;
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

        $cardId = $request->query('preview');
        $card = null;

        // If admin is previewing a specific card
        if ($cardId && auth()->check()) {
            $card = BingoCard::with('cells')->find($cardId);
        }

        // Default to active card if no preview or not admin
        if (! $card) {
            $card = BingoCard::with('cells')->where('is_active', true)->first();
        }

        if (! $card) {
            return Inertia::render('game/waiting', [
                'guest' => $guest ?? (object) [
                    'id' => 0,
                    'name' => 'Admin',
                    'avatar' => 'assets/avatar/default.svg',
                    'is_admin' => true,
                ],
            ]);
        }

        // Check if user already submitted
        $submission = $guest ? Submission::where('bingo_card_id', $card->id)
            ->where('guest_id', $guest->id)
            ->first() : null;

        return Inertia::render('game/play', [
            'guest' => $guest ?? (object) [
                'id' => 0,
                'name' => 'Admin (Preview)',
                'avatar' => 'assets/avatar/default.svg',
                'is_admin' => true,
            ],
            'card' => $card,
            'isPreview' => $request->has('preview') && auth()->check(),
            'hasSubmitted' => (bool) $submission,
            'score' => $submission ? $submission->weighted_score : null,
        ]);
    }

    public function submit(Request $request)
    {
        $request->validate([
            'card_id' => 'required|exists:bingo_cards,id',
            'selected_cells' => 'present|array',
            'selected_cells.*' => 'integer|exists:bingo_card_cells,id',
            'click_history' => 'nullable|array',
        ]);

        $guestId = $request->session()->get('guest_id');

        // Prevent admin from submitting
        if (auth()->check() || ! $guestId) {
            return redirect()->route('admin.cards.index')->with('error', 'Administrators cannot submit bingo entries.');
        }

        // Prevent duplicate
        if (Submission::where('bingo_card_id', $request->card_id)->where('guest_id', $guestId)->exists()) {
            return redirect()->route('game.leaderboard');
        }

        $card = BingoCard::find($request->card_id);
        $selectedIds = $request->selected_cells ?? [];
        $clickHistory = $request->click_history ?? [];

        $cells = BingoCardCell::whereIn('id', $selectedIds)->where('bingo_card_id', $card->id)->get();

        $guiltyCount = $cells->count();

        $totalWeightedScore = 0;
        $timeLimit = $card->time_limit_seconds;

        foreach ($cells as $cell) {
            $weight = $cell->risk_weight;
            $clickTime = $clickHistory[$cell->id] ?? $timeLimit;

            // Speed Bonus: Earlier is better (higher score)
            // Range 0.0 to 1.0
            $speedBonus = max(0, min(1, ($timeLimit - $clickTime) / $timeLimit));

            // Formula: Weight + SpeedBonus
            // If weight=3 and clicked at 1s (SpeedBonus=0.99), contribution=3.99
            $totalWeightedScore += ($weight + $speedBonus);
        }

        // Calculate accurate finish time from click history (last action time)
        $submittedAtSeconds = ! empty($clickHistory)
            ? (int) round(max(array_values($clickHistory)))
            : (int) round($request->input('submitted_at') ?? max(0, now()->diffInSeconds($card->starts_at ?? now())));

        Submission::create([
            'bingo_card_id' => $card->id,
            'guest_id' => $guestId,
            'selected_cells_json' => [
                'ids' => $selectedIds,
                'history' => $clickHistory,
            ],
            'guilty_count' => $guiltyCount,
            'weighted_score' => $totalWeightedScore,
            'submitted_at_seconds' => $submittedAtSeconds,
            'tie_break_score' => rand(1, 1000),
        ]);

        broadcast(new LeaderboardUpdated)->toOthers();

        return redirect()->route('game.play');
    }

    public function leaderboard(Request $request)
    {
        $guestId = $request->session()->get('guest_id');
        $guest = $guestId ? Guest::find($guestId) : null;
        $card = BingoCard::where('is_active', true)->first();

        // If guest and game active, must submit first to see results
        if (! auth()->check() && $guest && $card) {
            $hasSubmitted = Submission::where('bingo_card_id', $card->id)
                ->where('guest_id', $guest->id)
                ->exists();

            if (! $hasSubmitted) {
                return redirect()->route('game.play')->with('error', 'You must submit your entry first to see the leaderboard.');
            }
        }

        $submissions = [];
        if ($card) {
            // Get all guests
            $guests = Guest::all();

            // Get all submissions for this card
            $cardSubmissions = Submission::where('bingo_card_id', $card->id)->get()->keyBy('guest_id');

            $submissions = $guests->map(function ($guest) use ($cardSubmissions) {
                $sub = $cardSubmissions->get($guest->id);

                return [
                    'id' => $sub ? $sub->id : 'guest-'.$guest->id,
                    'guest' => $guest,
                    'guilty_count' => $sub ? $sub->guilty_count : null,
                    'weighted_score' => $sub ? $sub->weighted_score : null,
                    'submitted_at_seconds' => $sub ? $sub->submitted_at_seconds : null,
                    'tie_break_score' => $sub ? $sub->tie_break_score : 0,
                    'is_submitted' => (bool) $sub,
                ];
            })->sort(function ($a, $b) {
                // Submitted first
                if ($a['is_submitted'] && ! $b['is_submitted']) {
                    return -1;
                }
                if (! $a['is_submitted'] && $b['is_submitted']) {
                    return 1;
                }

                if ($a['is_submitted'] && $b['is_submitted']) {
                    // "Winner = Least Guilty" mode: LOWEST GS wins
                    // BUT: Players with 0 GS (didn't click anything) should be at the bottom of the submitted list
                    $scoreA = (float) $a['weighted_score'];
                    $scoreB = (float) $b['weighted_score'];

                    if ($scoreA > 0 && $scoreB == 0) {
                        return -1;
                    }
                    if ($scoreA == 0 && $scoreB > 0) {
                        return 1;
                    }

                    if ($scoreA != $scoreB) {
                        return $scoreA <=> $scoreB;
                    }

                    // Tie-breaker: Answering speed (Duration)
                    // If score is tied, the person who finished faster (less seconds) wins
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
