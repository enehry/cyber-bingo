<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureGuestSession
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->session()->has('guest_id')) {
            return redirect()->route('guest.join');
        }

        $guest = \App\Models\Guest::find($request->session()->get('guest_id'));

        if (! $guest) {
            $request->session()->forget('guest_id');
            return redirect()->route('guest.join');
        }

        // Optional: Update last seen
        // $guest->update(['session_last_seen' => now()]);

        return $next($request);
    }
}
