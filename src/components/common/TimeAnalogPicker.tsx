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

    const dayjsValue = value ? dayjs(value, "HH:mm") : null;
    const minDayjs = dayjs(minTime, "HH:mm");
    const maxDayjs = dayjs(maxTime, "HH:mm");

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
                        ampm={true}
                        views={['hours', 'minutes']}
                        // 🌟 NUEVA SINTAXIS: Configuración directa en slotProps de la raíz
                        slotProps={{
                            htmlInput: {
                                // Tus clases exactas de Tailwind aplicadas directamente al elemento HTML <input>
                                className: "w-full p-2 border border-purple-100 bg-white focus:outline-none focus:border-purple-400 capitalize text-xs font-medium text-gray-800 cursor-pointer text-left rounded-lg transition-all",
                                readOnly: true,
                                required: true,
                            },
                            textField: {
                                // Limpieza del diseño heredado de Material UI
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