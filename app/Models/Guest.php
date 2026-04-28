<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Guest extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'avatar',
        'session_last_seen',
    ];

    protected $casts = [
        'session_last_seen' => 'datetime',
    ];
}
