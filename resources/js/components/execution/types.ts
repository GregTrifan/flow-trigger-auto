/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ExecutionStep {
    id: number;
    node_id: string;
    status: string;
    created_at: string;
    completed_at: string | null;
    error: string | null;
    input: {
        node_type?: string;
        node_subtype?: string;
        node_label?: string;
    };
    output: {
        result?: unknown;
        node_type?: string;
        node_subtype?: string;
        delay_minutes?: number;
    };
    node?: {
        id: string;
        type: string;
        subtype: string;
        data: {
            label: string;
        };
    };
}

export interface Execution {
    id: number;
    status: string;
    created_at: string;
    completed_at: string | null;
    error: string | null;
    flow: {
        id: number;
        name: string;
    };
    contact?: {
        id?: number;
        name?: string;
        email?: string;
        phone?: string;
    };
    context?: {
        contact?: {
            id?: number;
            name?: string;
            email?: string;
            phone?: string;
        };
        [key: string]: any;
    };
    steps?: ExecutionStep[];
}

export interface Flow {
    id: number;
    name: string;
}

export interface ExecutionFilters {
    flow_id?: string;
    status?: string;
}

export interface ExecutionsData {
    data: Execution[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}
