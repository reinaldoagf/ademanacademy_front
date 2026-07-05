"use client";

import React, { ChangeEvent } from "react";

interface TimeRangePickerProps {
    startTime: string; // Formato "HH:mm"
    endTime: string;   // Formato "HH:mm"
    onChange: (data: { startTime: string; endTime: string }) => void;
    minTime?: string;  // Límite mínimo general, ej: "08:00"
    maxTime?: string;  // Límite máximo general, ej: "21:00"
    disabled?: boolean;
}

export default function TimeRangePicker({
    startTime,
    endTime,
    onChange,
    minTime = "08:00",
    maxTime = "21:00",
    disabled = false,
}: TimeRangePickerProps) {

    const handleStartChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newStart = e.target.value;
        let newEnd = endTime;

        // Si la nueva hora de inicio supera o iguala a la hora de fin actual,
        // reiniciamos o empujamos la hora de fin para mantener coherencia
        if (endTime && endTime <= newStart) {
            newEnd = "";
        }

        onChange({ startTime: newStart, endTime: newEnd });
    };

    const handleEndChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newEnd = e.target.value;
        onChange({ startTime, endTime: newEnd });
    };

    return (
        <div className="w-full bg-gray-50/50 border border-gray-100 p-3 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-2">
                Rango Horario Laboral (8:00 AM - 9:00 PM)
            </span>

            <div className="flex items-center gap-2">
                {/* Hora Inicio */}
                <div className="flex-1 flex flex-col gap-1 bg-white p-2 border border-purple-100 rounded-lg focus-within:border-purple-400 transition-all">
                    <span className="text-[9px] font-semibold text-purple-500 uppercase tracking-tight">
                        Inicio *
                    </span>
                    <input
                        type="time"
                        value={startTime}
                        min={minTime}
                        max={maxTime}
                        disabled={disabled}
                        onChange={handleStartChange}
                        className="w-full bg-transparent text-xs font-medium text-gray-800 outline-none cursor-pointer [color-scheme:light]"
                        required
                    />
                </div>

                <div className="text-gray-400 font-medium text-xs px-1 select-none">a</div>

                {/* Hora Fin */}
                <div className={`flex-1 flex flex-col gap-1 bg-white p-2 border border-purple-100 rounded-lg focus-within:border-purple-400 transition-all ${!startTime || disabled ? "opacity-50 pointer-events-none bg-gray-50" : ""}`}>
                    <span className="text-[9px] font-semibold text-purple-500 uppercase tracking-tight">
                        Fin *
                    </span>
                    <input
                        type="time"
                        value={endTime}
                        // El mínimo de la hora fin es dinámicamente la hora de inicio elegida
                        min={startTime || minTime}
                        max={maxTime}
                        disabled={disabled || !startTime}
                        onChange={handleEndChange}
                        className="w-full bg-transparent text-xs font-medium text-gray-800 outline-none cursor-pointer [color-scheme:light]"
                        required
                    />
                </div>
            </div>
        </div>
    );
}