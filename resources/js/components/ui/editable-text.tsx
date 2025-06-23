import { useState, useRef, useEffect } from 'react';
import React from 'react';

interface EditableTextProps {
    initialValue: string;
    onSave: (value: string) => void;
    className?: string;
}

const EditableTextComponent = ({ initialValue, onSave, className }: EditableTextProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialValue);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    const handleSave = () => {
        if (value.trim() && value !== initialValue) {
            onSave(value.trim());
        } else {
            setValue(initialValue);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setValue(initialValue);
            setIsEditing(false);
        }
    };

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className={`${className} bg-transparent border-b-2 border-primary outline-none focus:ring-0 w-full lg:min-w-[444px]`}
            />
        );
    }

    return (
        <span
            onClick={() => setIsEditing(true)}
            className={`${className} cursor-pointer hover:bg-muted/50 rounded-md px-2 py-1 transition-colors`}
        >
            {value}
        </span>
    );
};

// Memoize the component to prevent unnecessary re-mounts
const EditableText = React.memo(EditableTextComponent, (prevProps, nextProps) => {
    // Only re-render if these specific props change
    return (
        prevProps.initialValue === nextProps.initialValue &&
        prevProps.onSave === nextProps.onSave &&
        prevProps.className === nextProps.className
    );
});

export default EditableText;
