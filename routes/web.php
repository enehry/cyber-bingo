<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GuestController;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return redirect()->route('guest.join');
})->name('home');

Route::get('/join', [GuestController::class, 'join'])->name('guest.join');
Route::post('/join', [GuestController::class, 'store'])->name('guest.store');

Route::middleware(['guest.session'])->group(function () {
    Route::get('/play', [GuestController::class, 'play'])->name('guest.play');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
