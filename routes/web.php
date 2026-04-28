<?php

use App\Http\Controllers\Admin\BingoCardController;
use App\Http\Controllers\Admin\LeaderboardController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\GuestController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('guest.join');
})->name('home');

Route::get('/join', [GuestController::class, 'join'])->name('guest.join');
Route::post('/join', [GuestController::class, 'store'])->name('guest.store');

Route::middleware(['guest.session'])->group(function () {
    Route::get('/play', [GameController::class, 'play'])->name('game.play');
    Route::post('/play/submit', [GameController::class, 'submit'])->name('game.submit');
    Route::get('/leaderboard', [GameController::class, 'leaderboard'])->name('game.leaderboard');
});
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [BingoCardController::class, 'index'])->name('dashboard');
    Route::get('/admin/cards/create', [BingoCardController::class, 'create'])->name('admin.cards.create');
    Route::post('/admin/cards', [BingoCardController::class, 'store'])->name('admin.cards.store');
    Route::get('/admin/cards', [BingoCardController::class, 'index'])->name('admin.cards.index');
    Route::post('/admin/cards/{card}/activate', [BingoCardController::class, 'activate'])->name('admin.cards.activate');
    Route::post('/admin/cards/{card}/start', [BingoCardController::class, 'start'])->name('admin.cards.start');
    Route::post('/admin/cards/{card}/pause', [BingoCardController::class, 'pause'])->name('admin.cards.pause');
    Route::post('/admin/cards/{card}/resume', [BingoCardController::class, 'resume'])->name('admin.cards.resume');
    Route::get('/admin/cards/{card}/edit', [BingoCardController::class, 'edit'])->name('admin.cards.edit');
    Route::put('/admin/cards/{card}', [BingoCardController::class, 'update'])->name('admin.cards.update');
    Route::post('/admin/cards/{card}/duplicate', [BingoCardController::class, 'duplicate'])->name('admin.cards.duplicate');
    Route::post('/admin/cards/{card}/restart', [BingoCardController::class, 'restart'])->name('admin.cards.restart');
    Route::delete('/admin/cards/{card}', [BingoCardController::class, 'destroy'])->name('admin.cards.destroy');
    Route::get('/admin/leaderboard', [LeaderboardController::class, 'index'])->name('admin.leaderboard.index');
});

require __DIR__.'/settings.php';
