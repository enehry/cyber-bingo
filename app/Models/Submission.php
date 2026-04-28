<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Submission extends Model
{
    use HasFactory;

    protected $fillable = [
        'bingo_card_id',
        'guest_id',
        'selected_cells_json',
        'guilty_count',
        'weighted_score',
        'submitted_at_seconds',
        'tie_break_score',
    ];

    protected $casts = [
        'selected_cells_json' => 'array',
    ];

    public function card(): BelongsTo
    {
        return $this->belongsTo(BingoCard::class, 'bingo_card_id');
    }

    public function guest(): BelongsTo
    {
        return $this->belongsTo(Guest::class, 'guest_id');
    }
}
