// src/features/eventos/components/AcademicCalendar.tsx
"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Clock, MapPin } from "lucide-react";

// 1. Estructura de datos demo para los eventos de la academia
interface DanceEvent {
  id: string;
  title: string;
  group: string;
  time: string;
  room: string;
  date: string; // Formato YYYY-MM-DD
  type: "ensayo" | "gala" | "clase-abierta";
}

const DEMO_EVENTS: DanceEvent[] = [
  { id: "1", title: "Ensayo Extra: Gala Anual", group: "Juvenil Avanzado", time: "04:30 PM", room: "Salón Principal", date: "2026-05-11", type: "ensayo" },
  { id: "2", title: "Evaluación de Niveles", group: "Baby Ballet", time: "09:00 AM", room: "Salón B", date: "2026-05-15", type: "clase-abierta" },
  { id: "3", title: "Masterclass de Salsa", group: "Adultos", time: "07:00 PM", room: "Salón Principal", date: "2026-05-22", type: "clase-abierta" },
  { id: "4", title: "Ensayo General de Vestuario", group: "Infantil Competencia", time: "11:00 AM", room: "Teatro Municipal", date: "2026-05-30", type: "gala" },
  { id: "5", title: "Clase Especial Intensiva", group: "Ritmos Urbanos", time: "06:00 PM", room: "Salón A", date: "2026-06-05", type: "clase-abierta" },
];

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const DAYS_OF_WEEK = ["D", "L", "M", "M", "J", "V", "S"];

export function AcademicCalendar() {
  // Inicializamos en Mayo de 2026 debido a los datos del Dashboard
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)); 
  const [selectedDate, setSelectedDate] = useState<string>("2026-05-11");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Cálculos de fechas nativos muy ligeros
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Generar los números de los días (incluyendo los espacios vacíos al inicio)
  const blanks = Array(firstDayOfMonth).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const calendarCells = [...blanks, ...days];

  // Navegación de meses
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Filtrar eventos del mes actual
  const currentMonthString = `${year}-${String(month + 1).padStart(2, "0")}`;
  
  // Eventos del día seleccionado actualmente
  const eventsOfSelectedDay = DEMO_EVENTS.filter(event => event.date === selectedDate);

  return (
    <div className="space-y-4">
      {/* HEADER DEL CALENDARIO */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-anton mb-4">Cronograma de Actividades</h3>
        <div className="flex items-center gap-1 bg-purple-50 p-1">
          <button onClick={prevMonth} className="p-1 hover:bg-white transition text-purple-600 cursor-pointer">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-purple-700 min-w-[80px] text-center">
            {MONTHS[month]} {year}
          </span>
          <button onClick={nextMonth} className="p-1 hover:bg-white transition text-purple-600 cursor-pointer">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MATRIZ MENSUAL */}
      <div className="bg-white/40 backdrop-blur-sm p-3 border border-purple-50">
        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">
          {DAYS_OF_WEEK.map((day, index) => (
            <span key={index} className="font-anton p-1">{day}</span>
          ))}
        </div>

        {/* Celdas de los días */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {calendarCells.map((day, index) => {
            if (day === null) {
              return <span key={`blank-${index}`} className="p-1.5 text-gray-200">·</span>;
            }

            const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isSelected = selectedDate === dateString;
            const hasEvents = DEMO_EVENTS.some(event => event.date === dateString);

            return (
              <button
                key={`day-${day}`}
                onClick={() => setSelectedDate(dateString)}
                className={`
                  p-1.5 font-medium font-anton transition relative cursor-pointer flex flex-col items-center justify-center h-8 w-8 mx-auto
                  ${isSelected 
                    ? "bg-purple-600 text-white font-bold shadow-sm shadow-purple-200" 
                    : "text-gray-700 hover:bg-purple-50"
                  }
                `}
              >
                {day}
                {/* Puntito indicador si ese día tiene eventos asignados */}
                {hasEvents && !isSelected && (
                  <span className="absolute bottom-1 w-1 h-1 bg-pink-500 rounded-full"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* DESPLIEGUE DE EVENTOS DEL DÍA SELECCIONADO */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          Eventos para el {selectedDate.split("-")[2]} de {MONTHS[parseInt(selectedDate.split("-")[1]) - 1]}
        </p>

        {eventsOfSelectedDay.length > 0 ? (
          eventsOfSelectedDay.map((event) => (
            <div 
              key={event.id} 
              className={`p-3 border-l-4 text-xs transition shadow-sm bg-white/60 ${
                event.type === "ensayo" ? "border-pink-400 text-pink-700" :
                event.type === "gala" ? "border-purple-500 text-purple-700" :
                "border-indigo-400 text-indigo-700"
              }`}
            >
              <p className="font-questrial font-bold text-gray-800">{event.title}</p>
              <p className="font-questrial font-medium text-gray-500 mt-0.5">{event.group}</p>
              
              <div className="flex gap-3 mt-2 text-[10px] text-gray-400 font-medium">
                <span className="font-questrial flex items-center gap-1"><Clock className="w-3 h-3" /> {event.time}</span>
                <span className="font-questrial flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.room}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 border border-dashed border-purple-100 text-center text-xs text-gray-400 bg-white/20">
            <CalendarDays className="w-5 h-5 mx-auto text-purple-300 mb-1" />
            No hay ensayos ni clases programadas.
          </div>
        )}
      </div>
    </div>
  );
}