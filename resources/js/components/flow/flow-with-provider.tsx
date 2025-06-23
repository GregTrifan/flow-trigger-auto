import { ReactFlowProvider } from '@xyflow/react';
import FlowMaster from './flow-master';

// Simple wrapper that provides React Flow context
const FlowWithProvider = () => {
  return (
    <ReactFlowProvider>
        <FlowMaster flowId="1"/>
    </ReactFlowProvider>
  );
};

export default FlowWithProvider;
