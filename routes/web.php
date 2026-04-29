<?php

use App\Http\Controllers\Admin\BingoCardController;
use App\Http\Controllers\Admin\LeaderboardController;
use App\Http\Controllers\Admin\SubmissionController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\GuestController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('guest.join');
})->name('home');

Route::get('/join', [GuestController::class, 'join'])->name('guest.join');
Route::post('/join', [GuestController::class, 'store'])->name('guest.store');
Route::patch('/guest/profile', [GuestController::class, 'update'])->name('guest.update');

Route::middleware(['guest.session'])->group(function () {
    Route::get('/play', [GameController::class, 'play'])->name('game.play');
    Route::post('/play/submit', [GameController::class, 'submit'])->name('game.submit');
    Route::get('/leaderboard', [GameController::class, 'leaderboard'])->name('game.leaderboard');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Route::get('/dashboard', [BingoCardController::class, 'index'])->name('dashboard');
    Route::get('/admin/cards/create', [BingoCardController::class, 'create'])->name('admin.cards.create');
    Route::post('/admin/cards', [BingoCardController::class, 'store'])->name('admin.cards.store');
    Route::get('/admin/cards', [BingoCardController::class, 'index'])->name('admin.cards.index');

    Route::post('/admin/cards/{card}/action', [BingoCardController::class, 'action'])->name('admin.cards.action');
    Route::post('/admin/cards/{card}/duplicate', [BingoCardController::class, 'duplicate'])->name('admin.cards.duplicate');
    Route::get('/admin/cards/{card}/edit', [BingoCardController::class, 'edit'])->name('admin.cards.edit');
    Route::put('/admin/cards/{card}', [BingoCardController::class, 'update'])->name('admin.cards.update');
    Route::delete('/admin/cards/{card}', [BingoCardController::class, 'destroy'])->name('admin.cards.destroy');
    Route::get('/admin/leaderboard', [LeaderboardController::class, 'index'])->name('admin.leaderboard.index');

    Route::get('/admin/guests', [App\Http\Controllers\Admin\GuestController::class, 'index'])->name('admin.guests.index');
    Route::delete('/admin/guests/{guest}', [App\Http\Controllers\Admin\GuestController::class, 'destroy'])->name('admin.guests.destroy');
    Route::post('/admin/guests/clear', [App\Http\Controllers\Admin\GuestController::class, 'clearAll'])->name('admin.guests.clear');

    Route::get('/admin/submissions/{submission}', [SubmissionController::class, 'show'])->name('admin.submissions.show');
});

require __DIR__.'/settings.php';
