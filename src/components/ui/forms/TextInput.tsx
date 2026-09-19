import React, { InputHTMLAttributes } from 'react';
import { FieldLayout, FieldLayoutProps } from './FieldLayout';
import { BASE_INPUT_STYLES } from '@/consts/formStyles';

export interface TextInputProps
    extends InputHTMLAttributes<HTMLInputElement>,
    Omit<FieldLayoutProps, 'children'> { }

export const TextInput: React.FC<TextInputProps> = ({
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
                className={`${BASE_INPUT_STYLES} ${className}`.trim()}
                {...props}
            />
        </FieldLayout>
    );
};