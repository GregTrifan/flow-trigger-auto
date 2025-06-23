import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Mail, MessageSquareText } from 'lucide-react';

const icons: { [key: string]: React.ElementType } = {
    send_email: Mail,
    send_sms: MessageSquareText,
};

export default memo(({ data, isConnectable }: {
    data: { subtype: string; label: string;[key: string]: string; };
    isConnectable: boolean;
}) => {
    const Icon = icons[data.subtype] || Mail;
    const formatLabel = (str: string) => {
        return str
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };
    return (
        <div className="dark:bg-sky-900/80 bg-sky-50 border-2 dark:border-sky-800/80 border-sky-300/80 shadow-xl shadow-sky-500/10 w-48 rounded-lg">
            <div className='bg-sky-200/50 dark:bg-sky-950/50 px-3 py-2 text-left font-bold text-sm rounded-t-md'>
                Action
            </div>
            <div className="p-3">
                <div className="flex items-center space-x-3">
                    <Icon className="h-8 w-8 text-sky-500 flex-shrink-0" />
                    <div className="text-sm">
                        <div className="font-semibold text-base">{formatLabel(data.subtype)}</div>
                        <div className="text-xs text-sky-600 dark:text-sky-400">Execute Action</div>
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
