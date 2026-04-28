<?php

namespace App\Http\Controllers;

use App\Models\Guest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GuestController extends Controller
{
    public function join()
    {
        $avatars = [];
        $files = scandir(public_path('assets/avatar'));
        foreach ($files as $file) {
            if (in_array(pathinfo($file, PATHINFO_EXTENSION), ['png', 'jpg', 'jpeg', 'svg'])) {
                $avatars[] = 'assets/avatar/' . $file;
            }
        }

        return Inertia::render('Welcome', [
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

        return redirect()->route('guest.play');
    }

    public function play(Request $request)
    {
        $guest = Guest::find($request->session()->get('guest_id'));
        return Inertia::render('Game/Play', [
            'guest' => $guest,
        ]);
    }
}
