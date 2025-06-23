import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitFork } from 'lucide-react';

export default memo(({ data, isConnectable }: {
    data: {
        field_name: string;
        operator: string;
        value: string;
        [key: string]: string;
    };
    isConnectable: boolean;
}) => {
    return (
        <div className="dark:bg-amber-900/80 bg-amber-50 border-2 dark:border-amber-800/80 border-amber-300/80 shadow-lg w-64 rounded-lg relative">
            <div className='bg-amber-200/50 dark:bg-amber-950/50 px-3 py-2 text-left font-bold text-sm rounded-t-md'>
                Condition
            </div>
            <div className="p-3">
                <div className="flex items-center space-x-2">
                    <GitFork className="h-6 w-6 text-amber-500" />
                    <div className="text-sm">
                        <div className="text-slate-500 dark:text-slate-400">If...</div>
                        <div className="font-semibold text-base">
                            <code>
                                {data.field_name} {data.operator} {data.value}
                            </code>
                        </div>
                    </div>
                </div>
            </div>
            <Handle
                type="target"
                position={Position.Left}
                className="!bg-slate-400"
                onConnect={(params) => console.log('handle onConnect', params)}
                isConnectable={isConnectable}
            />
            <Handle
                type="source"
                position={Position.Right}
                id="true"
                style={{ top: '35%' }}
                className="!bg-green-500"
                isConnectable={isConnectable}
            />
            <Handle
                type="source"
                position={Position.Right}
                id="false"
                style={{ top: '65%' }}
                className="!bg-red-500"
                isConnectable={isConnectable}
            />
        </div>
    );
});
