'use client';

import React from 'react';
import Datepicker, { DateValueType } from 'react-tailwindcss-datepicker';

export type DateRangeValue = DateValueType;

interface DateRangePickerProps {
    value: DateRangeValue;
    onChange: (newValue: DateRangeValue) => void;
    maxDate?: Date;
    minDate?: Date;
    placeholder?: string;
    primaryColor?: 'purple' | 'blue' | 'emerald' | 'indigo' | 'violet' | 'fuchsia';
    disabled?: boolean;
    className?: string;
}

export function DateRangePicker({
    value,
    onChange,
    maxDate = new Date(),
    minDate,
    placeholder = 'Seleccionar rango de fechas',
    primaryColor = 'purple',
    disabled = false,
    className,
}: DateRangePickerProps) {
    return (
        <div className={`relative z-50 w-full ${className || ''}`}>
            <Datepicker
                value={value}
                onChange={onChange}
                showShortcuts={true}
                primaryColor={primaryColor}
                displayFormat="DD/MM/YYYY"
                i18n="es"
                disabled={disabled}
                maxDate={maxDate}
                minDate={minDate}
                placeholder={placeholder}
                popoverDirection="down"
                containerClassName="date-range-picker-container"
                configs={{
                    shortcuts: {
                        today: 'Hoy',
                        yesterday: 'Ayer',
                        past: (period) => `Últimos ${period} días`,
                        currentMonth: 'Este mes',
                        pastMonth: 'El mes pasado',
                    },
                }}
            />
        </div>
    );
}