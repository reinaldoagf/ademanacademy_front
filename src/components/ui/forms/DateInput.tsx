import React, { InputHTMLAttributes } from 'react';
import { FieldLayout, FieldLayoutProps } from './FieldLayout';
import { BASE_INPUT_STYLES } from '@/consts/formStyles';

// Helper interno para formatear instancias de Date a formato YYYY-MM-DD
const formatDateValue = (val?: string | Date | null): string => {
    if (!val) return '';
    if (val instanceof Date) {
        if (isNaN(val.getTime())) return '';
        return val.toISOString().split('T')[0];
    }
    return val;
};

export interface DateInputProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'>,
    Omit<FieldLayoutProps, 'children'> {
    value: string | Date | null;
    onChange: (value: string) => void;
    showIcon?: boolean;
    min?: string;
    max?: string;
}

export const DateInput: React.FC<DateInputProps> = ({
    label,
    labelColor,
    containerClassName,
    value,
    onChange,
    showIcon = true,
    disabled = false,
    className = "",
    min,
    max,
    ...props
}) => {
    const formattedValue = formatDateValue(value);

    return (
        <FieldLayout
            label={label}
            labelColor={labelColor}
            containerClassName={containerClassName}
        >
            <div className="relative flex items-center">
                {/* Icono de Calendario */}
                {showIcon && (
                    <div className="absolute left-2.5 text-purple-400 pointer-events-none select-none">
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
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                )}

                {/* Input de Fecha */}
                <input
                    {...props}
                    type="date"
                    min={min}
                    max={max}
                    disabled={disabled}
                    value={formattedValue}
                    onChange={(e) => onChange(e.target.value)}
                    className={`
            ${BASE_INPUT_STYLES}
            ${showIcon ? 'pl-9' : ''}
            text-gray-700
            scheme-light
            [&::-webkit-calendar-picker-indicator]:cursor-pointer
            [&::-webkit-calendar-picker-indicator]:opacity-60
            [&::-webkit-calendar-picker-indicator]:hover:opacity-100
            ${className}
          `.trim()}
                />
            </div>
        </FieldLayout>
    );
};