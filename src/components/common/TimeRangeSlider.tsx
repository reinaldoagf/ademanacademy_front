"use client";

import React, { useMemo } from "react";
import { Slider, ThemeProvider, createTheme } from "@mui/material";

const purpleTheme = createTheme({
    palette: {
        primary: {
            main: "#a855f7",
        },
    },
});

interface TimeRangeSliderProps {
    startTime: string; // Formato "HH:mm"
    endTime: string;   // Formato "HH:mm"
    onChange: (data: { startTime: string; endTime: string }) => void;
    disabled?: boolean;
}

const MIN_MINUTES = 8 * 60;   // 480 minutos (8:00 AM)
const MAX_MINUTES = 22 * 60;  // 1320 minutos (10:00 PM)
const STEP = 5;               // Saltos de 5 minutos

export default function TimeRangeSlider({
    startTime,
    endTime,
    onChange,
    disabled = false,
}: TimeRangeSliderProps) {

    // 1️⃣ Parseo de strings a minutos
    const sliderValue = useMemo(() => {
        const parseToMinutes = (timeStr: string, defaultMinutes: number) => {
            if (!timeStr) return defaultMinutes;
            const [h, m] = timeStr.split(":").map(Number);
            return h * 60 + m;
        };

        const start = parseToMinutes(startTime, MIN_MINUTES);
        const end = parseToMinutes(endTime, Math.min(start + 30, MAX_MINUTES));

        return [start, end];
    }, [startTime, endTime]);

    const [currentStart, currentEnd] = sliderValue;

    // 2️⃣ Formateador de minutos a texto legible
    const formatMinutes = (totalMinutes: number, is12h = false) => {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const formattedMin = String(minutes).padStart(2, "0");

        if (is12h) {
            const period = hours >= 12 ? "PM" : "AM";
            const h12 = hours % 12 === 0 ? 12 : hours % 12;
            return `${h12}:${formattedMin} ${period}`;
        }
        return `${String(hours).padStart(2, "0")}:${formattedMin}`;
    };

    // 3️⃣ Actualizador centralizado con validaciones de límites
    const updateRange = (newStart: number, newEnd: number) => {
        // Asegurar que se respeten los límites absolutos
        let start = Math.max(MIN_MINUTES, Math.min(newStart, MAX_MINUTES - STEP));
        let end = Math.max(MIN_MINUTES + STEP, Math.min(newEnd, MAX_MINUTES));

        // Evitar colisiones (manteninedo separación de al menos 5 min)
        if (end - start < STEP) {
            if (start !== currentStart) {
                end = start + STEP;
            } else {
                start = end - STEP;
            }
        }

        onChange({
            startTime: formatMinutes(start),
            endTime: formatMinutes(end),
        });
    };

    // Manejador para el arrastre del Slider
    const handleSliderChange = (_event: Event, newValue: number | number[]) => {
        if (!Array.isArray(newValue)) return;
        updateRange(newValue[0], newValue[1]);
    };

    // Ajustes por botón (+ / -)
    const adjustTime = (type: "start" | "end", amount: number) => {
        if (disabled) return;
        if (type === "start") {
            updateRange(currentStart + amount, currentEnd);
        } else {
            updateRange(currentStart, currentEnd + amount);
        }
    };

    const marks = [
        { value: 8 * 60, label: "8:00 AM" },
        { value: 12 * 60, label: "12:00 PM" },
        { value: 17 * 60, label: "5:00 PM" },
        { value: 22 * 60, label: "10:00 PM" },
    ];

    // Estilo común para los botones de control fino
    const btnClass = "w-6 h-6 cursor-pointer flex items-center justify-center text-xs font-bold bg-purple-50 text-purple-600 border border-purple-100 hover:bg-purple-100 active:scale-95 transition-all select-none disabled:opacity-40 disabled:pointer-events-none";

    return (
        <ThemeProvider theme={purpleTheme}>
            <div className="w-full bg-white border border-purple-100 p-4 shadow-sm">

                {/* Cabecera con Controles Incrementales */}
                <div className="flex justify-between items-center mb-5">

                    {/* Control Hora Inicio */}
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Hora Inicio</span>
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                disabled={disabled || currentStart <= MIN_MINUTES}
                                onClick={() => adjustTime("start", -STEP)}
                                className={btnClass}
                            >
                                -
                            </button>
                            <span className="text-xs font-bold text-gray-800 bg-gray-50 px-2.5 py-1 border border-gray-100 min-w-[76px] text-center">
                                {formatMinutes(currentStart, true)}
                            </span>
                            <button
                                type="button"
                                disabled={disabled || currentStart >= currentEnd - STEP}
                                onClick={() => adjustTime("start", STEP)}
                                className={btnClass}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <div className="h-[2px] w-6 bg-purple-200 mt-4 hidden sm:block" />

                    {/* Control Hora Fin */}
                    <div className="flex flex-col items-end gap-0.5">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Hora Fin</span>
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                disabled={disabled || currentEnd <= currentStart + STEP}
                                onClick={() => adjustTime("end", -STEP)}
                                className={btnClass}
                            >
                                -
                            </button>
                            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 border border-purple-100 min-w-[76px] text-center">
                                {formatMinutes(currentEnd, true)}
                            </span>
                            <button
                                type="button"
                                disabled={disabled || currentEnd >= MAX_MINUTES}
                                onClick={() => adjustTime("end", STEP)}
                                className={btnClass}
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>

                {/* Slider */}
                <div className="px-2 pb-1">
                    <Slider
                        value={sliderValue}
                        onChange={handleSliderChange}
                        min={MIN_MINUTES}
                        max={MAX_MINUTES}
                        step={STEP}
                        disabled={disabled}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(val) => formatMinutes(val, true)}
                        marks={marks}
                        sx={{
                            height: 6,
                            "& .MuiSlider-track": { border: "none" },
                            "& .MuiSlider-thumb": {
                                height: 18,
                                width: 18,
                                backgroundColor: "#fff",
                                border: "3px solid currentColor",
                                "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": { boxShadow: "inherit" },
                                "&::before": { display: "none" },
                            },
                            "& .MuiSlider-valueLabel": {
                                fontSize: "10px",
                                fontWeight: "600",
                                background: "#a855f7",
                                borderRadius: "6px",
                                padding: "4px 6px",
                            },
                            "& .MuiSlider-markLabel": {
                                fontSize: "10px",
                                color: "#9ca3af",
                                fontWeight: "500",
                                marginTop: "4px"
                            }
                        }}
                    />
                </div>
            </div>
        </ThemeProvider>
    );
}