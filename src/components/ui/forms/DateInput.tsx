// src/components/ui/forms/DateInput.tsx
import React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { FieldLayout, FieldLayoutProps } from './FieldLayout';
import { BASE_INPUT_STYLES } from '@/consts/formStyles';

// Helper corregido para interpretar strings sin desfase UTC
const parseDateValue = (val?: string | Date | null): Date | null => {
    if (!val) return null;
    if (val instanceof Date) {
        return isNaN(val.getTime()) ? null : val;
    }
    // Si viene en formato "YYYY-MM-DD", evitamos el desfase UTC dividiendo la cadena
    if (typeof val === 'string' && val.includes('-')) {
        const parts = val.split('T')[0].split('-');
        if (parts.length === 3) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // Los meses en JS van de 0 a 11
            const day = parseInt(parts[2], 10);
            return new Date(year, month, day);
        }
    }
    const parsed = new Date(val);
    return isNaN(parsed.getTime()) ? null : parsed;
};

export interface DateInputProps
    extends Omit<FieldLayoutProps, 'children'> {
    value: string | Date | null;
    onChange: (value: string) => void;
    showIcon?: boolean;
    minDate?: Date;
    maxDate?: Date;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
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
    minDate,
    maxDate,
    placeholder = "YYYY-MM-DD",
}) => {
    const selectedDate = parseDateValue(value);

    const handleChange = (date: Date | null) => {
        if (!date || isNaN(date.getTime())) {
            onChange('');
            return;
        }

        // 🌟 Usamos los métodos locales (getFullYear, getMonth, getDate) 
        // en lugar de toISOString() para evitar que el cambio de zona horaria reste un día.
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        onChange(`${year}-${month}-${day}`);
    };

    return (
        <FieldLayout
            label={label}
            labelColor={labelColor}
            containerClassName={containerClassName}
        >
            <div className="relative flex items-center w-full">
                {showIcon && (
                    <div className="absolute left-3 text-purple-400 pointer-events-none select-none z-10">
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

                <DatePicker
                    selected={selectedDate}
                    onChange={handleChange}
                    dateFormat="yyyy-MM-dd"
                    placeholderText={placeholder || 'YYYY-MM-DD'}
                    minDate={minDate}
                    maxDate={maxDate}
                    disabled={disabled}
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={100}
                    className={`
                        ${BASE_INPUT_STYLES}
                        ${showIcon ? 'pl-9' : ''}
                        text-gray-700
                        ${className}
                    `.trim()}
                    wrapperClassName="w-full"
                />
            </div>
        </FieldLayout>
    );
};