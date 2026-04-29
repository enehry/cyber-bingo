<?php

namespace App\Http\Controllers;

use App\Events\GuestJoined;
use App\Models\Guest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GuestController extends Controller
{
    public function join(Request $request)
    {
        if (auth()->check()) {
            return redirect()->route('admin.cards.index');
        }

        if (auth('guest')->check()) {
            return redirect()->route('game.play');
        }

        $avatars = [];
        $files = scandir(public_path('assets/avatar'));
        foreach ($files as $file) {
            if (in_array(pathinfo($file, PATHINFO_EXTENSION), ['png', 'jpg', 'jpeg', 'svg'])) {
                $avatars[] = 'assets/avatar/'.$file;
            }
        }

        return Inertia::render('welcome', [
            'avatars' => array_values($avatars),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'avatar' => 'required|string',
        ]);

        $guest = Guest::create([
            'name' => $request->name,
            'avatar' => $request->avatar,
            'session_last_seen' => now(),
        ]);

        $request->session()->put('guest_id', $guest->id);
        auth('guest')->login($guest);

        broadcast(new GuestJoined($guest))->toOthers();

        return redirect()->route('game.play');
    }
}
