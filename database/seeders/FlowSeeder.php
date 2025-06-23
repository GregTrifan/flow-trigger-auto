<?php

namespace Database\Seeders;

use App\Models\Flow;
use App\Models\Node;
use App\Models\Edge;
use Illuminate\Database\Seeder;

class FlowSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create the default flow
        $flow = Flow::create([
            'name' => 'New Lead Qualification & Follow-up',
            'description' => 'Automated flow for processing new leads with email-based routing',
            'is_active' => true,
        ]);

        // Create nodes
        $nodes = [
            // Trigger Node
            [
                'type' => 'trigger',
                'subtype' => 'form_submit',
                'position_x' => 100,
                'position_y' => 200,
                'data' => [],
            ],
            // Condition: Check Email Domain
            [
                'type' => 'condition',
                'subtype' => 'field_check',
                'position_x' => 400,
                'position_y' => 200,
                'data' => [
                    'field_name' => 'email',
                    'operator' => 'contains',
                    'value' => 'gmail.com'
                ],
            ],
            // Gmail Welcome Email
            [
                'type' => 'action',
                'subtype' => 'send_email',
                'position_x' => 700,
                'position_y' => 100,
                'data' => [
                    'subject' => 'Welcome to Our Service!',
                    'body' => 'Thank you for your interest! As a Gmail user, you get special access to our tools...'
                ],
            ],
            // Gmail Wait
            [
                'type' => 'wait',
                'subtype' => 'time_delay',
                'position_x' => 1000,
                'position_y' => 100,
                'data' => ['delay_minutes' => 1440], // 24 hours
            ],
            // Gmail Follow-up SMS
            [
                'type' => 'action',
                'subtype' => 'send_sms',
                'position_x' => 1300,
                'position_y' => 100,
                'data' => [

                    'message' => 'Hi {{contact.first_name}}, just following up on your inquiry. Let us know if you have any questions!'
                ],
            ],
            // Standard Welcome Email
            [
                'type' => 'action',
                'subtype' => 'send_email',
                'position_x' => 700,
                'position_y' => 300,
                'data' => [
                    'subject' => 'Welcome to Our Service!',
                    'body' => 'Thank you for your interest in our service. We\'ll be in touch soon!'
                ],
            ],
            // Standard Wait
            [
                'type' => 'wait',
                'subtype' => 'time_delay',
                'position_x' => 1000,
                'position_y' => 300,
                'data' => ['delay_minutes' => 2880], // 48 hours
            ],
            // Standard Follow-up SMS
            [
                'type' => 'action',
                'subtype' => 'send_sms',
                'position_x' => 1300,
                'position_y' => 300,
                'data' => [
                    'message' => 'Hi {{contact.first_name}}, just following up on your inquiry. Let us know if you have any questions!'
                ],
            ]
        ];

        // Create nodes and store their IDs
        $nodeIds = [];
        foreach ($nodes as $index => $nodeData) {
            $node = $flow->nodes()->create($nodeData);
            $nodeIds[$index] = $node->id;
        }

        // Define edges (source_node_index => [target_node_index, condition_type, condition_value])
        $edges = [
            // Trigger -> Condition
            [0, 1, 'always', null],
            // Condition -> Gmail Welcome (true branch)
            [1, 2, 'if_true', null],
            // Gmail Welcome -> Gmail Wait
            [2, 3, 'always', null],
            // Gmail Wait -> Gmail SMS
            [3, 4, 'always', null],
            // Condition -> Standard Welcome (false branch)
            [1, 5, 'if_false', null],
            // Standard Welcome -> Standard Wait
            [5, 6, 'always', null],
            // Standard Wait -> Standard SMS
            [6, 7, 'always', null],
        ];

        // Create edges
        foreach ($edges as $edge) {
            $flow->edges()->create([
                'source_node_id' => $nodeIds[$edge[0]],
                'target_node_id' => $nodeIds[$edge[1]],
                'condition_type' => $edge[2],
                'condition_value' => $edge[3] ?? null,
            ]);
        }
    }
}
