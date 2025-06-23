<?php

namespace App\Http\Controllers;

use App\Models\Flow;
use App\Models\Node;
use App\Models\Edge;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class FlowController extends Controller
{
    /**
     * Get validation rules for flow operations
     */
    protected function getFlowValidationRules(bool $forUpdate = false): array
    {
        $nodeTypes = array_keys(config('nodes.types', []));

        $baseNodeRules = [
            'id' => ['nullable', 'integer'],
            'type' => ['required', 'string', 'in:' . implode(',', $nodeTypes)],
            'subtype' => ['required', 'string'],
            'position_x' => ['required', 'numeric'],
            'position_y' => ['required', 'numeric'],
            'data' => ['array'],
            'parent_id' => ['nullable', 'integer', 'exists:nodes,id']
        ];

        $edgeRules = [
            'id' => ['nullable', 'integer'],
            'source' => ['required', 'integer', 'exists:nodes,id'],
            'target' => ['required', 'integer', 'exists:nodes,id', 'different:source'],
            'condition_type' => [
                'required',
                'string',
                'in:' . implode(',', [
                    Edge::CONDITION_ALWAYS,
                    Edge::CONDITION_IF_TRUE,
                    Edge::CONDITION_IF_FALSE,
                    Edge::CONDITION_CUSTOM
                ])
            ],
            'condition_value' => [
                'nullable',
                'required_if:condition_type,' . Edge::CONDITION_CUSTOM,
                'string',
                'max:255'
            ],
            'label' => ['nullable', 'string', 'max:255']
        ];

        $rules = [
            'flow' => ['required', 'array'],
            'flow.name' => ['required', 'string', 'max:255'],
            'flow.description' => ['nullable', 'string'],
            'flow.is_active' => ['sometimes', 'boolean'],
            'nodes' => ['required', 'array', 'min:1'],
            'nodes.*' => ['array'] + $baseNodeRules,
            'edges' => ['array'],
            'edges.*' => ['array'] + $edgeRules,
        ];

        // Add dynamic validation for node data based on type/subtype
        $rules['nodes.*.subtype'] = [
            'required',
            'string',
            function (
                $attribute,
                $value,
                $fail
            ) {
                $index = explode('.', $attribute)[1];
                $type = request()->input("nodes.{$index}.type");
                if (!$type) {
                    $fail("Node type is required for subtype validation (nodes.{$index}.type is missing or empty).");
                    return;
                }
                $subtypes = array_keys(config("nodes.types.{$type}.subtypes", []));
                if (!in_array($value, $subtypes, true)) {
                    $fail("The selected {$attribute} is invalid for type {$type}.");
                }
            }
        ];

        // Add validation for node data fields
        $rules['nodes.*.data'] = [
            'array',
            function ($attribute, $value, $fail) {
                $index = explode('.', $attribute)[1];
                $type = request()->input("nodes.{$index}.type");
                $subtype = request()->input("nodes.{$index}.subtype");

                $fields = config("nodes.types.{$type}.subtypes.{$subtype}.fields", []);

                foreach ($fields as $fieldName => $fieldConfig) {
                    $isRequired = $fieldConfig['required'] ?? false;
                    $fieldValue = $value[$fieldName] ?? null;

                    if ($isRequired && ($fieldValue === null || $fieldValue === '')) {
                        $fail("The {$fieldName} field is required for {$type}/{$subtype} nodes.");
                        continue;
                    }

                    // Add type-specific validation
                    switch ($fieldConfig['type'] ?? 'text') {
                        case 'number':
                            if ($fieldValue !== null && !is_numeric($fieldValue)) {
                                $fail("The {$fieldName} must be a number.");
                            }
                            if (isset($fieldConfig['min']) && $fieldValue < $fieldConfig['min']) {
                                $fail("The {$fieldName} must be at least {$fieldConfig['min']}.");
                            }
                            break;
                        case 'select':
                            if ($fieldValue !== null && !empty($fieldConfig['options']) && !array_key_exists($fieldValue, $fieldConfig['options'])) {
                                $fail("The selected {$fieldName} is invalid.");
                            }
                            break;
                    }
                }

                // Check for unexpected fields
                $allowedFields = array_keys($fields);
                foreach (array_keys($value) as $fieldName) {
                    if (!in_array($fieldName, $allowedFields)) {
                        $fail("The field '{$fieldName}' is not allowed for {$type}/{$subtype} nodes.");
                    }
                }
            }
        ];

        return $rules;
    }
    /**
     * Get all flows
     */
    public function index()
    {
        $flows = Flow::withCount(['nodes', 'edges'])->get();

        return response()->json([
            'data' => $flows->map(function ($flow) {
                return [
                    'id' => $flow->id,
                    'name' => $flow->name,
                    'description' => $flow->description,
                    'is_active' => $flow->is_active,
                    'nodes_count' => $flow->nodes_count,
                    'edges_count' => $flow->edges_count,
                    'created_at' => $flow->created_at,
                    'updated_at' => $flow->updated_at,
                ];
            })
        ]);
    }

    /**
     * Get a specific flow with its nodes and edges
     */
    public function show(Flow $flow)
    {
        $flow->load([
            'nodes' => function ($query) {
                $query->orderBy('position_y')->orderBy('position_x');
            },
            'edges'
        ]);

        return response()->json([
            'flow' => $flow->only(['id', 'name', 'description', 'is_active']),
            'nodes' => $flow->nodes->map(function ($node) {
                return [
                    'id' => $node->id,
                    'type' => $node->type,
                    'subtype' => $node->subtype,
                    'position_x' => $node->position_x,
                    'position_y' => $node->position_y,
                    'data' => $node->data,
                    'parent_id' => $node->parent_id,
                ];
            }),
            'edges' => $flow->edges->map(function ($edge) {
                return [
                    'id' => $edge->id,
                    'source' => $edge->source_node_id,
                    'target' => $edge->target_node_id,
                    'condition_type' => $edge->condition_type,
                    'condition_value' => $edge->condition_value,
                    'label' => $edge->label,
                ];
            }),
        ]);
    }

    /**
     * Create a new flow
     */
    public function store(Request $request)
    {
        // Convert 'nodetype' to 'type' in nodes if present
        $input = $request->all();
        if (isset($input['nodes']) && is_array($input['nodes'])) {
            foreach ($input['nodes'] as $i => $node) {
                if (isset($node['nodetype'])) {
                    $input['nodes'][$i]['type'] = $node['nodetype'];
                    unset($input['nodes'][$i]['nodetype']);
                }
            }
            $request->merge(['nodes' => $input['nodes']]);
        }
        $validated = $request->validate($this->getFlowValidationRules());
        // Restore 'type' and 'id' fields if missing after validation, and cast id to int
        foreach ($validated['nodes'] as $i => &$node) {
            if (!isset($node['type']) && isset($input['nodes'][$i]['type'])) {
                $node['type'] = $input['nodes'][$i]['type'];
            }
            if (!isset($node['id']) && isset($input['nodes'][$i]['id'])) {
                $node['id'] = (int)$input['nodes'][$i]['id'];
            } elseif (isset($node['id'])) {
                $node['id'] = (int)$node['id'];
            }
            // Restore and cast position_x and position_y as float
            foreach (['position_x', 'position_y'] as $posKey) {
                if (
                    (!isset($node[$posKey]) || !is_numeric($node[$posKey])) &&
                    isset($input['nodes'][$i][$posKey])
                ) {
                    $node[$posKey] = (float)$input['nodes'][$i][$posKey];
                } elseif (isset($node[$posKey])) {
                    $node[$posKey] = (float)$node[$posKey];
                }
            }
        }
        unset($node); // break reference
        // Cast edge source/target to int if present
        if (isset($validated['edges']) && is_array($validated['edges'])) {
            foreach ($validated['edges'] as &$edge) {
                if (isset($edge['source'])) {
                    $edge['source'] = (int)$edge['source'];
                }
                if (isset($edge['target'])) {
                    $edge['target'] = (int)$edge['target'];
                }
            }
            unset($edge);
        }

        return DB::transaction(function () use ($validated) {
            // Create the flow
            $flow = Flow::create([
                'name' => $validated['flow']['name'],
                'description' => $validated['flow']['description'] ?? null,
                'is_active' => $validated['flow']['is_active'] ?? true,
            ]);

            // Create nodes and edges
            $this->syncFlowNodesAndEdges($flow, $validated['nodes'], $validated['edges'] ?? []);

            return response()->json([
                'message' => 'Flow created successfully',
                'data' => $flow->only(['id', 'name'])
            ], 201);
        });
    }

    /**
     * Update an existing flow
     */
    public function update(Request $request, Flow $flow)
    {
        // Convert 'nodetype' to 'type' in nodes if present
        $input = $request->all();
        if (isset($input['nodes']) && is_array($input['nodes'])) {
            foreach ($input['nodes'] as $i => $node) {
                if (isset($node['nodetype'])) {
                    $input['nodes'][$i]['type'] = $node['nodetype'];
                    unset($input['nodes'][$i]['nodetype']);
                }
            }
            $request->merge(['nodes' => $input['nodes']]);
        }
        $validated = $request->validate($this->getFlowValidationRules(true));
        // Restore 'type' and 'id' fields if missing after validation, and cast id to int
        foreach ($validated['nodes'] as $i => &$node) {
            if (!isset($node['type']) && isset($input['nodes'][$i]['type'])) {
                $node['type'] = $input['nodes'][$i]['type'];
            }
            if (!isset($node['id']) && isset($input['nodes'][$i]['id'])) {
                $node['id'] = (int)$input['nodes'][$i]['id'];
            } elseif (isset($node['id'])) {
                $node['id'] = (int)$node['id'];
            }
            // Restore and cast position_x and position_y as float
            foreach (['position_x', 'position_y'] as $posKey) {
                if (
                    (!isset($node[$posKey]) || !is_numeric($node[$posKey])) &&
                    isset($input['nodes'][$i][$posKey])
                ) {
                    $node[$posKey] = (float)$input['nodes'][$i][$posKey];
                } elseif (isset($node[$posKey])) {
                    $node[$posKey] = (float)$node[$posKey];
                }
            }
        }
        unset($node); // break reference
        // Cast edge source/target to int if present
        if (isset($validated['edges']) && is_array($validated['edges'])) {
            foreach ($validated['edges'] as &$edge) {
                if (isset($edge['source'])) {
                    $edge['source'] = (int)$edge['source'];
                }
                if (isset($edge['target'])) {
                    $edge['target'] = (int)$edge['target'];
                }
            }
            unset($edge);
        }
        \Log::info('Validated nodes and edges after update', [
            'nodes' => $validated['nodes'],
            'edges' => $validated['edges'] ?? []
        ]);

        return DB::transaction(function () use ($validated, $flow) {
            // Update flow attributes
            $flow->update([
                'name' => $validated['flow']['name'],
                'description' => $validated['flow']['description'] ?? $flow->description,
                'is_active' => $validated['flow']['is_active'] ?? $flow->is_active,
            ]);

            // Sync nodes and edges
            $this->syncFlowNodesAndEdges($flow, $validated['nodes'], $validated['edges'] ?? []);

            return response()->json([
                'message' => 'Flow updated successfully',
                'data' => $flow->only(['id', 'name'])
            ]);
        });
    }

    /**
     * Helper method to replace all flow nodes and edges (bulk delete/write)
     */
    protected function syncFlowNodesAndEdges(Flow $flow, array $nodes, array $edges)
    {
        // 1. Delete all edges and nodes for this flow
        $flow->edges()->delete();
        $flow->nodes()->delete();

        // 2. Create nodes, mapping FE IDs (string) to DB IDs (int)
        $feToDbId = [];
        $createdNodes = [];
        foreach ($nodes as $nodeData) {
            if (empty($nodeData['type'])) {
                continue;
            }
            $parentId = null;
            // If parent_id is present, store FE parent ID for later mapping
            if (isset($nodeData['parent_id'])) {
                $parentId = $nodeData['parent_id'];
            }
            // Temporarily set parent_id to null; will update after all nodes are created
            $node = $flow->nodes()->create([
                'type' => $nodeData['type'],
                'subtype' => $nodeData['subtype'] ?? null,
                'position_x' => $nodeData['position_x'] ?? 0,
                'position_y' => $nodeData['position_y'] ?? 0,
                'data' => $nodeData['data'] ?? [],
                'parent_id' => null,
            ]);
            $feToDbId[$nodeData['id']] = $node->id;
            $createdNodes[] = [
                'node' => $node,
                'fe_id' => $nodeData['id'],
                'parent_fe_id' => $parentId,
            ];
        }

        // 3. Update parent_id for nodes if needed
        foreach ($createdNodes as $item) {
            if ($item['parent_fe_id'] && isset($feToDbId[$item['parent_fe_id']])) {
                $item['node']->parent_id = $feToDbId[$item['parent_fe_id']];
                $item['node']->save();
            }
        }

        // 4. Create edges using the FE-to-DB ID mapping
        foreach ($edges as $edgeData) {
            if (!isset($feToDbId[$edgeData['source']]) || !isset($feToDbId[$edgeData['target']])) {
                continue; // skip edges with missing nodes
            }
            $flow->edges()->create([
                'source_node_id' => $feToDbId[$edgeData['source']],
                'target_node_id' => $feToDbId[$edgeData['target']],
                'condition_type' => $edgeData['condition_type'] ?? 'always',
                'condition_value' => $edgeData['condition_value'] ?? null,
                'label' => $edgeData['label'] ?? null,
            ]);
        }
        // Optionally: return $feToDbId if you want to send the new mapping to the FE
    }
}
