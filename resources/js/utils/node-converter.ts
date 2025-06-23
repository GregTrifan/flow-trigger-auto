/* eslint-disable @typescript-eslint/no-explicit-any */
import { FlowNode } from '@/types/flow';
import { Position } from '@xyflow/react';

// Backend node type (as expected by BE)
export interface BackendNode {
    id: string;
    nodetype: string;
    subtype: string;
    type: string;
    position_x: number;
    position_y: number;
    data: Record<string, any>;
    parent_id: string | null;
}

// Coming from the BE call
export interface ApiNode {
    id: number;
    type: string;
    subtype: string;
    position_x: number;
    position_y: number;
    data: Record<string, unknown>;
    // Allow any other properties that might come from the API
    [key: string]: string | number | boolean | Record<string, unknown> | null;
}

// Maps node subtypes to allowed data fields
const allowedDataFields: Record<string, string[]> = {
    // Action subtypes
    send_email: ['subject', 'body'],
    send_sms: ['message'],

    // Wait subtype
    time_delay: ['delay_minutes'],

    // Trigger subtype
    form_submit: [], // No extra data fields for form_submit (empty array)

    // Condition subtype
    field_check: ['field_name', 'operator', 'value'],
};

export function toBENode(feNode: FlowNode): BackendNode {
    const subtype = feNode.data.subtype!;
    const allowedFields = allowedDataFields[subtype] || [];
    const filteredData: Record<string, any> = {};

    for (const key of allowedFields) {
        if (feNode.data[key] !== undefined) {
            filteredData[key] = feNode.data[key];
        }
    }

    return {
        id: feNode.id,
        nodetype: feNode.type,
        type: feNode.type,
        subtype: subtype,
        position_x: feNode.position.x,
        position_y: feNode.position.y,
        data: filteredData,
        parent_id: feNode.parentId ?? null,
    };
}

export function toFENode(node: ApiNode): FlowNode {
    return {
        id: node.id.toString(),
        data: {
            type: node.type,
            subtype: node.subtype,
            ...node.data,
        },
        position: {
            x: node.position_x,
            y: node.position_y,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        type: node.type,
        draggable: true,
        connectable: true,
        deletable: true,
        selectable: true,
    } as FlowNode;
}
