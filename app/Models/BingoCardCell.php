<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BingoCardCell extends Model
{
    use HasFactory;

    protected $fillable = [
        'bingo_card_id',
        'row_index',
        'col_index',
        'label',
        'description',
        'risk_weight',
        'icon',
        'color',
    ];

    public function card(): BelongsTo
    {
        return $this->belongsTo(BingoCard::class, 'bingo_card_id');
    }
}
