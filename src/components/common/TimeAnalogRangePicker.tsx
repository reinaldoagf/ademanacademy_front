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
        primary: { main: "#a855f7" },
    },
});

interface TimeAnalogRangePickerProps {
    startTime: string; // "HH:mm"
    endTime: string;   // "HH:mm"
    onChange: (data: { startTime: string; endTime: string }) => void;
    minTimeLimit?: string; // Límite de apertura general (ej: "08:00")
    maxTimeLimit?: string; // Límite de cierre general (ej: "21:00")
    disabled?: boolean;
}

export default function TimeAnalogRangePicker({
    startTime,
    endTime,
    onChange,
    minTimeLimit = "08:00",
    maxTimeLimit = "21:00",
    disabled = false,
}: TimeAnalogRangePickerProps) {

    // 🌟 Seteamos el día de hoy como fecha base estricta para evitar desfases internos en MUI
    const todayStr = dayjs().format("YYYY-MM-DD");

    const startDayjs = startTime ? dayjs(`${todayStr} ${startTime}`, "YYYY-MM-DD HH:mm") : null;
    const endDayjs = endTime ? dayjs(`${todayStr} ${endTime}`, "YYYY-MM-DD HH:mm") : null;

    const globalMinDayjs = dayjs(`${todayStr} ${minTimeLimit}`, "YYYY-MM-DD HH:mm");
    const globalMaxDayjs = dayjs(`${todayStr} ${maxTimeLimit}`, "YYYY-MM-DD HH:mm");

    // --- VALIDACIONES RELOJ DE INICIO ---
    const disableHourStart = (hour: number) => {
        return hour < globalMinDayjs.hour() || hour > globalMaxDayjs.hour();
    };

    const disableMinuteStart = (minute: number, hour: number) => {
        if (hour === globalMinDayjs.hour()) return minute < globalMinDayjs.minute();
        if (hour === globalMaxDayjs.hour()) return minute > globalMaxDayjs.minute();
        return false;
    };

    // --- VALIDACIONES RELOJ DE FIN (Reactivo a la Hora de Inicio) ---
    const disableHourEnd = (hour: number) => {
        // Si ya hay hora de inicio seleccionada, el mínimo analógico es la hora elegida
        const activeMinHour = startDayjs ? startDayjs.hour() : globalMinDayjs.hour();
        return hour < activeMinHour || hour > globalMaxDayjs.hour();
    };

    const disableMinuteEnd = (minute: number, hour: number) => {
        if (startDayjs && hour === startDayjs.hour()) {
            return minute <= startDayjs.minute(); // Bloquea minutos menores o iguales para evitar bloques de 0 mins
        }
        if (hour === globalMaxDayjs.hour()) {
            return minute > globalMaxDayjs.minute();
        }
        return false;
    };

    // Estilos Tailwind reutilizables eliminando el diseño nativo de MUI
    const slotPropsStyles = {
        htmlInput: {
            className: "w-full p-2 border border-purple-100 bg-white focus:outline-none focus:border-purple-400 capitalize text-xs font-medium text-gray-800 cursor-pointer text-left rounded-lg transition-all disabled:bg-gray-50 disabled:text-gray-400",
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
    };

    return (
        <ThemeProvider theme={purpleTheme}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <div className="grid grid-cols-2 gap-2 w-full">

                    {/* RELOJ ANALÓGICO: HORA INICIO */}
                    <div className="flex flex-col gap-1 w-full">
                        <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                            Hora Inicio *
                        </label>
                        <MobileTimePicker
                            disabled={disabled}
                            value={startDayjs}
                            onChange={(newValue: Dayjs | null) => {
                                if (newValue && newValue.isValid()) {
                                    const formattedStart = newValue.format("HH:mm");
                                    // Si el nuevo inicio pisa o supera al fin actual, reiniciamos el fin
                                    const formattedEnd = (endTime && endTime > formattedStart) ? endTime : "";
                                    onChange({ startTime: formattedStart, endTime: formattedEnd });
                                }
                            }}
                            // 🌟 Dejamos los límites estáticos generales para no romper el renderizador de AM/PM
                            minTime={globalMinDayjs}
                            maxTime={globalMaxDayjs}
                            shouldDisableHour={disableHourStart}
                            shouldDisableMinute={disableMinuteStart}
                            ampm={true}
                            views={['hours', 'minutes']}
                            slotProps={slotPropsStyles}
                        />
                    </div>

                    {/* RELOJ ANALÓGICO: HORA FIN */}
                    <div className="flex flex-col gap-1 w-full">
                        <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                            Hora Fin *
                        </label>
                        <MobileTimePicker
                            disabled={disabled || !startTime}
                            value={endDayjs}
                            onChange={(newValue: Dayjs | null) => {
                                if (newValue && newValue.isValid()) {
                                    onChange({ startTime, endTime: newValue.format("HH:mm") });
                                }
                            }}
                            // 🌟 Mantenemos los rangos abiertos en la inicialización...
                            minTime={globalMinDayjs}
                            maxTime={globalMaxDayjs}
                            // 🌟 ...Pero delegamos el bloqueo dinámico estricto a las funciones por aguja
                            shouldDisableHour={disableHourEnd}
                            shouldDisableMinute={disableMinuteEnd}
                            ampm={true}
                            views={['hours', 'minutes']}
                            slotProps={slotPropsStyles}
                        />
                    </div>

                </div>
            </LocalizationProvider>
        </ThemeProvider>
    );
}