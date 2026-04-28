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
                if ($a['is_submitted'] && !$b['is_submitted']) return -1;
                if (!$a['is_submitted'] && $b['is_submitted']) return 1;

                if ($a['is_submitted'] && $b['is_submitted']) {
                    if ($a['guilty_count'] != $b['guilty_count']) return $a['guilty_count'] <=> $b['guilty_count'];
                    if ($a['weighted_score'] != $b['weighted_score']) return $a['weighted_score'] <=> $b['weighted_score'];
                    return $a['submitted_at_seconds'] <=> $b['submitted_at_seconds'];
                }

                return strcasecmp($a['guest']->name, $b['guest']->name);
            })->values();
        }

        return Inertia::render('admin/leaderboard/index', [
            'card' => $activeCard,
            'submissions' => $submissions,
        ]);
    }
}
