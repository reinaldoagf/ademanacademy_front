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
                className={`cursor-pointer ${BASE_INPUT_STYLES} ${className}`.trim()}
                {...props}
            >
                {options.map((opt, index) => (
                    <option
                        key={index}
                        value={opt.value}
                        disabled={opt.disabled}
                        className="cursor-pointer border border-purple-100 bg-purple-100 text-purple-700 px-1.5 py-0.5 font-sans"
                    >
                        {opt.label}
                    </option>
                ))}
            </select>
        </FieldLayout>
    );
};