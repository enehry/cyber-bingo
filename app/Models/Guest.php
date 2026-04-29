<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Guest extends Authenticatable
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

    public function submissions()
    {
        return $this->hasMany(Submission::class);
    }
}
