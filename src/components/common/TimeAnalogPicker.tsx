// src/components/common/TimeAnalogPicker.tsx
"use client";

import React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const purpleTheme = createTheme({
    palette: {
        primary: {
            main: "#a855f7",
        },
    },
});

interface TimeAnalogPickerProps {
    label: string;
    value: string;
    onChange: (timeStr: string) => void;
    minTime?: string;
    maxTime?: string;
    disabled?: boolean;
}

export default function TimeAnalogPicker({
    label,
    value,
    onChange,
    minTime = "08:00",
    maxTime = "21:00",
    disabled = false,
}: TimeAnalogPickerProps) {

    // 🌟 Seteamos una fecha base idéntica (hoy) para evitar desfases de días en las comparaciones
    const baseDateStr = dayjs().format("YYYY-MM-DD");

    const dayjsValue = value ? dayjs(`${baseDateStr} ${value}`, "YYYY-MM-DD HH:mm") : null;
    const minDayjs = dayjs(`${baseDateStr} ${minTime}`, "YYYY-MM-DD HH:mm");
    const maxDayjs = dayjs(`${baseDateStr} ${maxTime}`, "YYYY-MM-DD HH:mm");

    // 🌟 Validación unificada y exacta tanto para la vista de horas como de minutos
    const handleDisableTime = (timeValue: Dayjs, view: "hours" | "minutes" | "seconds") => {
        // Forzamos a que el clon temporal use exactamente el mismo día base para la validación limpia
        const normalizedTime = timeValue.date(dayjs().date()).month(dayjs().month()).year(dayjs().year());

        if (view === "hours") {
            // Evaluamos solo a nivel de hora (ignorando minutos para no bloquear el círculo analógico prematuramente)
            const hour = normalizedTime.hour();
            return hour < minDayjs.hour() || hour > maxDayjs.hour();
        }

        if (view === "minutes") {
            // Comparación estricta al minuto en los extremos PM/AM
            return normalizedTime.isBefore(minDayjs) || normalizedTime.isAfter(maxDayjs);
        }

        return false;
    };

    return (
        <ThemeProvider theme={purpleTheme}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <div className="flex flex-col gap-1 w-full">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        {label}
                    </label>

                    <MobileTimePicker
                        disabled={disabled}
                        value={dayjsValue}
                        onChange={(newValue: Dayjs | null) => {
                            if (newValue && newValue.isValid()) {
                                onChange(newValue.format("HH:mm"));
                            }
                        }}
                        minTime={minDayjs}
                        maxTime={maxDayjs}
                        // 🌟 Se utiliza la función unificada que respeta los cambios de cuadrante PM sin bloquearse
                        shouldDisableTime={handleDisableTime}
                        ampm={true}
                        views={['hours', 'minutes']}
                        slotProps={{
                            htmlInput: {
                                className: "w-full p-2 border border-purple-100 bg-white focus:outline-none focus:border-purple-400 capitalize text-xs font-medium text-gray-800 cursor-pointer text-left rounded-lg transition-all",
                                readOnly: true,
                                required: true,
                            },
                            textField: {
                                sx: {
                                    width: "100%",
                                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                                    "& .MuiOutlinedInput-root": { padding: 0 }
                                }
                            }
                        }}
                    />
                </div>
            </LocalizationProvider>
        </ThemeProvider>
    );
}