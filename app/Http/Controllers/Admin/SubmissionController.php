<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use Inertia\Inertia;

class SubmissionController extends Controller
{
    public function show(Submission $submission)
    {
        $submission->load(['guest', 'card.cells']);

        return Inertia::render('admin/submissions/show', [
            'submission' => $submission,
        ]);
    }
}
