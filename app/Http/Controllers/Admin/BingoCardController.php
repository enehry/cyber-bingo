<?php

namespace App\Http\Controllers\Admin;

use App\Events\BingoStateChanged;
use App\Events\LeaderboardUpdated;
use App\Http\Controllers\Controller;
use App\Models\BingoCard;
use App\Models\BingoCardCell;
use App\Models\Guest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BingoCardController extends Controller
{
    public function index()
    {
        $cards = BingoCard::withCount(['cells', 'submissions'])->latest()->get();
        $guestsCount = Guest::count();
        $activeCard = BingoCard::where('is_active', true)->first();

        return Inertia::render('admin/cards/index', [
            'cards' => $cards,
            'stats' => [
                'total_players' => $guestsCount,
                'active_submissions' => $activeCard ? $activeCard->submissions()->count() : 0,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/cards/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'time_limit_seconds' => 'required|integer|min:30',
            'cells' => 'required|array|size:25',
            'cells.*.row_index' => 'required|integer',
            'cells.*.col_index' => 'required|integer',
            'cells.*.label' => 'required|string',
            'cells.*.risk_weight' => 'required|integer',
        ]);

        $card = BingoCard::create([
            'title' => $request->title,
            'description' => $request->description,
            'time_limit_seconds' => $request->time_limit_seconds,
            'is_active' => false,
        ]);

        foreach ($request->cells as $cellData) {
            BingoCardCell::create([
                'bingo_card_id' => $card->id,
                'row_index' => $cellData['row_index'],
                'col_index' => $cellData['col_index'],
                'label' => $cellData['label'],
                'risk_weight' => $cellData['risk_weight'],
            ]);
        }

        return to_route('admin.cards.index');
    }

    public function edit(BingoCard $card)
    {
        return Inertia::render('admin/cards/edit', [
            'card' => $card->load('cells'),
        ]);
    }

    public function update(Request $request, BingoCard $card)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'time_limit_seconds' => 'required|integer|min:30',
            'cells' => 'required|array|size:25',
            'cells.*.row_index' => 'required|integer',
            'cells.*.col_index' => 'required|integer',
            'cells.*.label' => 'required|string',
            'cells.*.risk_weight' => 'required|integer',
        ]);

        $card->update([
            'title' => $request->title,
            'description' => $request->description,
            'time_limit_seconds' => $request->time_limit_seconds,
        ]);

        foreach ($request->cells as $cellData) {
            BingoCardCell::updateOrCreate(
                [
                    'bingo_card_id' => $card->id,
                    'row_index' => $cellData['row_index'],
                    'col_index' => $cellData['col_index'],
                ],
                [
                    'label' => $cellData['label'],
                    'risk_weight' => $cellData['risk_weight'],
                ]
            );
        }

        return to_route('admin.cards.index');
    }

    public function action(Request $request, BingoCard $card)
    {
        $action = $request->input('action');

        switch ($action) {
            case 'activate':
                BingoCard::where('id', '!=', $card->id)->update([
                    'is_active' => false,
                    'is_paused' => false,
                    'paused_at' => null,
                ]);

                $card->update([
                    'is_active' => true,
                    'is_paused' => false,
                    'paused_at' => null,
                    'starts_at' => null,
                    'ends_at' => null,
                ]);

                broadcast(new LeaderboardUpdated)->toOthers();
                break;

            case 'start':
                if ($card->is_active && ! $card->starts_at) {
                    $card->update([
                        'starts_at' => now(),
                        'ends_at' => now()->addSeconds($card->time_limit_seconds),
                    ]);

                    $card->refresh()->load('cells');

                    broadcast(new BingoStateChanged($card, 'started'))->toOthers();
                    broadcast(new LeaderboardUpdated)->toOthers();
                }
                break;

            case 'pause':
                if ($card->is_active && ! $card->is_paused) {
                    $card->update([
                        'is_paused' => true,
                        'paused_at' => now(),
                    ]);

                    $card->refresh()->load('cells');

                    broadcast(new BingoStateChanged($card, 'paused'))->toOthers();
                    broadcast(new LeaderboardUpdated)->toOthers();
                }
                break;

            case 'resume':
                if ($card->is_active && $card->is_paused) {
                    $remainingSeconds = $card->ends_at->getTimestamp() - $card->paused_at->getTimestamp();

                    $card->update([
                        'is_paused' => false,
                        'paused_at' => null,
                        'ends_at' => now()->addSeconds($remainingSeconds),
                    ]);

                    $card->refresh()->load('cells');

                    broadcast(new BingoStateChanged($card, 'resumed'))->toOthers();
                    broadcast(new LeaderboardUpdated)->toOthers();
                }
                break;

            case 'restart':
                if ($card->is_active) {
                    $card->submissions()->delete();

                    $card->update([
                        'starts_at' => now(),
                        'ends_at' => now()->addSeconds($card->time_limit_seconds),
                        'is_paused' => false,
                        'paused_at' => null,
                    ]);

                    $card->refresh()->load('cells');

                    broadcast(new BingoStateChanged($card, 'started'))->toOthers();
                    broadcast(new LeaderboardUpdated)->toOthers();
                }
                break;
        }

        return redirect()->back();
    }

    public function duplicate(BingoCard $card)
    {
        $newCard = $card->replicate();
        $newCard->title = $card->title.' (Copy)';
        $newCard->is_active = false;
        $newCard->starts_at = null;
        $newCard->ends_at = null;
        $newCard->is_paused = false;
        $newCard->paused_at = null;
        $newCard->save();

        foreach ($card->cells as $cell) {
            $newCell = $cell->replicate();
            $newCell->bingo_card_id = $newCard->id;
            $newCell->save();
        }

        return to_route('admin.cards.index')->with('success', 'Bingo card duplicated successfully.');
    }

    public function destroy(BingoCard $card)
    {
        $card->cells()->delete();

        $card->delete();

        return to_route('admin.cards.index')->with('success', 'Bingo card deleted successfully.');
    }
}
