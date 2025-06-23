<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Node extends Model
{
    use HasFactory;

    protected $fillable = [
        'flow_id',
        'type',
        'subtype',
        'position_x',
        'position_y',
        'data',
        'parent_id',
    ];

    protected $casts = [
        'data' => 'array',
        'position_x' => 'integer',
        'position_y' => 'integer',
    ];

    protected $attributes = [
        'data' => '{}',
    ];

    /**
     * Get node type configuration
     */
    public static function getNodeTypeConfig(string $type = null)
    {
        $config = config('nodes.types');
        return $type ? ($config[$type] ?? null) : $config;
    }

    /**
     * Get available node types for the UI
     */
    public static function getNodeTypesForUI(): array
    {
        $types = [];
        foreach (self::getNodeTypeConfig() as $type => $config) {
            $types[] = [
                'type' => $type,
                'label' => $config['label'],
                'subtypes' => array_map(fn($subtype, $key) => [
                    'key' => $key,
                    'label' => $subtype['label'],
                    'icon' => $subtype['icon'] ?? 'circle',
                    'fields' => $subtype['fields'] ?? [],
                ], $config['subtypes'] ?? [], array_keys($config['subtypes'] ?? [])),
            ];
        }
        return $types;
    }

    /**
     * Get the node's configuration
     */
    public function getConfigAttribute()
    {
        return self::getNodeTypeConfig($this->type)['subtypes'][$this->subtype] ?? null;
    }

    /**
     * Get the node's label
     */
    public function getLabelAttribute(): string
    {
        return $this->config['label'] ?? ucfirst($this->subtype ?? 'Node');
    }

    /**
     * Get the node's icon
     */
    public function getIconAttribute(): string
    {
        return $this->config['icon'] ?? 'circle';
    }

    public function flow(): BelongsTo
    {
        return $this->belongsTo(Flow::class);
    }

    public function outgoingEdges(): HasMany
    {
        return $this->hasMany(Edge::class, 'source_node_id');
    }

    public function incomingEdges(): HasMany
    {
        return $this->hasMany(Edge::class, 'target_node_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Node::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Node::class, 'parent_id');
    }

    public function executionSteps(): HasMany
    {
        return $this->hasMany(ExecutionStep::class);
    }
}
