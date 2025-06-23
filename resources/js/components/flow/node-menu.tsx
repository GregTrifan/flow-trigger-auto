import { Fragment, useCallback } from 'react';
import { Menu, MenuButton, MenuItem, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { useReactFlow } from '@xyflow/react';
import useFlowStore from '@/stores/flowStore';

interface NodeMenuProps {
    onAddNode?: (type: string, subtype: string) => void;
}

const nodeTypes = {
    trigger: ['form_submit'],
    condition: ['field_check'],
    action: ['send_email', 'send_sms'],
    wait: ['time_delay']
};

const NodeMenu = ({ onAddNode }: NodeMenuProps) => {
    const { screenToFlowPosition } = useReactFlow();
    const nodes = useFlowStore((state) => state.nodes);
    const hasTrigger = nodes.some((node) => node.type === 'trigger');

    const handleAddNode = useCallback((type: string, subtype: string) => {
        if (!onAddNode) return;
        // Position the new node in the center of the viewport
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const position = screenToFlowPosition({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
        });
        // Call the parent's onAddNode with the node details
        onAddNode(type, subtype);
    }, [onAddNode, screenToFlowPosition]);

    if (!onAddNode) return null;
    return (
        <Menu as="div" className="relative inline-block text-left">
            {({ open }) => (
                <>
                    <div>
                        <MenuButton className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors rounded-md bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                            Add Node
                            <ChevronDownIcon className="w-4 h-4 ml-1 -mr-1" />
                        </MenuButton>
                    </div>

                    <Transition
                        show={open}
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <Menu.Items
                            className="absolute left-0 z-50 w-64 mt-2 origin-top-left bg-popover text-popover-foreground rounded-md shadow-lg ring-1 ring-border ring-opacity-5 focus:outline-none divide-y divide-border/50"
                            style={{
                                '--background': 'hsl(var(--popover))',
                                '--foreground': 'hsl(var(--popover-foreground))',
                                '--border': 'hsl(var(--border))',
                            } as React.CSSProperties}
                        >
                            {Object.entries(nodeTypes).map(([type, subtypes]) => (
                                <div key={type} className="py-1.5">
                                    <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </div>
                                    {subtypes.map((subtype) => {
                                        const isTrigger = type === 'trigger';
                                        return (
                                            <MenuItem key={`${type}-${subtype}`}>
                                                {({ focus }) => (
                                                    <button

                                                        onClick={() => handleAddNode(type, subtype)}
                                                        disabled={isTrigger && hasTrigger}
                                                        className={`$${focus ? 'bg-accent text-accent-foreground' : ''} flex w-full items-center gap-2 px-3 py-1.5 text-sm text-left rounded-sm transition-colors ${isTrigger && hasTrigger ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                                                        <span>{subtype.replace(/_/g, ' ')}</span>
                                                        {isTrigger && hasTrigger && (
                                                            <span className="ml-2 text-[10px] text-muted-foreground">(Only one trigger allowed)</span>
                                                        )}
                                                    </button>
                                                )}
                                            </MenuItem>
                                        );
                                    })}
                                </div>
                            ))}
                        </Menu.Items>
                    </Transition>
                </>
            )}
        </Menu>
    );
};

export default NodeMenu;
