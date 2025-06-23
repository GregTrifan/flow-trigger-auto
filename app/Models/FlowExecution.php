<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FlowExecution extends Model
{
    use HasFactory;

    protected $fillable = [
        'flow_id',
        'triggered_by',
        'status',
        'context',
        'result',
        'started_at',
        'completed_at',
        'error',
    ];

    protected $casts = [
        'context' => 'array',
        'result' => 'array',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    // Status constants
    public const STATUS_PENDING = 'pending';
    public const STATUS_RUNNING = 'running';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_FAILED = 'failed';

    public function flow(): BelongsTo
    {
        return $this->belongsTo(Flow::class);
    }

    public function steps(): HasMany
    {
        return $this->hasMany(ExecutionStep::class, 'execution_id');
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class, 'triggered_by');
    }

    // Helper methods
    public function markAsRunning(): void
    {
        $this->update([
            'status' => self::STATUS_RUNNING,
            'started_at' => now(),
        ]);
    }

    public function markAsCompleted(array $result = []): void
    {
        $this->update([
            'status' => self::STATUS_COMPLETED,
            'result' => $result,
            'completed_at' => now(),
        ]);
    }

    public function markAsFailed(string $error): void
    {
        $this->update([
            'status' => self::STATUS_FAILED,
            'error' => $error,
            'completed_at' => now(),
        ]);
    }
}
