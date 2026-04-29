<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BingoCard extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'is_active',
        'is_paused',
        'paused_at',
        'time_limit_seconds',
        'starts_at',
        'ends_at',
        'created_by',
        'score_interpretations',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_paused' => 'boolean',
        'paused_at' => 'datetime',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'score_interpretations' => 'array',
    ];

    public function cells(): HasMany
    {
        return $this->hasMany(BingoCardCell::class);
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
