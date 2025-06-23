import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Zap } from 'lucide-react';

export default memo(({ data, isConnectable }: {
    data: { subtype: string; label: string;[key: string]: string; };
    isConnectable: boolean;
}) => {
    const formatLabel = (str: string) => {
        return str
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };
    return (
        <div className="dark:bg-purple-900/80 bg-purple-50 border-2 border-dashed dark:border-purple-700/80 border-purple-400/80 shadow-lg w-48 rounded-lg">
            <div className='bg-gradient-to-r from-purple-200/50 to-purple-300/50 dark:from-purple-950/50 dark:to-purple-900/50 px-3 py-2 text-left font-bold text-sm rounded-t-md'>
                Trigger
            </div>
            <div className="p-3">
                <div className="flex items-center space-x-2">
                    <Zap className="h-6 w-6 text-purple-500" />
                    <div className="text-sm">
                        <div className="font-semibold text-base">{formatLabel(data.subtype)}</div>
                    </div>
                </div>
            </div>
            <Handle
                type="source"
                position={Position.Right}
                className="!bg-slate-400"
                isConnectable={isConnectable}
            />
        </div>
    );
});
