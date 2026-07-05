// src/components/common/TimeGridPicker.tsx
"use client";

import React, { useMemo } from "react";

interface TimeGridPickerProps {
    label: string;
    value: string;
    onChange: (timeStr: string) => void;
    minTime?: string; // Formato "HH:mm" ej: "08:00"
    maxTime?: string; // Formato "HH:mm" ej: "21:00"
    disabled?: boolean;
    intervalMinutes?: number; // Permite cambiar el salto de minutos (15, 30, 60)
}

export default function TimeGridPicker({
    label,
    value,
    onChange,
    minTime = "08:00",
    maxTime = "21:00",
    disabled = false,
    intervalMinutes = 30, // Saltos de 30 minutos (ej: 08:00, 08:30, 09:00...)
}: TimeGridPickerProps) {

    // Generar las opciones de horas en formato de 12 horas pero valor de 24 horas
    const timeOptions = useMemo(() => {
        const options = [];

        const [minH, minM] = minTime.split(":").map(Number);
        const [maxH, maxM] = maxTime.split(":").map(Number);

        let currentMinutes = minH * 60 + minM;
        const endMinutes = maxH * 60 + maxM;

        while (currentMinutes <= endMinutes) {
            const h = Math.floor(currentMinutes / 60);
            const m = currentMinutes % 60;

            // Formato de 24 horas para el valor del value
            const time24 = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

            // Formato legible de 12 horas para el usuario (AM/PM)
            const period = h >= 12 ? "PM" : "AM";
            const h12 = h % 12 === 0 ? 12 : h % 12;
            const label12 = `${h12}:${String(m).padStart(2, "0")} ${period}`;

            options.push({ value: time24, label: label12 });
            currentMinutes += intervalMinutes;
        }

        return options;
    }, [minTime, maxTime, intervalMinutes]);

    return (
        <div className="flex flex-col gap-1 w-full">
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                {label}
            </label>
            <select
                disabled={disabled}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full p-2 border border-purple-100 bg-white focus:outline-none focus:border-purple-400 text-xs font-medium text-gray-800 rounded-lg transition-all cursor-pointer disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200"
                required
            >
                <option value="" disabled hidden>
                    --:--
                </option>
                {timeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}