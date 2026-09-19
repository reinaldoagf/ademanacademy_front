import React, { SelectHTMLAttributes } from 'react';
import { FieldLayout, FieldLayoutProps } from './FieldLayout';
import { BASE_INPUT_STYLES } from '@/consts/formStyles';

export interface SelectOption {
    label: string;
    value: string | number;
    disabled?: boolean;
}

export interface SelectInputProps
    extends SelectHTMLAttributes<HTMLSelectElement>,
    Omit<FieldLayoutProps, 'children'> {
    options: SelectOption[];
}

export const SelectInput: React.FC<SelectInputProps> = ({
    label,
    labelColor,
    containerClassName,
    className = "",
    options,
    ...props
}) => {
    return (
        <FieldLayout
            label={label}
            labelColor={labelColor}
            containerClassName={containerClassName}
        >
            <select
                className={`${BASE_INPUT_STYLES} ${className}`.trim()}
                {...props}
            >
                {options.map((opt, index) => (
                    <option
                        key={index}
                        value={opt.value}
                        disabled={opt.disabled}
                        className="font-bold cursor-pointer text-purple-700 bg-purple-50"
                    >
                        {opt.label}
                    </option>
                ))}
            </select>
        </FieldLayout>
    );
};