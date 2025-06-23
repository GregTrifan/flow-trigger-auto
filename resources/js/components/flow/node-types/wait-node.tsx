/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Clock } from 'lucide-react';

export default memo(({ data, isConnectable }: {
    data: any;
    isConnectable: boolean;
}) => {
    return (
        <div className="dark:bg-slate-800/80 bg-slate-50 border-2 dark:border-slate-700/80 border-slate-300/80 shadow-lg w-48 rounded-lg">
            <div className='bg-slate-200/50 dark:bg-slate-900/50 px-3 py-2 text-left font-bold text-sm rounded-t-md'>
                Wait
            </div>
            <div className="p-3">
                <div className="flex items-center justify-center space-x-3">
                    <Clock className="h-8 w-8 text-slate-500" />
                    <div className="text-center">
                        <div className="text-2xl font-bold">{data.delay_minutes}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">minutes</div>
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
                className="!bg-slate-400"
                isConnectable={isConnectable}
            />
        </div>
    );
});
