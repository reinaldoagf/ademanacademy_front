// src/app/(dashboard)/client/classes/page.tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import {
  AlertCircle,
  Calendar,
  X,
  User,
  Search,
  Sparkles,
  BookmarkCheck,
  Flame,
  Users,
  Info,
  Clock
} from "lucide-react";
import HeroSection from '@/components/layout/HeroSection';
import { getMyRepresentedAction } from "@/app/actions/student";
import { Client } from "@/types/client";
import { Group } from "@/types/group";
import { WeekDay, BlockData } from "@/types/schedule";
const GRID_START_TIME = 8;
const GRID_END_TIME = 21;
const PIXELS_PER_HOUR = 60;

const DAYS: WeekDay[] = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
// Paleta de colores para asignar a cada grupo de forma única
const COLOR_PALETTE = [
  { bg: "bg-emerald-50 hover:bg-emerald-100/90", text: "text-emerald-700", border: "border-emerald-500", rawBorder: "border-emerald-700", labelBg: "bg-emerald-200/60" },
  { bg: "bg-indigo-50 hover:bg-indigo-100/90", text: "text-indigo-700", border: "border-indigo-500", rawBorder: "border-indigo-700", labelBg: "bg-indigo-200/60" },
  { bg: "bg-amber-50 hover:bg-amber-100/90", text: "text-amber-700", border: "border-amber-500", rawBorder: "border-amber-700", labelBg: "bg-amber-200/60" },
  { bg: "bg-pink-50 hover:bg-pink-100/90", text: "text-pink-700", border: "border-pink-500", rawBorder: "border-pink-700", labelBg: "bg-pink-200/60" },
  { bg: "bg-sky-50 hover:bg-sky-100/90", text: "text-sky-700", border: "border-sky-500", rawBorder: "border-sky-700", labelBg: "bg-sky-200/60" },
  { bg: "bg-rose-50 hover:bg-rose-100/90", text: "text-rose-700", border: "border-rose-500", rawBorder: "border-rose-700", labelBg: "bg-rose-200/60" },
];
export default function ClienteClasesPage() {
  const guideHours = Array.from({ length: GRID_END_TIME - GRID_START_TIME + 1 }, (_, i) => GRID_START_TIME + i);

  const [clients, setClients] = useState<Client[]>([]);
  const [activeClient, setActiveClient] = useState<Client | null>(null);
  const [selectedElement, setSelectedElement] = useState<{ id: string; block: BlockData, day: string, group: Group } | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  // Generador de Color determinista por ID de grupo
  const getGroupColor = (groupId: string) => {
    let hash = 0;
    for (let i = 0; i < groupId.length; i++) {
      hash = groupId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % COLOR_PALETTE.length;
    return COLOR_PALETTE[index];
  };
  const timeToMinutes = (timeStr: string): number => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  const getPositionStyles = (startTime: string, endTime: string) => {
    const minutosDesdeEje = timeToMinutes(startTime) - (GRID_START_TIME * 60);
    const duracion = timeToMinutes(endTime) - timeToMinutes(startTime);
    return {
      top: `${(minutosDesdeEje / 60) * PIXELS_PER_HOUR}px`,
      height: `${(duracion / 60) * PIXELS_PER_HOUR}px`
    };
  };
  // 🔄 Carga reactiva mediante Server Action
  useEffect(() => {
    const load = () => {
      startTransition(async () => {
        const res = await getMyRepresentedAction({ search: '' });
        if (!res.success) {
          setErrorMsg(res.error || "Ocurrió un error.");
          return;
        }
        if (res.success && res.data) {
          setClients(res.data);
          setActiveClient(res.data[0] || null);
        }
      });
    };

    const debounce = setTimeout(load, 300);
    return () => clearTimeout(debounce);
  }, []);
  return (
    <>
      {/* TOPBAR INFORMATIVA (Sin botón de agregar) */}
      <HeroSection
        htmlTitle={`<em class="text-[#5e0472]">Clases y Ensayos</em>`}
        htmlSubTitle={`Consulta los horarios, salones y asignaciones semanales.`}
      />

      <div className="p-4 md:p-8 w-full space-y-4">

        {errorMsg && (
          <div className="text-red-700 text-xs bg-red-50 p-3 border border-red-100 flex items-center gap-2 font-questrial animate-pulse">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}
        {/* 🎯 NUEVA SECCIÓN DE PESTAÑAS: HORARIO GENERAL VS GRUPOS (CON COLORES INDICADORES) */}
        <div className="flex items-center gap-1.5 border-b border-gray-200 overflow-x-auto pb-1">
          {clients?.map((client: Client) => {
            return (
              <button
                key={client.id}
                onClick={() => setActiveClient(client)}
                className={`px-3 py-2 font-questrial font-semibold text-xs transition flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer ${client.id == activeClient?.id
                  ? "border-purple-600 text-purple-700 bg-purple-50/40 font-bold"
                  : "border-transparent text-gray-500 hover:bg-gray-50"
                  }`}
              >
                {/* Indicador esférico de color del grupo */}
                <span className={`w-2.5 h-2.5 rounded-full bg-purple-600`} style={{ backgroundColor: "currentColor" }} />
                {client.firstName} {client.lastName}
              </button>
            );
          })}
        </div>

        {/* TIMELINE TIMELINE SEMANAL */}
        <div className="glass-card border border-purple-50 bg-white shadow-sm overflow-x-auto">
          <div className="min-w-[1000px] relative flex flex-col font-questrial text-xs">

            {/* Días */}
            <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b bg-purple-50/40 font-bold text-gray-700 text-center uppercase tracking-wider py-3 sticky top-0 bg-white z-10">
              <div className="border-r border-purple-100 flex items-center justify-center"><Clock className="w-3.5 h-3.5 text-purple-600" /></div>
              {DAYS.map((d, index) => <div key={d + '1-' + index} className="border-r border-purple-50 last:border-0 text-[11px] capitalize">{d}</div>)}
            </div>

            {/* Malla del Tiempo */}
            <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] relative" style={{ height: `${guideHours.length * PIXELS_PER_HOUR}px` }}>

              {/* Horas de Fondo */}
              {guideHours.map((hora, index) => (
                <div key={hora + '-' + index} className="absolute left-0 right-0 border-b border-gray-100 flex items-start pointer-events-none" style={{ top: `${index * PIXELS_PER_HOUR}px`, height: `${PIXELS_PER_HOUR}px` }}>
                  <span className="w-[80px] text-right pr-3 pt-1 text-[10px] font-bold text-gray-400">
                    {hora.toString().padStart(2, "0")}:00
                  </span>
                </div>
              ))}

              <div className="border-r border-gray-100 bg-gray-50/20"></div>

              {/* Columnas Interactivas  (todo) */}
              {activeClient &&
                DAYS.map((day: ('lunes' | 'martes' | 'miércoles' | 'jueves' | 'viernes' | 'sábado' | 'domingo'), index) => {
                  // 1. Obtenemos el grupo principal desde activeClient.group (que contiene schedules)
                  //    o como fallback desde activeClient.student?.group
                  const currentGroup = activeClient.group || activeClient.student?.group;

                  if (!currentGroup) return null;

                  // 2. Buscamos el horario correspondiente
                  //    Usamos los schedules del objeto group (que es donde vienen en la respuesta)
                  const schedulesList = activeClient.group?.schedules || currentGroup.schedules || [];
                  const currentSchedule = schedulesList.find(
                    (e: any) => String(e.groupId) === String(currentGroup.id)
                  );

                  if (!currentSchedule || !currentSchedule.schedule) return null;

                  // 3. Obtenemos los bloques del día actual de forma segura
                  const blocksOfTheDay = currentSchedule.schedule[day] || [];

                  return (
                    <div
                      key={`${day}-col-${index}`}
                      className="relative border-r border-gray-100/70 last:border-0 h-full bg-gray-50/5 transition-colors hover:bg-purple-50/10"
                    >
                      {blocksOfTheDay.map((e: BlockData, bIndex: number) => {
                        const positionStyle = getPositionStyles(e.startTime, e.endTime);
                        const isSelected = selectedElement?.id === e.id;
                        const metaColor = getGroupColor(currentGroup.id);

                        return (
                          <div
                            key={e.id ? `${e.id}-${bIndex}` : `${day}-${bIndex}`}
                            onClick={(evt) => {
                              evt.stopPropagation();
                              setSelectedElement({
                                id: e.id,
                                block: e,
                                day: day,
                                group: currentGroup
                              });
                            }}
                            style={positionStyle}
                            className={`absolute left-1 right-1 p-2 border-l-4 overflow-hidden transition-all shadow-sm cursor-grab active:cursor-grabbing flex flex-col justify-between text-[11px] ${isSelected
                              ? "bg-purple-700 text-white border-purple-900 z-20 scale-[1.01]"
                              : `${metaColor.bg} ${metaColor.text}${metaColor.border} z-10`
                              }`}
                          >
                            <div className="font-bold tracking-tight uppercase text-[10px] truncate leading-tight">
                              {currentGroup.name}
                            </div>
                            <div className="flex items-center justify-between text-[9px] opacity-95">
                              <span className="font-semibold">
                                {e.startTime} - {e.endTime}
                              </span>
                              {e.label && (
                                <span
                                  className={`px-1 rounded text-[8px] truncate max-w-[60px] ${isSelected ? "bg-purple-900" : metaColor.labelBg
                                    }`}
                                >
                                  {e.label}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
            </div>

          </div>
        </div>
      </div>

      {/* ================= INSPECTOR LATERAL (DRAWER) ================= */}
      {selectedElement && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl border-l border-purple-100 z-50 flex flex-col font-questrial text-xs animate-in slide-in-from-right duration-150 h-full">

          {/* Cabecera (Fija) */}
          <div className="p-4 bg-purple-50/50 border-b border-purple-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5 font-bold uppercase text-gray-700 text-[11px]">
              <Info className="w-4 h-4 text-gray-600" /> Propiedades del Bloque
            </div>
            <button onClick={() => setSelectedElement(null)} className="cursor-pointer p-1 hover:bg-purple-100 text-gray-400 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cuerpo Principal (Scrolleable para los datos del bloque) */}
          <div className="p-5 space-y-4 shrink-0 border-b border-gray-100">
            {selectedElement && selectedElement.group && (
              <div>
                <span className="text-[9px] font-bold bg-pink-100 text-pink-700 px-1.5 py-0.5 capitalize">
                  {selectedElement.group.category?.name || "Sin Categoría"}
                </span>
                <h4 className="font-anton text-gray-800 text-base mt-2 uppercase tracking-wide leading-tight">
                  {selectedElement.group.name}
                </h4>
              </div>
            )}

            <div className="space-y-3 border-t border-gray-100 pt-3 text-gray-600">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-[9px] text-gray-400 font-bold">Día</p>
                  <p className="font-medium text-gray-800 capitalize">{selectedElement.day}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-[9px] text-gray-400 font-bold">Horario Actual</p>
                  <p className="font-medium text-gray-800">
                    {selectedElement.block.startTime} a {selectedElement.block.endTime}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-[9px] text-gray-400 font-bold">Profesor</p>
                  <p className="font-medium text-gray-800">{selectedElement.group.instructor?.firstName} {selectedElement.group.instructor?.lastName}</p>
                </div>
              </div>
            </div>

          </div>


        </div>
      )}
    </>
  );
}