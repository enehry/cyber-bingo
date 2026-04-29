<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BingoCard;
use App\Models\Guest;
use App\Models\Submission;
use Inertia\Inertia;

class LeaderboardController extends Controller
{
    public function index()
    {
        $activeCard = BingoCard::where('is_active', true)->first();

        $submissions = [];
        if ($activeCard) {
            $guests = Guest::all();
            $cardSubmissions = Submission::where('bingo_card_id', $activeCard->id)->get()->keyBy('guest_id');

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
                    'created_at' => $sub ? $sub->created_at : null,
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

        return Inertia::render('admin/leaderboard/index', [
            'card' => $activeCard,
            'submissions' => $submissions,
        ]);
    }
}
