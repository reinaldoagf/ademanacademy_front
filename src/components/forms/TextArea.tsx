import React, { TextareaHTMLAttributes } from 'react';
import { FieldLayout, FieldLayoutProps } from './FieldLayout';
import { BASE_INPUT_STYLES } from '@/consts/formStyles';

export interface TextAreaProps
    extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    Omit<FieldLayoutProps, 'children'> { }

export const TextArea: React.FC<TextAreaProps> = ({
    label,
    labelColor,
    containerClassName,
    className = "",
    rows = 3,
    ...props
}) => {
    return (
        <FieldLayout
            label={label}
            labelColor={labelColor}
            containerClassName={containerClassName}
        >
            <textarea
                rows={rows}
                className={`${BASE_INPUT_STYLES} ${className}`.trim()}
                {...props}
            />
        </FieldLayout>
    );
};