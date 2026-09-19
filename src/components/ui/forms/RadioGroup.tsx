import React, { InputHTMLAttributes } from 'react';
import { FieldLayout, FieldLayoutProps } from './FieldLayout';

export interface RadioOption<T = string | number | boolean> {
    label: string;
    value: T;
    disabled?: boolean;
}

export interface RadioGroupProps<T = string | number | boolean>
    extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>,
    Omit<FieldLayoutProps, 'children'> {
    name: string;
    value: T;
    options: RadioOption<T>[];
    onChange: (value: T) => void;
    direction?: 'horizontal' | 'vertical'; // Permite mostrar los radios en fila o columna
}

export function RadioGroup<T = string | number | boolean>({
    label,
    labelColor,
    containerClassName,
    name,
    value,
    options,
    onChange,
    direction = 'horizontal',
    disabled = false,
    className = "",
    ...props
}: RadioGroupProps<T>) {
    const layoutClasses = direction === 'horizontal'
        ? 'flex flex-wrap gap-4 items-center mt-1.5 p-1'
        : 'flex flex-col gap-2 mt-1.5 p-1';

    return (
        <FieldLayout
            label={label}
            labelColor={labelColor}
            containerClassName={containerClassName}
        >
            <div className={layoutClasses}>
                {options.map((option, index) => {
                    const isChecked = value === option.value;
                    const isDisabled = disabled || option.disabled;

                    return (
                        <label
                            key={`${name}-${index}`}
                            className={`flex items-center gap-1.5 text-xs font-questrial ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                                }`}
                        >
                            <input
                                {...props}
                                type="radio"
                                name={name}
                                checked={isChecked}
                                disabled={isDisabled}
                                onChange={() => onChange(option.value)}
                                className={`accent-purple-600 w-3.5 h-3.5 ${className}`.trim()}
                            />
                            <span className="text-gray-700">{option.label}</span>
                        </label>
                    );
                })}
            </div>
        </FieldLayout>
    );
}