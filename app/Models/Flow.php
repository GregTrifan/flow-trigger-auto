<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Flow extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'is_active',
        'trigger_type',
        'trigger_config',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'trigger_config' => 'array',
    ];

    public function nodes(): HasMany
    {
        return $this->hasMany(Node::class)->orderBy('position_y')->orderBy('position_x');
    }

    public function edges(): HasMany
    {
        return $this->hasMany(Edge::class);
    }

    public function executions(): HasMany
    {
        return $this->hasMany(FlowExecution::class);
    }
}
