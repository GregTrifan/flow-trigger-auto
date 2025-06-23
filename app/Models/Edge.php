<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Edge extends Model
{
    use HasFactory;

    // Condition types
    public const CONDITION_ALWAYS = 'always';
    public const CONDITION_IF_TRUE = 'if_true';
    public const CONDITION_IF_FALSE = 'if_false';
    public const CONDITION_CUSTOM = 'custom';

    protected $fillable = [
        'flow_id',
        'source_node_id',
        'target_node_id',
        'condition_type',
        'condition_value',
        'label',
    ];

    protected $casts = [
        'condition_value' => 'array',
    ];

    protected $attributes = [
        'condition_type' => self::CONDITION_ALWAYS,
        'condition_value' => '{}',
    ];

    /**
     * Get available condition types
     */
    public static function getConditionTypes(): array
    {
        return [
            self::CONDITION_ALWAYS => 'Always',
            self::CONDITION_IF_TRUE => 'If True',
            self::CONDITION_IF_FALSE => 'If False',
            self::CONDITION_CUSTOM => 'Custom Condition',
        ];
    }

    /**
     * Check if this edge's condition is met
     */
    public function isConditionMet(array $context = []): bool
    {
        return match ($this->condition_type) {
            self::CONDITION_ALWAYS => true,
            self::CONDITION_IF_TRUE => (bool)($context['previous_node_result'] ?? false),
            self::CONDITION_IF_FALSE => !($context['previous_node_result'] ?? true),
            self::CONDITION_CUSTOM => $this->evaluateCustomCondition($context),
            default => false,
        };
    }

    /**
     * Evaluate a custom condition
     */
    protected function evaluateCustomCondition(array $context): bool
    {
        // Implement custom condition logic here
        // Example: Check contact properties, previous node results, etc.
        return true;
    }

    public function flow(): BelongsTo
    {
        return $this->belongsTo(Flow::class);
    }

    public function source(): BelongsTo
    {
        return $this->belongsTo(Node::class, 'source_node_id');
    }

    public function target(): BelongsTo
    {
        return $this->belongsTo(Node::class, 'target_node_id');
    }
}
