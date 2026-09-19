import React from 'react';

export interface FieldLayoutProps {
    label?: string;
    labelColor?: string;
    containerClassName?: string;
    children: React.ReactNode;
}

export const FieldLayout: React.FC<FieldLayoutProps> = ({
    label,
    labelColor = "text-gray-700",
    containerClassName = "",
    children,
}) => {
    return (
        <div className={containerClassName}>
            {label && (
                <label className={`block font-bold mb-1 ${labelColor}`}>
                    {label}
                </label>
            )}
            {children}
        </div>
    );
};