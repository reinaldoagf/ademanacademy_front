'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Clock, MapPin, Loader2 } from 'lucide-react';

interface DanceEvent {
  id: string;
  title: string;
  group: string;
  time: string;
  room: string;
  date: string; // YYYY-MM-DD
  type: 'ensayo' | 'gala' | 'clase-abierta' | 'clase-regular';
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAYS_OF_WEEK = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

// Reemplaza con la ruta de tu Server Action o API client
import { getAcademicCalendarEvents } from '@/app/actions/metric';

export function AcademicCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [events, setEvents] = useState<DanceEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Cargar eventos del mes seleccionado
  useEffect(() => {
    async function fetchCalendarData() {
      setIsLoading(true);
      try {
        const res = await getAcademicCalendarEvents(year, month + 1);
        if (res.success && res.data) {
          setEvents(res.data);
        }
      } catch (error) {
        console.error('Error cargando calendario:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCalendarData();
  }, [year, month]);

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const blanks = Array(firstDayOfMonth).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const calendarCells = [...blanks, ...days];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const eventsOfSelectedDay = events.filter((event) => event.date === selectedDate);

  return (
    <div className="glass-card p-6 shadow-sm">
      <div className="space-y-4">
        {/* HEADER DEL CALENDARIO */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-anton mb-4">Cronograma de Actividades</h3>
          <div className="flex items-center gap-1 bg-[#5e0472] p-1 rounded-md">
            <button onClick={prevMonth} className="p-1 hover:bg-[#6e0372] transition text-white cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-white min-w-[80px] text-center">
              {MONTHS[month]} {year}
            </span>
            <button onClick={nextMonth} className="p-1 hover:bg-[#6e0372] transition text-white cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MATRIZ MENSUAL */}
        <div className="bg-white/40 backdrop-blur-sm p-3 border border-purple-50 rounded-xl relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-xl">
              <Loader2 className="w-5 h-5 animate-spin text-purple-700" />
            </div>
          )}

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">
            {DAYS_OF_WEEK.map((day, index) => (
              <span key={index} className="font-anton p-1">{day}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {calendarCells.map((day, index) => {
              if (day === null) {
                return <span key={`blank-${index}`} className="p-1.5 text-gray-200">·</span>;
              }

              const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = selectedDate === dateString;
              const hasEvents = events.some((event) => event.date === dateString);

              return (
                <button
                  key={`day-${day}`}
                  onClick={() => setSelectedDate(dateString)}
                  className={`
                  p-1.5 font-medium font-anton transition relative cursor-pointer flex flex-col items-center justify-center h-8 w-8 mx-auto rounded-md
                  ${isSelected
                      ? 'bg-[#5e0472] text-white font-bold shadow-sm shadow-[#5e0472]'
                      : 'text-gray-700 hover:bg-purple-50'
                    }
                `}
                >
                  {day}
                  {hasEvents && !isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 bg-[#f472b6] rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* DESPLIEGUE DE EVENTOS DEL DÍA SELECCIONADO */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Eventos para el {selectedDate.split('-')[2]} de {MONTHS[parseInt(selectedDate.split('-')[1]) - 1]}
          </p>

          {eventsOfSelectedDay.length > 0 ? (
            eventsOfSelectedDay.map((event) => (
              <div
                key={event.id}
                className={`p-3 border-l-4 text-xs transition shadow-sm bg-white/60 rounded-r-md ${event.type === 'ensayo' ? 'border-pink-400 text-pink-700' :
                  event.type === 'gala' ? 'border-purple-500 text-purple-700' :
                    event.type === 'clase-regular' ? 'border-emerald-400 text-emerald-700' :
                      'border-indigo-400 text-indigo-700'
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
            <div className="p-4 border border-dashed border-purple-100 text-center text-xs text-gray-400 bg-white/20 rounded-xl">
              <CalendarDays className="w-5 h-5 mx-auto text-purple-300 mb-1" />
              No hay ensayos ni clases programadas.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}