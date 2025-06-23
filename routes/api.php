<?php

use App\Http\Controllers\FlowController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // List all flows
    Route::get('/flows', [FlowController::class, 'index']);
    
    // Create a new flow
    Route::post('/flows', [FlowController::class, 'store']);
    
    // Get a specific flow
    Route::get('/flows/{flow}', [FlowController::class, 'show']);
    
    // Update a flow
    Route::put('/flows/{flow}', [FlowController::class, 'update']);
});
