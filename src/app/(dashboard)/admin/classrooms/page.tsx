"use client";
import { useState, useMemo } from "react";
import {
    Clock,
    Plus,
    MapPin,
    Users,
    Trash2,
    Edit3,
    X,
    CheckCircle,
    Sliders,
    AlertCircle
} from "lucide-react";
import HeroSection from "@/components/layout/HeroSection";

// Interfaz para la definición de Salones
interface Classroom {
    id: string;
    name: string;
    maxCapacity: number;
    type: "Espejos" | "Urbano" | "Libre" | "Teorías";
    status: "Activo" | "Mantenimiento";
    description?: string;
}

const INITIAL_SALONES: Classroom[] = [
    {
        id: "room-1",
        name: "Salón de Espejos A",
        maxCapacity: 25,
        type: "Espejos",
        status: "Activo",
        description: "Equipado con barras de ballet fijas, sonido envolvente y piso flotante de madera."
    },
    {
        id: "room-2",
        name: "Salón Urbano (Planta Alta)",
        maxCapacity: 20,
        type: "Urbano",
        status: "Activo",
        description: "Iluminación LED graduable y acústica optimizada para ritmos de alta percusión."
    },
    {
        id: "room-3",
        name: "Estudio B (Ensayos Privados)",
        maxCapacity: 8,
        type: "Libre",
        status: "Mantenimiento",
        description: "Espacio reducido ideal para parejas competidoras o grabaciones de contenido."
    }
];

export default function ClassroomPage() {
    const [salones, setSalones] = useState<Classroom[]>(INITIAL_SALONES);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterType, setFilterType] = useState<string>("Todos");

    // Estado del formulario interno del modal
    const [formData, setFormData] = useState({
        name: "",
        maxCapacity: 20,
        type: "Espejos" as Classroom["type"],
        status: "Activo" as Classroom["status"],
        description: ""
    });

    // Estadísticas automatizadas de infraestructura
    const totalAforoInstalado = useMemo(() => {
        return salones.reduce((acc, curr) => acc + (curr.status === "Activo" ? curr.maxCapacity : 0), 0);
    }, [salones]);

    const salonesOperativos = useMemo(() => salones.filter(s => s.status === "Activo").length, [salones]);

    const salonesFiltrados = useMemo(() => {
        if (filterType === "Todos") return salones;
        return salones.filter(s => s.type === filterType);
    }, [salones, filterType]);

    // Manejo de inserción de nuevo salón
    const handleSaveClassroom = (e: React.FormEvent) => {
        e.preventDefault();
        const nuevoSalor: Classroom = {
            id: `room-${crypto.randomUUID()}`,
            name: formData.name,
            maxCapacity: Number(formData.maxCapacity),
            type: formData.type,
            status: formData.status,
            description: formData.description.trim() || undefined
        };

        setSalones([...salones, nuevoSalor]);
        setIsModalOpen(false);
        setFormData({ name: "", maxCapacity: 20, type: "Espejos", status: "Activo", description: "" });
    };

    const handleDeleteClassroom = (id: string) => {
        if (!confirm("¿Estás seguro de que deseas eliminar este espacio físico? Esto desvinculará la locación de los horarios asignados.")) return;
        setSalones(salones.filter(s => s.id !== id));
    };

    return (
        <>
            <HeroSection
                htmlTitle={`Salones de <em class="text-[#5e0472]">Clases</em>`}
                htmlSubTitle={`Administra la infraestructura física de la academia, aforos máximos permitidos y estatus de mantenimiento.`}
                actions={[
                    {
                        label: "Nuevo Salón +",
                        onClick: () => setIsModalOpen(true),
                        icon: <Plus className="w-4 h-4" />,
                    },
                ]}
            />

            <div className="p-4 md:p-8 w-full space-y-6">

                {/* INDICADORES DE INFRAESTRUCTURA */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-questrial">
                    <div className="glass-card p-4 border border-purple-50 flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Aforo Global Simultáneo</p>
                            <h4 className="text-2xl font-anton text-purple-700 mt-1">{totalAforoInstalado} Alumnos</h4>
                            <p className="text-[11px] text-gray-500">Capacidad total instalada en espacios activos.</p>
                        </div>
                        <div className="w-10 h-10 bg-purple-50 flex items-center justify-center text-[#5e0472] rounded-lg">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="glass-card p-4 border border-purple-50 flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Salones Disponibles</p>
                            <h4 className="text-2xl font-anton text-emerald-600 mt-1">{salonesOperativos} / {salones.length}</h4>
                            <p className="text-[11px] text-gray-500">Espacios listos para albergar mallas horarias.</p>
                        </div>
                        <div className="w-10 h-10 bg-emerald-50 flex items-center justify-center text-emerald-600 rounded-lg">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="glass-card p-4 border border-purple-50 flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Mantenimiento Preventivo</p>
                            <h4 className="text-2xl font-anton text-amber-600 mt-1">{salones.length - salonesOperativos} Espacios</h4>
                            <p className="text-[11px] text-gray-500">Inhabilitados para asignaciones temporales.</p>
                        </div>
                        <div className="w-10 h-10 bg-amber-50 flex items-center justify-center text-amber-600 rounded-lg">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* FILTROS POR CATEGORÍA DE SALÓN */}
                <div className="glass-card p-3 flex flex-col sm:flex-row items-center justify-between gap-3 border border-purple-50">
                    <div className="flex items-center gap-2 font-questrial text-xs font-bold text-gray-600 uppercase tracking-wider">
                        <Sliders className="w-4 h-4 text-purple-600" />
                        <span>Especialidades:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {["Todos", "Espejos", "Urbano", "Libre", "Teorías"].map((t) => (
                            <button
                                key={t}
                                onClick={() => setFilterType(t)}
                                className={`px-3 py-1.5 font-questrial font-semibold text-[11px] rounded transition cursor-pointer ${filterType === t
                                        ? "bg-[#5e0472] text-white shadow-sm"
                                        : "bg-white border border-purple-50 text-gray-400 hover:text-[#5e0472]"
                                    }`}
                            >
                                {t === "Todos" ? "Todas las Áreas" : `Área ${t}`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* LISTADO DE TARJETAS DE SALONES */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {salonesFiltrados.length > 0 ? (
                        salonesFiltrados.map((salon) => (
                            <div
                                key={salon.id}
                                className="glass-card p-5 bg-white border border-purple-50 rounded-xl flex flex-col justify-between hover:shadow-md transition font-questrial text-xs"
                            >
                                <div>
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <span className="bg-purple-100 text-purple-800 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                                                Área {salon.type}
                                            </span>
                                            <h3 className="font-anton text-gray-800 text-base mt-2 uppercase tracking-wide">
                                                {salon.name}
                                            </h3>
                                        </div>
                                        <span className={`px-2 py-0.5 font-bold text-[9px] rounded uppercase ${salon.status === "Activo"
                                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                : "bg-amber-50 text-amber-600 border border-amber-100"
                                            }`}>
                                            {salon.status}
                                        </span>
                                    </div>

                                    {salon.description && (
                                        <p className="text-gray-400 mt-2.5 text-[11px] leading-relaxed line-clamp-2">
                                            {salon.description}
                                        </p>
                                    )}
                                </div>

                                <div className="mt-4 pt-3 border-t border-purple-50/50 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                                        <MapPin className="w-3.5 h-3.5 text-purple-600" />
                                        <span>Capacidad: <strong className="text-gray-700 font-bold">{salon.maxCapacity} Alumnos</strong></span>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => alert(`Apertura del módulo de edición para el salón: ${salon.name}`)}
                                            className="p-1.5 hover:bg-purple-50 text-gray-400 hover:text-purple-700 transition rounded cursor-pointer"
                                            title="Editar Parámetros"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClassroom(salon.id)}
                                            className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 transition rounded cursor-pointer"
                                            title="Remover Locación"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center text-gray-400 font-questrial border border-dashed border-purple-100 rounded-2xl bg-white/40">
                            No se encuentran salones configurados bajo la modalidad seleccionada.
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL: APERTURA / REGISTRO DE SALÓN */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl border border-purple-100 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="p-4 bg-purple-50/60 border-b border-purple-100 flex justify-between items-center">
                            <h3 className="font-anton text-gray-800 text-sm uppercase tracking-wide">Dar de alta Salón</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-100 rounded text-gray-400 cursor-pointer">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveClassroom} className="p-5 space-y-4 font-questrial text-xs">
                            <div>
                                <label className="block text-gray-500 font-bold mb-1">Nombre de la Estructura / Aula *</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Ej: Salón de Espejos C"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-2 border border-purple-100 bg-purple-50/10 focus:outline-none focus:border-purple-400"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-gray-500 font-bold mb-1">Especialidad de Área</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value as Classroom["type"] })}
                                        className="w-full p-2 border border-purple-100 bg-white focus:outline-none focus:border-purple-400"
                                    >
                                        <option value="Espejos">Área Espejos</option>
                                        <option value="Urbano">Área Urbano</option>
                                        <option value="Libre">Estudio Libre</option>
                                        <option value="Teorías">Aula de Teorías</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-500 font-bold mb-1">Estado Operativo</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as Classroom["status"] })}
                                        className="w-full p-2 border border-purple-100 bg-white focus:outline-none focus:border-purple-400"
                                    >
                                        <option value="Activo">Activo</option>
                                        <option value="Mantenimiento">En Mantenimiento</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-500 font-bold mb-1">Aforo Máximo de Seguridad (Alumnos) *</label>
                                <input
                                    required
                                    type="number"
                                    min={1}
                                    max={60}
                                    value={formData.maxCapacity}
                                    onChange={e => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
                                    className="w-full p-2 border border-purple-100 bg-purple-50/10 focus:outline-none focus:border-purple-400"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-500 font-bold mb-1">Descripción de Equipamiento</label>
                                <textarea
                                    rows={3}
                                    placeholder="Detalla si el salón cuenta con barras de ballet, aire acondicionado o tipos específicos de pisos..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full p-2 border border-purple-100 bg-purple-50/10 focus:outline-none focus:border-purple-400 resize-none"
                                />
                            </div>

                            <div className="pt-2 border-t flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded transition hover:bg-gray-200"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-1.5 gradient-purple text-white font-bold rounded shadow-sm hover:opacity-90 transition"
                                >
                                    Dar de alta espacio
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}