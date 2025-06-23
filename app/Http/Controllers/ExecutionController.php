<?php

namespace App\Http\Controllers;

use App\Models\FlowExecution;
use App\Models\ExecutionStep;
use App\Models\Flow;
use App\Models\Contact;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Jobs\RunFlow;

class ExecutionController extends Controller
{
    /**
     * Display execution history.
     */
    public function index(Request $request)
    {
        $query = FlowExecution::with(['flow', 'contact'])
            ->orderBy('created_at', 'desc');

        // Filter by flow if specified
        if ($request->has('flow_id') && $request->flow_id) {
            $query->where('flow_id', $request->flow_id);
        }

        // Filter by status if specified
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $executions = $query->paginate(20);

        // Get available flows for filtering
        $flows = Flow::select('id', 'name')->get();

        return Inertia::render('executions/index', [
            'executions' => $executions,
            'flows' => $flows,
            'filters' => $request->only(['flow_id', 'status']),
        ]);
    }

    /**
     * Retry a failed execution.
     */
    public function retry(FlowExecution $execution)
    {
        if ($execution->status !== FlowExecution::STATUS_FAILED) {
            return back()->with('error', 'Only failed executions can be retried.');
        }

        // Reset execution status
        $execution->update([
            'status' => FlowExecution::STATUS_PENDING,
            'error' => null,
            'completed_at' => null,
        ]);

        // Reset all steps to pending
        $execution->steps()->update([
            'status' => ExecutionStep::STATUS_PENDING,
            'error' => null,
            'completed_at' => null,
        ]);

        // Dispatch the job again
        \App\Jobs\RunFlow::dispatch(
            $execution->flow,
            $execution->contact,
            null, // start from beginning
            $execution->id
        );

        return back()->with('success', 'Execution has been queued for retry.');
    }

    /**
     * Get execution statistics.
     */
    public function stats()
    {
        $stats = [
            'total_executions' => FlowExecution::count(),
            'successful_executions' => FlowExecution::where('status', FlowExecution::STATUS_COMPLETED)->count(),
            'failed_executions' => FlowExecution::where('status', FlowExecution::STATUS_FAILED)->count(),
            'pending_executions' => FlowExecution::where('status', FlowExecution::STATUS_PENDING)->count(),
            'running_executions' => FlowExecution::where('status', FlowExecution::STATUS_RUNNING)->count(),
        ];

        // Recent executions by day (last 7 days)
        $recentExecutions = FlowExecution::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count'),
            DB::raw('SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as successful'),
            DB::raw('SUM(CASE WHEN status = "failed" THEN 1 ELSE 0 END) as failed')
        )
        ->where('created_at', '>=', now()->subDays(7))
        ->groupBy('date')
        ->orderBy('date')
        ->get();

        return response()->json([
            'stats' => $stats,
            'recent_executions' => $recentExecutions,
        ]);
    }

    /**
     * Get steps for a specific execution.
     */
    public function steps(FlowExecution $execution)
    {
        $steps = $execution->steps()
            ->with('node')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'steps' => $steps,
        ]);
    }

    /**
     * Manually execute a flow with provided contact details (no Contact record created).
     */
    public function manualRun(Request $request)
    {
        // Validation rules (same as ContactController)
        $rules = [
            'flow_id' => ['required', 'exists:flows,id'],
            'name' => [
                'required',
                'string',
                'min:2',
                'max:100',
                'regex:/^[\pL\s\-\'\"]+$/u',
            ],
            'email' => [
                'required_without:phone',
                'nullable',
                'email:rfc,dns',
                'max:100',
                'regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/',
            ],
            'phone' => [
                'required_without:email',
                'nullable',
                'string',
                'min:10',
                'max:20',
                'regex:/^\+[1-9]\d{9,14}$/',
            ],
        ];
        $messages = [
            'name.required' => 'Please provide your name.',
            'name.min' => 'Your name should be at least 2 characters.',
            'name.max' => 'Your name may not exceed 100 characters.',
            'name.regex' => 'Please enter a valid name with only letters and basic punctuation.',
            'email.required_without' => 'Please provide either an email or phone number.',
            'email.email' => 'Please enter a valid email address.',
            'email.regex' => 'The email format is invalid. Example: name@example.com',
            'email.max' => 'Email may not exceed 100 characters.',
            'phone.required_without' => 'Please provide either a phone number or email.',
            'phone.regex' => 'Please enter a valid phone number in international format (e.g., +4074942XXXX).',
            'phone.min' => 'Phone number must be at least 10 digits.',
            'phone.max' => 'Phone number may not exceed 20 characters.',
        ];
        $validated = $request->validate($rules, $messages);

        $flow = Flow::findOrFail($validated['flow_id']);
        $virtualContact = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
        ];

        // Dispatch the job with a virtual contact (array, not model)
        RunFlow::dispatch($flow, (object)$virtualContact);

        return redirect()->back()->with('success', 'Flow executed successfully!');
    }
}
