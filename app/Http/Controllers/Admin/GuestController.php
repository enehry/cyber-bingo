<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Guest;
use App\Models\Submission;
use Inertia\Inertia;

class GuestController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/guests/index', [
            'guests' => Guest::withCount('submissions')->orderBy('created_at', 'desc')->get(),
        ]);
    }

    public function destroy(Guest $guest)
    {
        // Submissions will be deleted via cascade if set up,
        // or we can manually delete them here.
        Submission::where('guest_id', $guest->id)->delete();
        $guest->delete();

        return back()->with('success', 'Player deleted successfully.');
    }

    public function clearAll()
    {
        // Truncate or delete all guests and their submissions
        Submission::truncate();
        Guest::truncate();

        return back()->with('success', 'All players cleared successfully. They will need to re-register.');
    }
}
