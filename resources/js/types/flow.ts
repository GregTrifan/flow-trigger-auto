/* eslint-disable @typescript-eslint/no-explicit-any */
import { Edge, Node } from '@xyflow/react';

export interface NodeData {
    type?: string;
    subtype?: string;
    to?: string;
    subject?: string;
    body?: string;
    message?: string;
    url?: string;
    field_name?: string;
    operator?: string;
    value?: string | number;
    delay_minutes?: number;
    datetime?: string;
    [key: string]: any;
}

export interface FlowNode extends Node {
    data: NodeData;
    type: string;
    position: { x: number; y: number };
    parentId?: string;
}

export type FlowEdge = Edge;

export type NodeTypes = {
    [key: string]: React.ComponentType<Node<NodeData>>;
};
