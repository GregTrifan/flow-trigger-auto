import ActionNode from './action-node';
import ConditionNode from './condition-node';
import TriggerNode from './trigger-node';
import WaitNode from './wait-node';

export const nodeTypes = {
    trigger: TriggerNode,
    action: ActionNode,
    condition: ConditionNode,
    wait: WaitNode,
};
