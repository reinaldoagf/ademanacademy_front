"use client";
import { useState, useMemo } from "react";
import {
    Clock,
    MapPin,
    Layers,
    User,
    X,
    ChevronRight,
    Calendar,
    Info,
    Plus,
    AlertCircle,
    Grid
} from "lucide-react";
import HeroSection from "@/components/layout/HeroSection";
import { Group } from "@/types/group";
import { WeekDay, ScheduleBlock } from "@/types/schedule";

// 🎯 Datos iniciales de la academia
const INITIAL_GRUPOS: Group[] = [
    {
        id: "grp-1",
        name: "Salsa Infantil - Nivel 1",
        style: "Salsa Casino",
        instructor: "Carlos Espinoza",
        classroom: "Salón de Espejos A",
        usedSlots: 15,
        totalNumberOfSlots: 15,
        category: "Infantil",
        schedules: {
            lunes: [{ id: "b1", startTime: "14:00", endTime: "15:30", label: "Técnica básica" }],
            martes: [],
            miércoles: [{ id: "b2", startTime: "14:00", endTime: "15:30", label: "Coreografía" }],
            jueves: [], viernes: [], sábado: [], domingo: []
        }
    },
    {
        id: "grp-2",
        name: "Bachata Parejas - Intensivo",
        style: "Bachata Sensual",
        instructor: "Carlos Espinoza",
        classroom: "Salón de Espejos A",
        usedSlots: 8,
        totalNumberOfSlots: 20,
        category: "Adulto",
        schedules: {
            lunes: [{ id: "b5", startTime: "16:00", endTime: "17:30", label: "Social e improvisación" }],
            martes: [], miércoles: [],
            jueves: [{ id: "b6", startTime: "16:00", endTime: "17:30", label: "Carga de figuras" }],
            viernes: [], sábado: [], domingo: []
        }
    },
    {
        id: "grp-3",
        name: "Ritmos Urbanos Crew",
        style: "Hip Hop",
        instructor: "Daniela Martínez",
        classroom: "Salón de Espejos A",
        usedSlots: 18,
        totalNumberOfSlots: 20,
        category: "Juvenil",
        schedules: {
            lunes: [], martes: [], miércoles: [],
            jueves: [{ id: "b3", startTime: "11:00", endTime: "12:30" }],
            viernes: [],
            sábado: [{ id: "b4", startTime: "10:00", endTime: "12:00", label: "Ensayo intensivo" }],
            domingo: []
        }
    }
];

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

interface RenderableBlock {
    block: ScheduleBlock;
    day: WeekDay;
    group: Group;
}

export default function SchedulePage() {
    const [grupos, setGrupos] = useState<Group[]>(INITIAL_GRUPOS);
    const [activeClassroom, setActiveClassroom] = useState<string>("Salón de Espejos A");
    const [selectedElement, setSelectedElement] = useState<RenderableBlock | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // 🎯 NUEVO ESTADO: Filtro por Grupos (Pestañas de Grupo)
    // "all" significa ver la agenda completa con todos los grupos superpuestos por colores.
    const [activeGroupFilter, setActiveGroupFilter] = useState<string>("all");

    // Estados para modales
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

    const [newGroupData, setNewGroupData] = useState({
        name: "", instructor: "", style: "", category: "Adulto" as Group["category"], totalNumberOfSlots: 20
    });

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

    const salonesDisponibles = useMemo(() => {
        const salas = new Set<string>(["Salón de Espejos A", "Salón Urbano (Planta Alta)"]);
        grupos.forEach(g => g.classroom && salas.add(g.classroom));
        return Array.from(salas);
    }, [grupos]);

    // Grupos que pertenecen al salón seleccionado actualmente
    const gruposDelSalonActivo = useMemo(() => {
        return grupos.filter(g => g.classroom === activeClassroom);
    }, [grupos, activeClassroom]);

    // Malla horaria filtrada por Salón Y por Pestaña de Grupo seleccionada
    const bloquesFiltrados = useMemo(() => {
        const lista: RenderableBlock[] = [];
        gruposDelSalonActivo.forEach(grupo => {
            // Si la pestaña no es "todos" y no coincide con el grupo iterado, lo ignoramos
            if (activeGroupFilter !== "all" && activeGroupFilter !== grupo.id) return;

            Object.entries(grupo.schedules).forEach(([day, blocks]) => {
                blocks.forEach(block => {
                    lista.push({ block, day: day as WeekDay, group: grupo });
                });
            });
        });
        return lista;
    }, [gruposDelSalonActivo, activeGroupFilter]);

    const getPositionStyles = (startTime: string, endTime: string) => {
        const minutosDesdeEje = timeToMinutes(startTime) - (HORA_INICIO_GRID * 60);
        const duracion = timeToMinutes(endTime) - timeToMinutes(startTime);
        return {
            top: `${(minutosDesdeEje / 60) * PIXELS_PER_HOUR}px`,
            height: `${(duracion / 60) * PIXELS_PER_HOUR}px`
        };
    };

    // ================= DRAG AND DROP CON FILTRADO DE COLOR =================
    const handleDragStart = (e: React.DragEvent, blockId: string, groupId: string, originDay: WeekDay) => {
        e.dataTransfer.setData("text/plain", JSON.stringify({ blockId, groupId, originDay }));
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

            const minutosTotalesDrop = Math.round((relativeY / PIXELS_PER_HOUR) * 4) * 15;
            const nuevosMinutosInicio = (HORA_INICIO_GRID * 60) + minutosTotalesDrop;

            const targetGroup = grupos.find(g => g.id === groupId);
            const targetBlock = targetGroup?.schedules[originDay].find(b => b.id === blockId);

            if (!targetGroup || !targetBlock) return;

            const duracionOriginal = timeToMinutes(targetBlock.endTime) - timeToMinutes(targetBlock.startTime);
            const nuevosMinutosFin = nuevosMinutosInicio + duracionOriginal;

            if (nuevosMinutosFin > (HORA_FIN_GRID * 60)) {
                setErrorMsg("El bloque excede el horario de cierre de la academia.");
                return;
            }

            // Validación de colisiones contra todos los bloques del mismo salón activo
            const tieneColision = gruposDelSalonActivo.some(g => {
                return Object.entries(g.schedules).some(([day, blocks]) => {
                    if (day !== targetDay) return false;
                    return blocks.some(b => {
                        if (b.id === blockId && day === originDay) return false;
                        const exStart = timeToMinutes(b.startTime);
                        const exEnd = timeToMinutes(b.endTime);
                        return (nuevosMinutosInicio < exEnd && nuevosMinutosFin > exStart);
                    });
                });
            });

            if (tieneColision) {
                setErrorMsg(`Conflicto de agenda: Ya existe una clase en ese rango de horas el día ${targetDay}.`);
                return;
            }

            setGrupos(grupos.map(g => {
                if (g.id !== groupId) return g;
                const updatedSchedules = { ...g.schedules };
                updatedSchedules[originDay] = updatedSchedules[originDay].filter(b => b.id !== blockId);
                const updatedBlock: ScheduleBlock = {
                    ...targetBlock,
                    startTime: minutesToTime(nuevosMinutosInicio),
                    endTime: minutesToTime(nuevosMinutosFin)
                };
                updatedSchedules[targetDay] = [...updatedSchedules[targetDay], updatedBlock].sort((a, b) => a.startTime.localeCompare(b.startTime));
                return { ...g, schedules: updatedSchedules };
            }));

        } catch (err) {
            console.error(err);
        }
    };

    // ================= AÑADIR NUEVO BLOQUE DESDE EL MODAL =================
    const handleCreateBlock = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);

        const { groupId, day, startTime, endTime, label } = newBlockData;
        if (!groupId || !startTime || !endTime) return;

        const startMin = timeToMinutes(startTime);
        const endMin = timeToMinutes(endTime);

        if (startMin >= endMin) {
            setErrorMsg("La hora de salida debe ser posterior a la de entrada.");
            return;
        }

        // Validar colisiones
        const tieneColision = gruposDelSalonActivo.some(g => {
            return Object.entries(g.schedules).some(([d, blocks]) => {
                if (d !== day) return false;
                return blocks.some(b => {
                    const exStart = timeToMinutes(b.startTime);
                    const exEnd = timeToMinutes(b.endTime);
                    return (startMin < exEnd && endMin > exStart);
                });
            });
        });

        if (tieneColision) {
            setErrorMsg(`No se pudo agregar: El horario seleccionado colisiona con otra clase del mismo salón.`);
            return;
        }

        setGrupos(grupos.map(g => {
            if (g.id !== groupId) return g;
            const updatedDayBlocks = [...g.schedules[day], {
                id: `blk-${crypto.randomUUID()}`,
                startTime,
                endTime,
                label: label.trim() || undefined
            }].sort((a, b) => a.startTime.localeCompare(b.startTime));

            return { ...g, schedules: { ...g.schedules, [day]: updatedDayBlocks } };
        }));

        setIsBlockModalOpen(false);
        setNewBlockData({ groupId: "", day: "lunes", startTime: "", endTime: "", label: "" });
    };

    const handleCreateGroup = (e: React.FormEvent) => {
        e.preventDefault();
        const nuevo: Group = {
            id: `grp-${crypto.randomUUID()}`,
            name: newGroupData.name,
            instructor: newGroupData.instructor,
            style: newGroupData.style || null,
            classroom: activeClassroom,
            category: newGroupData.category,
            usedSlots: 0,
            totalNumberOfSlots: Number(newGroupData.totalNumberOfSlots),
            schedules: { lunes: [], martes: [], miércoles: [], jueves: [], viernes: [], sábado: [], domingo: [] }
        };
        setGrupos([...grupos, nuevo]);
        setIsGroupModalOpen(false);
        setNewGroupData({ name: "", instructor: "", style: "", category: "Adulto", totalNumberOfSlots: 20 });
    };

    const horasGuia = Array.from({ length: HORA_FIN_GRID - HORA_INICIO_GRID + 1 }, (_, i) => HORA_INICIO_GRID + i);

    return (
        <>
            <HeroSection
                htmlTitle={`Malla Horaria <em class="text-[#5e0472]">Interactiva</em>`}
                htmlSubTitle={`Filtra por grupos separados por colores y gestiona los horarios de la academia mediante arrastre.`}
                actions={[
                    {
                        label: "Nuevo Bloque +",
                        onClick: () => {
                            if (gruposDelSalonActivo.length === 0) {
                                setErrorMsg("Debes crear al menos un grupo en este salón primero.");
                                return;
                            }
                            setIsBlockModalOpen(true);
                        },
                        icon: <Clock className="w-4 h-4" />,
                    },
                    {
                        label: "Crear Grupo",
                        onClick: () => setIsGroupModalOpen(true),
                        icon: <Plus className="w-4 h-4" />,
                    }
                ]}
            />

            <div className="p-4 md:p-8 w-full space-y-4">

                {errorMsg && (
                    <div className="text-red-700 text-xs bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2 font-questrial animate-pulse">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span className="font-semibold">{errorMsg}</span>
                    </div>
                )}

                {/* TABS DE SALONES */}
                <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-purple-50">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-purple-600" />
                        <span className="font-questrial font-bold text-gray-700 text-xs uppercase tracking-wider">Infraestructura Activa:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {salonesDisponibles.map((sala) => (
                            <button
                                key={sala}
                                onClick={() => { setActiveClassroom(sala); setActiveGroupFilter("all"); setSelectedElement(null); setErrorMsg(null); }}
                                className={`px-4 py-2 font-questrial font-semibold text-xs transition cursor-pointer rounded ${activeClassroom === sala ? "bg-[#5e0472] text-white shadow-sm" : "bg-white border border-purple-50 text-gray-400 hover:text-[#5e0472]"
                                    }`}
                            >
                                {sala}
                            </button>
                        ))}
                    </div>
                </div>

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

                    {gruposDelSalonActivo.map(grupo => {
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
                <div className="glass-card border border-purple-50 bg-white shadow-sm rounded-xl overflow-x-auto">
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

                            {/* Columnas Interactivas */}
                            {DIAS.map((dia) => {
                                const bloquesDelDia = bloquesFiltrados.filter(b => b.day === dia);

                                return (
                                    <div
                                        key={dia}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, dia)}
                                        className="relative border-r border-gray-100/70 last:border-0 h-full bg-gray-50/5 transition-colors hover:bg-purple-50/10"
                                    >
                                        {bloquesDelDia.map(({ block, group }) => {
                                            const posicionStyle = getPositionStyles(block.startTime, block.endTime);
                                            const isSelected = selectedElement?.block.id === block.id;
                                            const colorMeta = getGroupColor(group.id); // 🎯 Obtener paleta de color dinámica

                                            return (
                                                <div
                                                    key={block.id}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, block.id, group.id, dia)}
                                                    onClick={(e) => { e.stopPropagation(); setSelectedElement({ block, day: dia, group }); }}
                                                    style={posicionStyle}
                                                    className={`absolute left-1 right-1 p-2 rounded border-l-4 overflow-hidden transition-all shadow-sm cursor-grab active:cursor-grabbing flex flex-col justify-between text-[11px] ${isSelected
                                                        ? "bg-purple-700 text-white border-purple-900 z-20 scale-[1.01]"
                                                        : `${colorMeta.bg} ${colorMeta.text} ${colorMeta.border} z-10`
                                                        }`}
                                                >
                                                    <div className="font-bold tracking-tight uppercase text-[10px] truncate leading-tight">
                                                        {group.name}
                                                    </div>
                                                    <div className="flex items-center justify-between text-[9px] opacity-95">
                                                        <span className="font-semibold">{block.startTime} - {block.endTime}</span>
                                                        {block.label && (
                                                            <span className={`px-1 rounded text-[8px] truncate max-w-[60px] ${isSelected ? "bg-purple-900" : colorMeta.labelBg
                                                                }`}>
                                                                {block.label}
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

            {/* ================= 🎯 NUEVO MODAL: CREAR BLOQUE DE HORARIO ================= */}
            {isBlockModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl border border-purple-100 shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="p-4 bg-purple-50/60 border-b border-purple-100 flex justify-between items-center">
                            <h3 className="font-anton text-gray-800 text-sm uppercase tracking-wide">Añadir Bloque de Horario</h3>
                            <button onClick={() => setIsBlockModalOpen(false)} className="p-1 hover:bg-gray-100 rounded text-gray-400"><X className="w-4 h-4" /></button>
                        </div>
                        <form onSubmit={handleCreateBlock} className="p-5 space-y-4 font-questrial text-xs">
                            <div>
                                <label className="block text-gray-500 font-bold mb-1">Seleccionar Grupo Asignado *</label>
                                <select required value={newBlockData.groupId} onChange={e => setNewBlockData({ ...newBlockData, groupId: e.target.value })} className="w-full p-2 border border-purple-100 bg-white focus:outline-none focus:border-purple-400">
                                    <option value="">-- Elige un grupo --</option>
                                    {gruposDelSalonActivo.map(g => (
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
                            <div className="pt-2 border-t flex justify-end gap-2">
                                <button type="button" onClick={() => setIsBlockModalOpen(false)} className="px-4 py-1.5 bg-gray-100 rounded">Cancelar</button>
                                <button type="submit" className="px-4 py-1.5 gradient-purple text-white font-bold rounded shadow-sm">Guardar Bloque</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================= MODAL: REGISTRO DE NUEVO GRUPO ================= */}
            {isGroupModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl border border-purple-100 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="p-4 bg-purple-50/60 border-b border-purple-100 flex justify-between items-center">
                            <h3 className="font-anton text-gray-800 text-sm uppercase tracking-wide">Nuevo Grupo en {activeClassroom}</h3>
                            <button onClick={() => setIsGroupModalOpen(false)} className="p-1 hover:bg-gray-100 rounded text-gray-400"><X className="w-4 h-4" /></button>
                        </div>
                        <form onSubmit={handleCreateGroup} className="p-5 space-y-4 font-questrial text-xs">
                            <div>
                                <label className="block text-gray-500 font-bold mb-1">Nombre del Grupo *</label>
                                <input required type="text" placeholder="Ej: Bachata Principiantes" value={newGroupData.name} onChange={e => setNewGroupData({ ...newGroupData, name: e.target.value })} className="w-full p-2 border border-purple-100 bg-purple-50/10 focus:outline-none focus:border-purple-400" />
                            </div>
                            <div>
                                <label className="block text-gray-500 font-bold mb-1">Profesor / Instructor *</label>
                                <input required type="text" placeholder="Ej: Andrea Mendoza" value={newGroupData.instructor} onChange={e => setNewGroupData({ ...newGroupData, instructor: e.target.value })} className="w-full p-2 border border-purple-100 bg-purple-50/10 focus:outline-none focus:border-purple-400" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-gray-500 font-bold mb-1">Estilo de Baile</label>
                                    <input type="text" placeholder="Ej: Salsa Casino" value={newGroupData.style} onChange={e => setNewGroupData({ ...newGroupData, style: e.target.value })} className="w-full p-2 border border-purple-100 bg-purple-50/10 focus:outline-none focus:border-purple-400" />
                                </div>
                                <div>
                                    <label className="block text-gray-500 font-bold mb-1">Categoría</label>
                                    <select value={newGroupData.category} onChange={e => setNewGroupData({ ...newGroupData, category: e.target.value as Group["category"] })} className="w-full p-2 border border-purple-100 bg-white focus:outline-none focus:border-purple-400">
                                        <option value="Baby">Baby</option><option value="Infantil">Infantil</option><option value="Juvenil">Juvenil</option><option value="Adulto">Adulto</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-gray-500 font-bold mb-1">Cupos Disponibles</label>
                                <input type="number" min={5} value={newGroupData.totalNumberOfSlots} onChange={e => setNewGroupData({ ...newGroupData, totalNumberOfSlots: Number(e.target.value) })} className="w-full p-2 border border-purple-100 bg-purple-50/10 focus:outline-none focus:border-purple-400" />
                            </div>
                            <div className="pt-2 border-t flex justify-end gap-2">
                                <button type="button" onClick={() => setIsGroupModalOpen(false)} className="px-4 py-1.5 bg-gray-100 rounded">Cancelar</button>
                                <button type="submit" className="px-4 py-1.5 gradient-purple text-white font-bold rounded shadow-sm">Registrar Grupo</button>
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
                        <button onClick={() => setSelectedElement(null)} className="p-1 hover:bg-purple-100 text-gray-400 rounded"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="p-5 space-y-4 flex-1 overflow-y-auto">
                        <div>
                            <span className="text-[9px] font-bold bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded capitalize">{selectedElement.group.category}</span>
                            <h4 className="font-anton text-gray-800 text-base mt-2 uppercase tracking-wide leading-tight">{selectedElement.group.name}</h4>
                            <p className="text-[#5e0472] font-semibold text-xs mt-0.5">{selectedElement.group.style || "Estilo Libre"}</p>
                        </div>
                        <div className="space-y-3 border-t border-gray-100 pt-3 text-gray-600">
                            <div className="flex items-center gap-3"><Calendar className="w-4 h-4 text-gray-400" /><div><p className="text-[9px] text-gray-400 font-bold">Día</p><p className="font-medium text-gray-800 capitalize">{selectedElement.day}</p></div></div>
                            <div className="flex items-center gap-3"><Clock className="w-4 h-4 text-gray-400" /><div><p className="text-[9px] text-gray-400 font-bold">Horario Actual</p><p className="font-medium text-gray-800">{selectedElement.block.startTime} a {selectedElement.block.endTime}</p></div></div>
                            <div className="flex items-center gap-3"><User className="w-4 h-4 text-gray-400" /><div><p className="text-[9px] text-gray-400 font-bold">Profesor</p><p className="font-medium text-gray-800">{selectedElement.group.instructor}</p></div></div>
                        </div>
                        <div className="border-t border-gray-100 pt-3 space-y-2">
                            <button
                                type="button"
                                onClick={() => {
                                    if (!confirm("¿Deseas remover este bloque?")) return;
                                    setGrupos(prev => prev.map(g => {
                                        if (g.id !== selectedElement.group.id) return g;
                                        return { ...g, schedules: { ...g.schedules, [selectedElement.day]: g.schedules[selectedElement.day].filter(b => b.id !== selectedElement.block.id) } };
                                    }));
                                    setSelectedElement(null);
                                }}
                                className="w-full py-1.5 bg-red-50 text-red-600 hover:bg-red-100 font-bold border border-red-200 rounded text-center cursor-pointer"
                            >
                                Eliminar bloque de horario
                            </button>
                        </div>
                    </div>
                    <div className="p-4 border-t bg-gray-50"><button onClick={() => alert("Módulo de alumnos e inscripciones")} className="w-full py-2 bg-white text-gray-700 border font-bold rounded flex items-center justify-center gap-1">Ver Alumnos <ChevronRight className="w-3.5 h-3.5" /></button></div>
                </div>
            )}
        </>
    );
}