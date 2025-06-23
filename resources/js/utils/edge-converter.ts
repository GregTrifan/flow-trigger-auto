import { FlowEdge } from '@/types/flow';

// Backend edge type (as expected by BE)
export interface BackendEdge {
    id: string;
    source: string;
    target: string;
    condition_type: string;
    condition_value?: string | number | boolean | null;
    label?: string | null;
}

// Coming from the BE call
export interface ApiEdge {
    source: string | number;
    target: string | number;
    condition_type: string;
    condition_value?: string | number | boolean | null;
    label?: string | null;
}

// Convert FE FlowEdge to BE edge
export function toBackendEdge(feEdge: FlowEdge): BackendEdge {
    return {
        id: feEdge.id,
        source: feEdge.source,
        target: feEdge.target,
        condition_type: feEdge.data!.condition_type as string,
        condition_value: (feEdge.data?.condition_value ?? null) as string | number | boolean | null,
        label: (feEdge.data?.label ?? null) as string | null,
    };
}

// Convert BE edge to FE FlowEdge
export function toFEEdge(edge: ApiEdge): FlowEdge {
    let sourceHandle: string | undefined;
    let label: string | undefined = edge.label ?? undefined;
    const style: React.CSSProperties = {
        stroke: '#555',
        strokeWidth: 2,
    };

    if (edge.condition_type === 'if_true') {
        sourceHandle = 'true';
        label = label || 'Yes';
        style.stroke = '#22c55e'; // green-500
    } else if (edge.condition_type === 'if_false') {
        sourceHandle = 'false';
        label = label || 'No';
        style.stroke = '#ef4444'; // red-500
    }

    return {
        id: `${edge.source.toString()}-${edge.target.toString()}-${edge.condition_type}`,
        source: edge.source.toString(),
        target: edge.target.toString(),
        sourceHandle,
        style,
        label,
        animated: false,
        data: {
            condition_type: edge.condition_type,
            condition_value: edge.condition_value,
            label: edge.label,
        },
    } as FlowEdge;
}
