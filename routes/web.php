<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\ExecutionController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('dashboard/workflow', function () {
        return Inertia::render('workflow');
    })->name('dashboard.workflow');

    // Execution routes
    Route::get('dashboard/executions', [ExecutionController::class, 'index'])->name('dashboard.executions.index');
    Route::get('dashboard/executions/stats', [ExecutionController::class, 'stats'])->name('dashboard.executions.stats');
    Route::post('dashboard/executions/{execution}/retry', [ExecutionController::class, 'retry'])->name('dashboard.executions.retry');
    Route::get('dashboard/executions/{execution}/steps', [ExecutionController::class, 'steps'])->name('dashboard.executions.steps');
    Route::post('/dashboard/executions/manual-run', [\App\Http\Controllers\ExecutionController::class, 'manualRun'])->name('executions.manualRun');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

// Contact form route
Route::post('/contact', ContactController::class)->name('contact.submit');
