<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('arena', function ($user) {
    // Presence channels MUST return an array of user info
    return [
        'id' => (string) $user->id,
        'name' => (string) $user->name,
        'avatar' => (string) ($user->avatar ?? 'assets/avatar/default.svg'),
        'is_admin' => ($user instanceof User) ? true : false,
    ];
}, ['guards' => ['guest', 'web']]);
