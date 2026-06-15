// src/app/(dashboard)/admin/schedule/page.tsx
"use client";
import { useEffect, useState, useTransition } from "react";
import {
    Sparkles,
    Clock,
    MapPin,
    User,
    X,
    ChevronRight,
    Calendar,
    Info,
    Plus,
    AlertCircle,
    Grid
} from "lucide-react";
import { toast } from "react-hot-toast";
import HeroSection from "@/components/layout/HeroSection";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { Group } from "@/types/group";
import { Classroom } from "@/types/classroom";
import { WeekDay, BlockData } from "@/types/schedule";
import { getAllClassroomsAction } from "@/app/actions/classroom";

const HORA_INICIO_GRID = 8;
const HORA_FIN_GRID = 21;
const PIXELS_PER_HOUR = 60;

const DIAS: WeekDay[] = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

// Paleta de colores para asignar a cada grupo de forma única
const COLOR_PALETTE = [
    { bg: "bg-emerald-50 hover:bg-emerald-100/90", text: "text-emerald-700", border: "border-emerald-500", rawBorder: "border-emerald-700", labelBg: "bg-emerald-200/60" },
    { bg: "bg-indigo-50 hover:bg-indigo-100/90", text: "text-indigo-700", border: "border-indigo-500", rawBorder: "border-indigo-700", labelBg: "bg-indigo-200/60" },
    { bg: "bg-amber-50 hover:bg-amber-100/90", text: "text-amber-700", border: "border-amber-500", rawBorder: "border-amber-700", labelBg: "bg-amber-200/60" },
    { bg: "bg-pink-50 hover:bg-pink-100/90", text: "text-pink-700", border: "border-pink-500", rawBorder: "border-pink-700", labelBg: "bg-pink-200/60" },
    { bg: "bg-sky-50 hover:bg-sky-100/90", text: "text-sky-700", border: "border-sky-500", rawBorder: "border-sky-700", labelBg: "bg-sky-200/60" },
    { bg: "bg-rose-50 hover:bg-rose-100/90", text: "text-rose-700", border: "border-rose-500", rawBorder: "border-rose-700", labelBg: "bg-rose-200/60" },
];

export default function SchedulePage() {
    const [activeClassroom, setActiveClassroom] = useState<Classroom | null>(null);
    const [selectedElement, setSelectedElement] = useState<{ id: string; block: BlockData, day: string, group: Group } | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        type: "simple" | "word" | "email";
        title: string;
        description: string;
        requiredWord?: string;
        userEmail?: string;
        id?: string;
    }>({
        isOpen: false,
        type: "word",
        title: "",
        description: "",
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [isPending, startTransition] = useTransition();

    const [classrooms, setClassrooms] = useState<Classroom[]>([]);

    // 🎯 NUEVO ESTADO: Filtro por Grupos (Pestañas de Grupo)
    // "all" significa ver la agenda completa con todos los grupos superpuestos por colores.
    const [activeGroupFilter, setActiveGroupFilter] = useState<string>("all");

    // Estados para modales
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

    const [newBlockData, setNewBlockData] = useState({
        groupId: "", day: "lunes" as WeekDay, startTime: "", endTime: "", label: ""
    });

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

    const minutesToTime = (mins: number): string => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    };

    const getPositionStyles = (startTime: string, endTime: string) => {
        const minutosDesdeEje = timeToMinutes(startTime) - (HORA_INICIO_GRID * 60);
        const duracion = timeToMinutes(endTime) - timeToMinutes(startTime);
        return {
            top: `${(minutosDesdeEje / 60) * PIXELS_PER_HOUR}px`,
            height: `${(duracion / 60) * PIXELS_PER_HOUR}px`
        };
    };

    // ================= DRAG AND DROP CON FILTRADO DE COLOR =================
    const handleDragStart = (e: React.DragEvent, blockId: string, realGroupId: string, originDay: WeekDay) => {
        // Nos aseguramos de guardar el ID real del grupo, nunca "all"
        e.dataTransfer.setData("text/plain", JSON.stringify({ blockId, groupId: realGroupId, originDay }));
        setErrorMsg(null);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, targetDay: WeekDay) => {
        e.preventDefault();
        setErrorMsg(null);

        try {
            const rawData = e.dataTransfer.getData("text/plain");
            if (!rawData) return;
            const { blockId, groupId, originDay } = JSON.parse(rawData);

            const rect = e.currentTarget.getBoundingClientRect();
            const relativeY = e.clientY - rect.top;

            // Cálculo de tiempos basado en la posición del contenedor (redondeado a bloques de 15 min)
            const minutosTotalesDrop = Math.round((relativeY / PIXELS_PER_HOUR) * 4) * 15;
            const newMinutesHome = (HORA_INICIO_GRID * 60) + minutosTotalesDrop;

            // 1. Buscar el grupo y su agenda correspondiente al salón activo
            const targetGroup = activeClassroom?.groups.find(g => g.id === groupId);
            const targetScheduleRelation = targetGroup?.schedules?.find((s: any) => s.classroomId === activeClassroom?.id);

            // 2. Buscar el bloque original dentro del día de origen
            const targetBlock = targetScheduleRelation?.schedule?.[originDay]?.find((b: BlockData) => b.id === blockId);

            if (!targetGroup || !targetScheduleRelation || !targetBlock) {
                console.warn("No se encontró el bloque o grupo de origen.");
                return;
            }

            const originalDuration = timeToMinutes(targetBlock.endTime) - timeToMinutes(targetBlock.startTime);
            const newMinutesEnd = newMinutesHome + originalDuration;

            // Validación: Límites de apertura/cierre de la grilla
            if (newMinutesEnd > (HORA_FIN_GRID * 60)) {
                setErrorMsg("El bloque excede el horario de cierre de la academia.");
                return;
            }

            // 3. Validación de colisiones contra TODOS los bloques del salón activo en el día destino
            const tieneColision = activeClassroom?.groups.some((g: any) => {
                const grupoSchedule = g.schedules?.find((s: any) => s.classroomId === activeClassroom.id);
                const blocksForDay = grupoSchedule?.schedule?.[targetDay] || [];

                return blocksForDay.some((b: any) => {
                    // Excluir de la colisión a sí mismo si se está moviendo dentro del mismo día y grupo
                    if (b.id === blockId && g.id === groupId && targetDay === originDay) return false;

                    const exStart = timeToMinutes(b.startTime);
                    const exEnd = timeToMinutes(b.endTime);
                    return (newMinutesHome < exEnd && newMinutesEnd > exStart);
                });
            });

            if (tieneColision) {
                setErrorMsg(`Conflicto de agenda: Ya existe una clase en ese rango de horas el día ${targetDay}.`);
                return;
            }

            // 4. Actualización correcta e inmutable de activeClassroom
            setActiveClassroom(prev => {
                if (!prev) return prev;

                // Mapeamos los grupos del salón para alterar solo el afectado
                const updatedGroups = prev.groups.map((g: any) => {
                    if (g.id !== groupId) return g;

                    // Mapeamos las relaciones de horarios del grupo afectado
                    const updatedSchedules = g.schedules.map((s: any) => {
                        if (s.classroomId !== prev.id) return s;

                        const currentDayBlocks = s.schedule[originDay] || [];
                        const targetDayBlocks = s.schedule[targetDay] || [];

                        // Quitamos el bloque del día origen
                        const filteredOrigin = currentDayBlocks.filter((b: any) => b.id !== blockId);

                        // Construimos el bloque con las nuevas horas
                        const updatedBlock: BlockData = {
                            ...targetBlock,
                            startTime: minutesToTime(newMinutesHome),
                            endTime: minutesToTime(newMinutesEnd)
                        };

                        // Si se mueve en el mismo día, añadimos el bloque al arreglo que ya fue filtrado
                        const baseTargetBlocks = (originDay === targetDay) ? filteredOrigin : targetDayBlocks;
                        const newTargetBlocks = [...baseTargetBlocks, updatedBlock].sort((a, b) =>
                            a.startTime.localeCompare(b.startTime)
                        );

                        return {
                            ...s,
                            schedule: {
                                ...s.schedule,
                                [originDay]: filteredOrigin,
                                [targetDay]: newTargetBlocks
                            }
                        };
                    });

                    return { ...g, schedules: updatedSchedules };
                });

                // Retornamos el estado completo del salón con su lista de grupos actualizada
                return { ...prev, groups: updatedGroups };
            });

        } catch (err) {
            console.error("Error en handleDrop:", err);
        }
    };

    // ================= AÑADIR NUEVO BLOQUE DESDE EL MODAL =================
    const handleCreateBlock = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);

        const { groupId, day, startTime, endTime, label } = newBlockData;
        if (!groupId || !startTime || !endTime || !activeClassroom) return;

        const startMin = timeToMinutes(startTime);
        const endMin = timeToMinutes(endTime);

        if (startMin >= endMin) {
            setErrorMsg("La hora de salida debe ser posterior a la de entrada.");
            return;
        }

        // 1. Validar colisiones contra TODOS los bloques existentes en este salón para el día destino
        const tieneColision = activeClassroom.groups.some((g: any) => {
            // Buscamos la agenda de este grupo asociada al salón activo
            const grupoSchedule = g.schedules?.find((s: any) => s.classroomId === activeClassroom.id);
            const blocksForDay = grupoSchedule?.schedule?.[day] || [];

            return blocksForDay.some((b: any) => {
                const exStart = timeToMinutes(b.startTime);
                const exEnd = timeToMinutes(b.endTime);
                return (startMin < exEnd && endMin > exStart);
            });
        });

        if (tieneColision) {
            setErrorMsg(`No se pudo agregar: El horario seleccionado colisiona con otra clase en este salón.`);
            return;
        }

        // 2. Construcción del nuevo bloque de horario
        const nuevoBloque = {
            id: `blk-${crypto.randomUUID()}`,
            startTime,
            endTime,
            label: label.trim() || undefined
        };

        // 3. Actualización inmutable del estado del salón activo (activeClassroom)
        setActiveClassroom(prev => {
            if (!prev) return prev;

            const updatedGroups = prev.groups.map((g: any) => {
                if (g.id !== groupId) return g;

                const updatedSchedules = g.schedules.map((s: any) => {
                    // Aseguramos alterar la agenda correspondiente al salón actual
                    if (s.classroomId !== prev.id) return s;

                    const currentDayBlocks = s.schedule[day] || [];
                    // Agregamos el nuevo bloque y ordenamos cronológicamente
                    const newTargetBlocks = [...currentDayBlocks, nuevoBloque].sort((a, b) =>
                        a.startTime.localeCompare(b.startTime)
                    );

                    return {
                        ...s,
                        schedule: {
                            ...s.schedule,
                            [day]: newTargetBlocks
                        }
                    };
                });

                return { ...g, schedules: updatedSchedules };
            });

            return { ...prev, groups: updatedGroups };
        });

        // 4. Limpieza y cierre del modal
        setIsBlockModalOpen(false);
        setNewBlockData({ groupId: "", day: "lunes", startTime: "", endTime: "", label: "" });
        toast.success(`✨ Bloque añadido exitosamente de la agenda.`);
    };

    const horasGuia = Array.from({ length: HORA_FIN_GRID - HORA_INICIO_GRID + 1 }, (_, i) => HORA_INICIO_GRID + i);

    const fetchData = (pageToFetch: number, limitToFetch: number) => {
        startTransition(async () => {

            setIsLoading(true)
            const res = await getAllClassroomsAction({
                page: pageToFetch,
                limit: limitToFetch, // 🎯 Enviamos el límite dinámico
                search: undefined,
                status: undefined,
                type: undefined
            });

            console.log({ res })

            setIsLoading(false)

            if (res.success && res.data) {
                setClassrooms(res.data);
                setActiveClassroom(res.data[0] ?? null)
            }
        });
    };

    // Resetear a la página 1 cuando cambien los filtros de búsqueda o categorías
    const closeModal = () => setModalConfig((prev) => ({ ...prev, isOpen: false }));
    // Acción definitiva que se ejecuta al pasar el filtro del Modal
    const handleConfirmAction = async () => {
        if (modalConfig?.id && activeClassroom) {
            try {
                // Desempaquetamos la metadata almacenada
                const [blockId, targetDay, groupId] = modalConfig.id.split("|");

                if (!blockId || !targetDay || !groupId) return;

                // Actualización inmutable del estado del salón activo (grilla visual)
                setActiveClassroom(prev => {
                    if (!prev) return prev;

                    const updatedGroups = prev.groups.map((g: any) => {
                        // Solo modificamos el grupo dueño del bloque
                        if (g.id !== groupId) return g;

                        const updatedSchedules = g.schedules.map((s: any) => {
                            // Aseguramos modificar la relación vinculada al salón actual
                            if (s.classroomId !== prev.id) return s;

                            const currentDayBlocks = s.schedule[targetDay] || [];

                            // Filtramos para remover el bloque seleccionado de ese día específico
                            const filteredBlocks = currentDayBlocks.filter((b: any) => b.id !== blockId);

                            return {
                                ...s,
                                schedule: {
                                    ...s.schedule,
                                    [targetDay]: filteredBlocks
                                }
                            };
                        });

                        return { ...g, schedules: updatedSchedules };
                    });

                    return { ...prev, groups: updatedGroups };
                });

                toast.success(`✨ Bloque eliminado exitosamente de la agenda.`);

            } catch (error) {
                console.error("Error procesando la eliminación del bloque:", error);
                setErrorMsg("Ocurrió un error inesperado al intentar remover el bloque.");
            }
        }

        // Cerramos el modal de confirmación restaurando el estado inicial de la configuración
        setModalConfig({
            isOpen: false,
            type: "word",
            title: "",
            description: "",
        });
    };
    useEffect(() => {
        const handler = setTimeout(() => {
            fetchData(1, 10);
        }, 300);

        return () => clearTimeout(handler);
    }, []);

    if (isLoading) {
        return (
            <div className="h-full p-6 relative">
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center z-10 transition-opacity">
                    <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        )
    }
    return (
        <>
            <HeroSection
                htmlTitle={`Malla Horaria <em class="text-[#5e0472]">Interactiva</em>`}
                htmlSubTitle={`Filtra por grupos separados por colores y gestiona los horarios de la academia mediante arrastre.`}
                actions={[
                    {
                        label: "Nuevo Bloque +",
                        onClick: () => {
                            if (activeClassroom?.groups.length === 0) {
                                setErrorMsg("Debes crear al menos un grupo en este salón primero.");
                                return;
                            }
                            setIsBlockModalOpen(true);
                        },
                        icon: <Clock className="w-4 h-4" />,
                    }
                ]}
            />

            <div className="p-4 md:p-8 w-full space-y-4">

                {errorMsg && (
                    <div className="text-red-700 text-xs bg-red-50 p-3 border border-red-100 flex items-center gap-2 font-questrial animate-pulse">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span className="font-semibold">{errorMsg}</span>
                    </div>
                )}

                {/* TABS DE SALONES */}
                {
                    activeClassroom && (<><div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-purple-50">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-purple-600" />
                            <span className="font-questrial font-bold text-gray-700 text-xs uppercase tracking-wider">Infraestructura Activa:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {classrooms.map((classroom) => (
                                <button
                                    key={classroom.id}
                                    onClick={() => {
                                        setActiveClassroom(classroom);
                                        setActiveGroupFilter("all");
                                        setSelectedElement(null);
                                        setErrorMsg(null);
                                    }}
                                    className={`px-4 py-2 font-questrial font-semibold text-xs transition cursor-pointer ${activeClassroom.id === classroom.id ? "bg-[#5e0472] text-white shadow-sm" : "bg-white border border-purple-50 text-gray-400 hover:text-[#5e0472]"
                                        }`}
                                >
                                    {classroom.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    </>)
                }
                {
                    activeClassroom && (<>
                        {/* 🎯 NUEVA SECCIÓN DE PESTAÑAS: HORARIO GENERAL VS GRUPOS (CON COLORES INDICADORES) */}
                        <div className="flex items-center gap-1.5 border-b border-gray-200 overflow-x-auto pb-1">
                            <button
                                onClick={() => setActiveGroupFilter("all")}
                                className={`px-3 py-2 font-questrial font-bold text-xs transition flex items-center gap-1 border-b-2 whitespace-nowrap cursor-pointer ${activeGroupFilter === "all"
                                    ? "border-purple-600 text-purple-700"
                                    : "border-transparent text-gray-400 hover:text-gray-600"
                                    }`}
                            >
                                <Grid className="w-3.5 h-3.5" />
                                Todo el Horario (General)
                            </button>

                            {activeClassroom?.groups?.map((grupo: Group) => {
                                const colorMeta = getGroupColor(grupo.id);
                                const isTargetActive = activeGroupFilter === grupo.id;
                                return (
                                    <button
                                        key={grupo.id}
                                        onClick={() => setActiveGroupFilter(grupo.id)}
                                        className={`px-3 py-2 font-questrial font-semibold text-xs transition flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer ${isTargetActive
                                            ? "border-purple-600 text-purple-700 bg-purple-50/40 font-bold"
                                            : "border-transparent text-gray-500 hover:bg-gray-50"
                                            }`}
                                    >
                                        {/* Indicador esférico de color del grupo */}
                                        <span className={`w-2.5 h-2.5 rounded-full ${colorMeta.rawBorder} border-2`} style={{ backgroundColor: "currentColor" }} />
                                        {grupo.name}
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
                                    {DIAS.map(d => <div key={d} className="border-r border-purple-50 last:border-0 text-[11px] capitalize">{d}</div>)}
                                </div>

                                {/* Malla del Tiempo */}
                                <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] relative" style={{ height: `${horasGuia.length * PIXELS_PER_HOUR}px` }}>

                                    {/* Horas de Fondo */}
                                    {horasGuia.map((hora, index) => (
                                        <div key={hora} className="absolute left-0 right-0 border-b border-gray-100 flex items-start pointer-events-none" style={{ top: `${index * PIXELS_PER_HOUR}px`, height: `${PIXELS_PER_HOUR}px` }}>
                                            <span className="w-[80px] text-right pr-3 pt-1 text-[10px] font-bold text-gray-400">
                                                {hora.toString().padStart(2, "0")}:00
                                            </span>
                                        </div>
                                    ))}

                                    <div className="border-r border-gray-100 bg-gray-50/20"></div>

                                    {/* Columnas Interactivas  (todo) */}
                                    {
                                        activeClassroom && (
                                            DIAS.map((dia: ('lunes' | 'martes' | 'miércoles' | 'jueves' | 'viernes' | 'sábado' | 'domingo')) => {

                                                if (activeGroupFilter != 'all') {
                                                    const currentGroup = activeClassroom.groups.find((e: Group) => (e.id == activeGroupFilter));

                                                    if (currentGroup) {
                                                        const currentSchedule = currentGroup.schedules.find(e => (e.groupId == currentGroup.id && e.classroomId == activeClassroom.id));
                                                        if (currentSchedule) {
                                                            const blocksOfTheDay = currentSchedule.schedule[dia];

                                                            return (
                                                                <div
                                                                    key={dia}
                                                                    onDragOver={handleDragOver}
                                                                    onDrop={(e) => handleDrop(e, dia)}
                                                                    className="relative border-r border-gray-100/70 last:border-0 h-full bg-gray-50/5 transition-colors hover:bg-purple-50/10"
                                                                >
                                                                    {blocksOfTheDay.map((e: BlockData) => {
                                                                        const posicionStyle = getPositionStyles(e.startTime, e.endTime);
                                                                        const isSelected = selectedElement?.id === e.id;
                                                                        const colorMeta = getGroupColor(currentGroup.id);

                                                                        return (
                                                                            <div
                                                                                key={e.id}
                                                                                draggable
                                                                                onDragStart={(evt) => handleDragStart(evt, e.id, activeGroupFilter, dia)}
                                                                                onClick={(evt) => {
                                                                                    evt.stopPropagation();
                                                                                    const group = activeClassroom.groups.find(e => (e.id === activeGroupFilter))
                                                                                    if (group) {
                                                                                        setSelectedElement({
                                                                                            id: e.id,
                                                                                            block: e,
                                                                                            day: dia,
                                                                                            group: group
                                                                                        });
                                                                                    }
                                                                                }}
                                                                                style={posicionStyle}
                                                                                className={`absolute left-1 right-1 p-2 border-l-4 overflow-hidden transition-all shadow-sm cursor-grab active:cursor-grabbing flex flex-col justify-between text-[11px] ${isSelected
                                                                                    ? "bg-purple-700 text-white border-purple-900 z-20 scale-[1.01]"
                                                                                    : `${colorMeta.bg} ${colorMeta.text} ${colorMeta.border} z-10`
                                                                                    }`}
                                                                            >
                                                                                <div className="font-bold tracking-tight uppercase text-[10px] truncate leading-tight">
                                                                                    {currentGroup.name}
                                                                                </div>
                                                                                <div className="flex items-center justify-between text-[9px] opacity-95">
                                                                                    <span className="font-semibold">{e.startTime} - {e.endTime}</span>
                                                                                    {e.label && (
                                                                                        <span className={`px-1 rounded text-[8px] truncate max-w-[60px] ${isSelected ? "bg-purple-900" : colorMeta.labelBg}`}>
                                                                                            {e.label}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            );
                                                        }
                                                    }
                                                } else {
                                                    // 🎯 SOLUCIÓN: Agrupamos todos los bloques de todos los grupos para este día en específico
                                                    const allBlocksOfTheDay = activeClassroom.groups.flatMap((group: Group) => {
                                                        // Buscamos el schedule del grupo
                                                        const grupoSchedule = group.schedules?.find((s: any) => s.classroomId === activeClassroom.id);
                                                        const schedulesForDay = grupoSchedule?.schedule[dia] || [];
                                                        // Le inyectamos los datos del grupo a cada bloque para que el render no falle
                                                        return schedulesForDay.map((bloque: any) => ({
                                                            ...bloque,
                                                            group: group // Evitamos colisiones de nombres y pasamos la info limpia
                                                        }));
                                                    });

                                                    return (
                                                        <div
                                                            key={dia}
                                                            onDragOver={handleDragOver}
                                                            onDrop={(e) => handleDrop(e, dia)}
                                                            className="relative border-r border-gray-100/70 last:border-0 h-full bg-gray-50/5 transition-colors hover:bg-purple-50/10"
                                                        >
                                                            {allBlocksOfTheDay.map((e: any) => {
                                                                const posicionStyle = getPositionStyles(e.startTime, e.endTime);
                                                                const isSelected = selectedElement?.id === e.id;
                                                                const colorMeta = getGroupColor(e.group.id); // Color dinámico por grupo objetivo

                                                                return (
                                                                    <div
                                                                        key={e.id}
                                                                        draggable
                                                                        onDragStart={(evt) => handleDragStart(evt, e.id, e.group.id, dia)}
                                                                        onClick={(evt) => {
                                                                            evt.stopPropagation();
                                                                            setSelectedElement({ id: e.id, block: e, day: dia, group: e.group });
                                                                        }}
                                                                        style={posicionStyle}
                                                                        className={`absolute left-1 right-1 p-2 border-l-4 overflow-hidden transition-all shadow-sm cursor-grab active:cursor-grabbing flex flex-col justify-between text-[11px] ${isSelected
                                                                            ? "bg-purple-700 text-white border-purple-900 z-20 scale-[1.01]"
                                                                            : `${colorMeta.bg} ${colorMeta.text} ${colorMeta.border} z-10`
                                                                            }`}
                                                                    >
                                                                        <div className="font-bold tracking-tight uppercase text-[10px] truncate leading-tight">
                                                                            {e.group.name} {/* 🎯 Nombre corregido */}
                                                                        </div>
                                                                        <div className="flex items-center justify-between text-[9px] opacity-95">
                                                                            <span className="font-semibold">{e.startTime} - {e.endTime}</span>
                                                                            {e.label && (
                                                                                <span className={`px-1 rounded text-[8px] truncate max-w-[60px] ${isSelected ? "bg-purple-900" : colorMeta.labelBg}`}>
                                                                                    {e.label}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })
                                        )
                                    }
                                </div>

                            </div>
                        </div>
                    </>)
                }
            </div>
            {/* ================= 🎯 NUEVO MODAL: CREAR BLOQUE DE HORARIO ================= */}
            {isBlockModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-purple-100 shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="p-4 bg-purple-50/60 border-b border-purple-100 flex justify-between items-center">
                            <h3 className="font-anton text-gray-800 text-sm uppercase tracking-wide">
                                <Sparkles className="w-4 h-4 text-purple-600" /> Añadir Bloque de Horario
                            </h3>
                            <button onClick={() => setIsBlockModalOpen(false)} className="p-1 hover:bg-gray-100 rounded text-gray-400"><X className="w-4 h-4" /></button>
                        </div>
                        <form onSubmit={handleCreateBlock} className="p-5 space-y-4 font-questrial text-xs">
                            {errorMsg && (
                                <div className="text-red-700 text-xs bg-red-50 p-3 border border-red-100 flex items-center gap-2 font-questrial animate-pulse">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span className="font-semibold">{errorMsg}</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-gray-500 font-bold mb-1">Seleccionar Grupo Asignado *</label>
                                <select required value={newBlockData.groupId} onChange={e => setNewBlockData({ ...newBlockData, groupId: e.target.value })} className="w-full p-2 border border-purple-100 bg-white focus:outline-none focus:border-purple-400">
                                    <option value="">-- Elige un grupo --</option>
                                    {activeClassroom?.groups.map(g => (
                                        <option key={g.id} value={g.id}>{g.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-gray-500 font-bold mb-1">Día de la Semana *</label>
                                    <select value={newBlockData.day} onChange={e => setNewBlockData({ ...newBlockData, day: e.target.value as WeekDay })} className="w-full p-2 border border-purple-100 bg-white focus:outline-none focus:border-purple-400 capitalize">
                                        {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-500 font-bold mb-1">Contenido / Nota</label>
                                    <input type="text" placeholder="Ej: Técnica" value={newBlockData.label} onChange={e => setNewBlockData({ ...newBlockData, label: e.target.value })} className="w-full p-2 border border-purple-100 focus:outline-none focus:border-purple-400" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-gray-500 font-bold mb-1">Hora Inicio *</label>
                                    <input required type="time" value={newBlockData.startTime} onChange={e => setNewBlockData({ ...newBlockData, startTime: e.target.value })} className="w-full p-2 border border-purple-100 focus:outline-none focus:border-purple-400" />
                                </div>
                                <div>
                                    <label className="block text-gray-500 font-bold mb-1">Hora Fin *</label>
                                    <input required type="time" value={newBlockData.endTime} onChange={e => setNewBlockData({ ...newBlockData, endTime: e.target.value })} className="w-full p-2 border border-purple-100 focus:outline-none focus:border-purple-400" />
                                </div>
                            </div>

                            {/* Botonera */}
                            <div className="pt-2 flex justify-between">
                                <button
                                    type="button"
                                    onClick={() => setIsBlockModalOpen(false)}
                                    className="cursor-pointer font-questrial px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="font-questrial px-4 py-2 flex items-center justify-center gap-2 font-medium transition text-xs cursor-pointer gradient-purple text-white shadow-md shadow-purple-200 hover:opacity-90"
                                >
                                    Guardar Bloque
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* ================= INSPECTOR LATERAL (DRAWER) ================= */}
            {selectedElement && (
                <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl border-l border-purple-100 z-50 flex flex-col font-questrial text-xs animate-in slide-in-from-right duration-150">
                    <div className="p-4 bg-purple-50/50 border-b border-purple-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold uppercase text-gray-700 text-[11px]"><Info className="w-4 h-4 text-[#5e0472]" /> Propiedades del Bloque</div>
                        <button onClick={() => setSelectedElement(null)} className="cursor-pointer p-1 hover:bg-purple-100 text-gray-400 rounded"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="p-5 space-y-4 flex-1 overflow-y-auto">
                        {
                            selectedElement.group && (
                                <div>
                                    <span className="text-[9px] font-bold bg-pink-100 text-pink-700 px-1.5 py-0.5 capitalize">{selectedElement.group.category}</span>
                                    <h4 className="font-anton text-gray-800 text-base mt-2 uppercase tracking-wide leading-tight">{selectedElement.group.name}</h4>
                                    <p className="text-[#5e0472] font-semibold text-xs mt-0.5">{selectedElement.group.style || "Estilo Libre"}</p>
                                </div>
                            )
                        }

                        <div className="space-y-3 border-t border-gray-100 pt-3 text-gray-600">
                            <div className="flex items-center gap-3"><Calendar className="w-4 h-4 text-gray-400" /><div><p className="text-[9px] text-gray-400 font-bold">Día</p><p className="font-medium text-gray-800 capitalize">{selectedElement.day}</p></div></div>
                            <div className="flex items-center gap-3"><Clock className="w-4 h-4 text-gray-400" /><div><p className="text-[9px] text-gray-400 font-bold">Horario Actual</p><p className="font-medium text-gray-800">{selectedElement.block.startTime} a {selectedElement.block.endTime}</p></div></div>
                            <div className="flex items-center gap-3"><User className="w-4 h-4 text-gray-400" /><div><p className="text-[9px] text-gray-400 font-bold">Profesor</p><p className="font-medium text-gray-800">{selectedElement.group.instructor}</p></div></div>
                        </div>
                        <div className="border-t border-gray-100 pt-3 space-y-2">
                            <button
                                type="button"
                                onClick={() => {
                                    if (!selectedElement) return;
                                    // Empaquetamos la metadata crítica: id_bloque | dia_semana | id_grupo
                                    const compositeId = `${selectedElement.id}|${selectedElement.day}|${selectedElement.group.id}`;

                                    setModalConfig({
                                        isOpen: true,
                                        type: "word",
                                        title: "Remover Bloque de Horario",
                                        description: `¿Estás seguro de que deseas eliminar este bloque de clase? Para confirmar, escribe la palabra requerida.`,
                                        requiredWord: "ELIMINAR", // Palabra de seguridad requerida por tu modal tipo "word"
                                        id: compositeId,
                                    });
                                    // Limpiamos la selección del panel lateral inmediatamente
                                    setSelectedElement(null);
                                }}
                                className="w-full py-1.5 bg-red-50 text-red-600 hover:bg-red-100 font-bold border border-red-200 text-center cursor-pointer"
                            >
                                Eliminar bloque de horario
                            </button>
                        </div>
                    </div>
                    <div className="p-4 border-t border-purple-100 bg-gray-50"><button onClick={() => alert("Módulo de alumnos e inscripciones")} className="w-full py-2 bg-white text-gray-700 border font-bold cursor-pointer flex items-center justify-center gap-1">Ver Alumnos <ChevronRight className="w-3.5 h-3.5" /></button></div>
                </div>
            )}
            {/* INSTANCIA ÚNICA DEL MODAL DINÁMICO */}
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                onConfirm={handleConfirmAction}
                type={modalConfig.type}
                title={modalConfig.title}
                description={modalConfig.description}
                requiredWord={modalConfig.requiredWord}
                userEmail={modalConfig.userEmail}
                variant={modalConfig.type === "word" ? "danger" : modalConfig.type === "email" ? "warning" : "primary"}
                confirmButtonText={modalConfig.type === "word" ? "Eliminar de Por Vida" : "Confirmar Acción"}
            />
        </>
    );
}