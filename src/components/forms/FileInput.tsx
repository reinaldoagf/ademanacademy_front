import React, { InputHTMLAttributes } from 'react';
import { FieldLayout, FieldLayoutProps } from './FieldLayout';

export interface FileInputProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>,
    Omit<FieldLayoutProps, 'children'> { }

export const FileInput: React.FC<FileInputProps> = ({
    label,
    labelColor,
    containerClassName,
    className = "",
    ...props
}) => {
    return (
        <FieldLayout
            label={label}
            labelColor={labelColor}
            containerClassName={containerClassName}
        >
            <input
                type="file"
                className={`w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 transition-colors ${className}`.trim()}
                {...props}
            />
        </FieldLayout>
    );
};