<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\Flow;
use App\Models\Contact;
use Illuminate\Support\Facades\Log;
use App\Models\Node;
use App\Models\Edge;
use App\Models\FlowExecution;
use App\Models\ExecutionStep;
use Illuminate\Support\Facades\Mail;
use Illuminate\Bus\Queueable;
use Twilio\Rest\Client;

class RunFlow implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Flow $flow,
        public $contact,
        public ?int $startNodeId = null,
        public ?int $executionId = null,
        public array $context = []
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $contactArr = $this->contact instanceof \App\Models\Contact
            ? $this->contact->toArray()
            : (array) $this->contact;
        $contactId = $contactArr['id'] ?? null;
        Log::info('Running flow for contact', [
            'flow_id' => $this->flow->id,
            'contact_id' => $contactId,
            'start_node_id' => $this->startNodeId,
        ]);

        // 1. Create or resume a FlowExecution record
        if ($this->executionId) {
            $execution = FlowExecution::findOrFail($this->executionId);

            // If this is a delayed job, mark the previous wait step as completed
            if ($this->startNodeId) {
                $waitStep = $execution->steps()
                    ->where('node_id', '!=', $this->startNodeId)
                    ->where('status', ExecutionStep::STATUS_RUNNING)
                    ->whereHas('node', function ($query) {
                        $query->where('type', 'wait');
                    })
                    ->latest()
                    ->first();

                if ($waitStep) {
                    $waitStep->markAsCompleted([
                        'result' => 'Delay completed',
                        'node_type' => 'wait',
                        'node_subtype' => 'time_delay',
                    ]);
                }
            }
        } else {
            $execution = FlowExecution::create([
                'flow_id' => $this->flow->id,
                'triggered_by' => $contactId,
                'status' => FlowExecution::STATUS_PENDING,
                'context' => [
                    'contact' => $contactArr,
                ],
            ]);
        }

        try {
            $execution->markAsRunning();

            // 2. Determine starting node(s) and context
            if ($this->startNodeId) {
                $startNode = Node::findOrFail($this->startNodeId);
                $currentNodes = [$startNode];
                $context = $this->context ?: [
                    'contact' => $contactArr,
                    'previous_node_result' => null,
                ];
            } else {
                $triggerNode = $this->flow->nodes()->where('type', 'trigger')->where('subtype', 'form_submit')->first();
                if (!$triggerNode) {
                    throw new \Exception('No trigger node found for flow.');
                }
                $currentNodes = [$triggerNode];
                $context = [
                    'contact' => $contactArr,
                    'previous_node_result' => null,
                ];
            }
            $visited = [];

            // 3. Traverse the flow
            while (!empty($currentNodes)) {
                /** @var Node $node */
                $node = array_shift($currentNodes);
                if (in_array($node->id, $visited)) {
                    continue; // Prevent cycles
                }
                $visited[] = $node->id;

                Log::info('Executing node', [
                    'node_id' => $node->id,
                    'type' => $node->type,
                    'subtype' => $node->subtype,
                    'data' => $node->data,
                ]);

                // Create ExecutionStep
                $step = ExecutionStep::create([
                    'execution_id' => $execution->id,
                    'node_id' => $node->id,
                    'status' => ExecutionStep::STATUS_PENDING,
                    'input' => [
                        'node_type' => $node->type,
                        'node_subtype' => $node->subtype,
                        'node_label' => $this->generateNodeLabel($node),
                    ],
                ]);
                $step->markAsRunning();

                $result = null;
                $error = null;
                try {
                    switch ($node->type) {
                        case 'trigger':
                            Log::info('Trigger node reached', ['node_id' => $node->id]);
                            $result = true;
                            break;
                        case 'action':
                            Log::info('Action node execution started', [
                                'node_id' => $node->id,
                                'subtype' => $node->subtype,
                            ]);
                            $result = $this->executeActionNode($node, $context);
                            Log::info('Action node execution finished', [
                                'node_id' => $node->id,
                                'result' => $result,
                            ]);
                            break;
                        case 'condition':
                            Log::info('Condition node evaluation started', [
                                'node_id' => $node->id,
                                'subtype' => $node->subtype,
                            ]);
                            $result = $this->executeConditionNode($node, $context);
                            Log::info('Condition node evaluation finished', [
                                'node_id' => $node->id,
                                'result' => $result,
                            ]);
                            break;
                        case 'wait':
                            Log::info('Wait node execution started', [
                                'node_id' => $node->id,
                                'subtype' => $node->subtype,
                            ]);
                            $result = $this->executeWaitNode($node, $context, $execution, $visited);
                            Log::info('Wait node execution finished (job re-dispatched with delay)', [
                                'node_id' => $node->id,
                                'result' => $result,
                            ]);
                            // Don't mark as completed - let the delayed job mark it when it starts
                            return; // Exit early to prevent marking as completed
                            break;
                        default:
                            throw new \Exception('Unknown node type: ' . $node->type);
                    }
                    $step->markAsCompleted([
                        'result' => $result,
                        'node_type' => $node->type,
                        'node_subtype' => $node->subtype,
                        'delay_minutes' => $node->type === 'wait' ? ($node->data['delay_minutes'] ?? 1) : null,
                    ]);
                } catch (\Exception $e) {
                    Log::error('Node execution failed', [
                        'node_id' => $node->id,
                        'error' => $e->getMessage(),
                    ]);
                    $step->markAsFailed($e->getMessage());
                    throw $e;
                }

                $context['previous_node_result'] = $result;

                // For wait nodes, don't traverse outgoing edges immediately
                // The delayed job will handle the continuation
                if ($node->type === 'wait') {
                    continue;
                }

                // Traverse outgoing edges
                foreach ($node->outgoingEdges as $edge) {
                    $conditionMet = $edge->isConditionMet($context);
                    Log::info('Evaluating edge', [
                        'edge_id' => $edge->id,
                        'source_node_id' => $edge->source_node_id,
                        'target_node_id' => $edge->target_node_id,
                        'condition_type' => $edge->condition_type,
                        'condition_met' => $conditionMet,
                    ]);
                    if ($conditionMet) {
                        $nextNode = $edge->target;
                        if ($nextNode && !in_array($nextNode->id, $visited)) {
                            Log::info('Adding next node to execution queue', [
                                'next_node_id' => $nextNode->id,
                            ]);
                            $currentNodes[] = $nextNode;
                        }
                    }
                }
            }

            $execution->markAsCompleted(['success' => true]);
        } catch (\Exception $e) {
            $execution->markAsFailed($e->getMessage());
            Log::error('Flow execution failed', [
                'flow_id' => $this->flow->id,
                'contact_id' => $contactId,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Execute an action node (send_email, send_sms).
     */
    protected function executeActionNode(Node $node, array $context)
    {
        $data = $node->data;
        $contact = $context['contact'] ?? [];
        switch ($node->subtype) {
            case 'send_email':
                // 'to' comes from contact email
                $to = $contact['email'] ?? null;
                $subject = $this->interpolate($data['subject'] ?? '', $contact);
                $body = $this->interpolate($data['body'] ?? '', $contact);
                if (!$to || !$subject || !$body) {
                    $step->markAsSkipped('Missing email data: ' . (!$to ? 'no email address' : 'missing subject or body'));
                    return; // Skip this step
                }
                Mail::raw($body, function ($message) use ($to, $subject) {
                    $message->to($to)->subject($subject);
                });
                return 'Email sent to ' . $to;
            case 'send_sms':
                // 'to' comes from contact phone
                $to = $contact['phone'] ?? null;
                $message = $this->interpolate($data['message'] ?? '', $contact);
                if (!$to || !$message) {
                    $step->markAsSkipped('Missing SMS data: ' . (!$to ? 'no phone number' : 'missing message'));
                    return; // Skip this step
                }

                try {
                    $twilio = new Client(config('twilio.sid'), config('twilio.token'));
                    $twilio->messages->create(
                        $to,
                        [
                            'from' => config('twilio.from'),
                            'body' => $message,
                        ]
                    );
                    Log::info('Successfully sent SMS via Twilio', ['to' => $to]);
                    return 'SMS sent to ' . $to;
                } catch (\Exception $e) {
                    Log::error('Twilio SMS failed', [
                        'to' => $to,
                        'error' => $e->getMessage(),
                    ]);
                    // Re-throw or handle the exception as needed
                    throw new \Exception('Failed to send SMS via Twilio: ' . $e->getMessage());
                }
            default:
                throw new \Exception('Unknown action subtype: ' . $node->subtype);
        }
    }

    /**
     * Execute a condition node (field_check).
     */
    protected function executeConditionNode(Node $node, array $context)
    {
        $data = $node->data;
        switch ($node->subtype) {
            case 'field_check':
                $field = $data['field_name'] ?? null;
                $operator = $data['operator'] ?? null;
                $value = $data['value'] ?? null;
                $contact = $context['contact'] ?? [];
                $fieldValue = $contact[$field] ?? null;
                switch ($operator) {
                    case 'exists':
                        return !empty($fieldValue);
                    case 'not_exists':
                        return empty($fieldValue);
                    case 'equals':
                        return $fieldValue == $value;
                    case 'not_equals':
                        return $fieldValue != $value;
                    case 'contains':
                        return is_string($fieldValue) && str_contains($fieldValue, $value);
                    default:
                        throw new \Exception('Unknown operator: ' . $operator);
                }
            default:
                throw new \Exception('Unknown condition subtype: ' . $node->subtype);
        }
    }

    /**
     * Execute a wait node (time_delay).
     */
    protected function executeWaitNode(Node $node, array $context, FlowExecution $execution, array $visited)
    {
        $data = $node->data;
        switch ($node->subtype) {
            case 'time_delay':
                $minutes = (int)($data['delay_minutes'] ?? 1);
                // Find next node(s) after this wait node
                $nextNodes = [];
                foreach ($node->outgoingEdges as $edge) {
                    if ($edge->isConditionMet($context)) {
                        $nextNode = $edge->target;
                        if ($nextNode && !in_array($nextNode->id, $visited)) {
                            $nextNodes[] = $nextNode;
                        }
                    }
                }
                // Schedule a new RunFlow job for each next node
                foreach ($nextNodes as $nextNode) {
                    Log::info('Dispatching delayed RunFlow job for next node', [
                        'next_node_id' => $nextNode->id,
                        'delay_minutes' => $minutes,
                    ]);
                    self::dispatch(
                        $this->flow,
                        $this->contact,
                        $nextNode->id,
                        $execution->id,
                        $context
                    )->delay(now()->addMinutes($minutes));
                }
                return 'Scheduled next node(s) after delay';
            default:
                throw new \Exception('Unknown wait subtype: ' . $node->subtype);
        }
    }

    /**
     * Interpolate variables in a string (e.g., {{email}}, {{name}}, {{phone}}).
     */
    protected function interpolate($text, $contact)
    {
        $vars = [
            'email' => $contact['email'] ?? '',
            'name' => $contact['name'] ?? '',
            'phone' => $contact['phone'] ?? '',
        ];
        return preg_replace_callback('/{{\s*(email|name|phone)\s*}}/', function ($matches) use ($vars) {
            return $vars[$matches[1]] ?? $matches[0];
        }, $text);
    }

    /**
     * Generate a label for a node.
     */
    protected function generateNodeLabel(Node $node)
    {
        switch ($node->type) {
            case 'trigger':
                return 'Form Submit Trigger';
            case 'action':
                switch ($node->subtype) {
                    case 'send_email':
                        return 'Send Email';
                    case 'send_sms':
                        return 'Send SMS';
                    default:
                        return 'Action: ' . ucfirst(str_replace('_', ' ', $node->subtype));
                }
            case 'condition':
                switch ($node->subtype) {
                    case 'field_check':
                        $field = $node->data['field_name'] ?? 'unknown field';
                        return 'Check ' . ucfirst(str_replace('_', ' ', $field));
                    default:
                        return 'Condition: ' . ucfirst(str_replace('_', ' ', $node->subtype));
                }
            case 'wait':
                switch ($node->subtype) {
                    case 'time_delay':
                        $minutes = $node->data['delay_minutes'] ?? 1;
                        return "Wait {$minutes} minute" . ($minutes > 1 ? 's' : '');
                    default:
                        return 'Wait: ' . ucfirst(str_replace('_', ' ', $node->subtype));
                }
            default:
                return ucfirst($node->type) . ' Node';
        }
    }
}
