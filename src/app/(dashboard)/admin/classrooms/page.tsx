"use client";
import { useState, useMemo, useTransition, useEffect } from "react";
import {
    Clock,
    Plus,
    Sparkles,
    MapPin,
    Users,
    Trash2,
    Edit3,
    X,
    CheckCircle,
    Sliders,
    AlertCircle
} from "lucide-react";
import { toast } from "react-hot-toast";
import HeroSection from "@/components/layout/HeroSection";
import { saveClassroomAction, getAllClassroomsAction } from "@/app/actions/classrooms";
import { Classroom } from "@/types/classroom";

export default function ClassroomPage() {
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [filterType, setFilterType] = useState<string>("Todos");
    const [meta, setMeta] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        itemCount: 10,
    });
    const [isPending, startTransition] = useTransition();
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Estado del formulario interno del modal
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        maxCapacity: 20,
        type: "mirrors" as Classroom["type"],
        status: "active" as Classroom["status"],
        description: ""
    });

    // Estadísticas automatizadas de infraestructura
    /* const totalAforoInstalado = useMemo(() => {
        return salones.reduce((acc, curr) => acc + (curr.status === "Activo" ? curr.maxCapacity : 0), 0);
    }, [salones]); */

    /* const salonesOperativos = useMemo(() => salones.filter(s => s.status === "Activo").length, [salones]);

    const salonesFiltrados = useMemo(() => {
        if (filterType === "Todos") return salones;
        return salones.filter(s => s.type === filterType);
    }, [salones, filterType]); */

    // Manejo de inserción de nuevo salón
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        startTransition(async () => {
            const res = await saveClassroomAction(formData, null);
            if (!res.success) {
                setErrorMsg(res.error || "Ocurrió un error.");
                return;
            }
            toast.success("Operación exitosa");

            setClassrooms([res.data!, ...classrooms]);
            // 🎯 REACTIVIDAD: Si era una creación (id nuevo), el badge debe subir
            window.dispatchEvent(new Event('refresh-classrooms-count'));
            setIsModalOpen(false);
        });
    };

    const handleDeleteClassroom = (id: string) => {
        console.log('handleDeleteClassroom')
    };

    const fetchData = (pageToFetch: number, limitToFetch: number) => {
        startTransition(async () => {
            const res = await getAllClassroomsAction({
                page: pageToFetch,
                limit: limitToFetch, // 🎯 Enviamos el límite dinámico
                search: searchTerm || undefined,
            });
            if (res.success && res.data) {
                setClassrooms(res.data);
                setMeta(res.meta); // NestJS ya devuelve el "itemsPerPage" en su meta
            }
        });
    };
    useEffect(() => {
        const handler = setTimeout(() => {
            fetchData(currentPage, itemsPerPage);
        }, 300);

        return () => clearTimeout(handler);
    }, [searchTerm, currentPage, itemsPerPage]);
    return (
        <>
            <HeroSection
                htmlTitle={`Salones de <em class="text-[#5e0472]">Clases</em>`}
                htmlSubTitle={`Administra la infraestructura física de la academia, aforos máximos permitidos y estatus de mantenimiento.`}
                actions={[
                    {
                        label: "Nuevo Salón →",
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
                            <h4 className="text-2xl font-anton text-purple-700 mt-1">1 Alumnos</h4>
                            <p className="text-[11px] text-gray-500">Capacidad total instalada en espacios activos.</p>
                        </div>
                        <div className="w-10 h-10 bg-purple-50 flex items-center justify-center text-[#5e0472] rounded-lg">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="glass-card p-4 border border-purple-50 flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Salones Disponibles</p>
                            <h4 className="text-2xl font-anton text-emerald-600 mt-1">1 / 2</h4>
                            <p className="text-[11px] text-gray-500">Espacios listos para albergar mallas horarias.</p>
                        </div>
                        <div className="w-10 h-10 bg-emerald-50 flex items-center justify-center text-emerald-600 rounded-lg">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="glass-card p-4 border border-purple-50 flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Mantenimiento Preventivo</p>
                            <h4 className="text-2xl font-anton text-amber-600 mt-1">1 Espacios</h4>
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
                    {classrooms.length > 0 ? (
                        classrooms.map((classroom) => (
                            <div
                                key={classroom.id}
                                className="glass-card p-5 shadow-sm border border-purple-50 flex flex-col justify-between hover:shadow-md transition"
                            >
                                <div>
                                    {/* Encabezado Fila */}
                                    <div className="flex justify-between items-start gap-3">
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <span
                                                    className={`text-[9px] font-questrial font-bold px-1.5 py-0.5 ${classroom.type === "mirrors"
                                                        ? "bg-purple-100 text-purple-700"
                                                        : classroom.type === "urban"
                                                            ? "bg-pink-100 text-pink-700"
                                                            : classroom.type === "free"
                                                                ? "bg-green-100 text-green-700" : classroom.type === "theories"
                                                                    ? "bg-orange-100 text-orange-700" : "bg-indigo-100 text-indigo-700"
                                                        }`}
                                                >
                                                    {classroom.type}
                                                </span>
                                            </div>
                                            <h3 className="font-anton text-gray-800 text-base mt-1">
                                                {classroom.name}
                                            </h3>
                                            <p className="text-xs text-purple-600 font-questrial font-semibold">
                                                {classroom.address}
                                            </p>
                                        </div>

                                        {/* Estado de la indumentaria */}
                                        <span
                                            className={`text-[10px] font-questrial font-bold px-2.5 py-1 ${classroom.status === "active"
                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                                : classroom.status === "maintenance"
                                                    ? "bg-amber-50 text-amber-700 border border-amber-100"
                                                    : "bg-pink-50 text-pink-700 border border-pink-100"
                                                }`}
                                        >
                                            {classroom.status}
                                        </span>
                                    </div>

                                </div>

                                {/* Métricas de Uso y Alquileres */}
                                <div className=" pt-4 border-t border-purple-50/60 space-y-2">
                                    <div className="flex justify-between text-xs font-questrial font-medium text-gray-500">
                                        <div className="flex items-center">

                                            <span>
                                                Capacidad:{" "}
                                                <strong className="text-gray-700">
                                                    {classroom.maxCapacity} cupos
                                                </strong>
                                            </span>
                                        </div>


                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => alert(`Apertura del módulo de edición para el salón: ${classroom.name}`)}
                                                className="p-1.5 hover:bg-purple-50 text-gray-400 hover:text-purple-700 transition rounded cursor-pointer"
                                                title="Editar Parámetros"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClassroom(classroom.id)}
                                                className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 transition rounded cursor-pointer"
                                                title="Remover Locación"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
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
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white border border-purple-100 shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-150 rounded-none">
                        {/* Cabecera del Modal */}

                        <div className="bg-purple-50/50 px-5 py-4 border-b border-purple-100 flex justify-between items-center">
                            <h3 className="font-anton text-gray-800 text-sm uppercase tracking-wider flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-purple-600" /> Dar de alta Salón
                            </h3>

                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Formulario */}

                        <form
                            onSubmit={handleSave}
                            className="p-5 space-y-4 font-questrial text-xs"
                        >
                            {errorMsg && <p className="text-red-500 bg-red-50 p-2 rounded text-sm text-center mb-4">{errorMsg}</p>}

                            <div className="grid grid-cols-1 gap-3">
                                <div>
                                    <label className="block text-gray-500 font-bold mb-1">
                                        Nombre de la Estructura / Aula *
                                    </label>

                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-500 font-bold mb-1">
                                    Dirección
                                </label>

                                <textarea
                                    required
                                    rows={3}
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400"
                                ></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-3">

                                <div>
                                    <label className="block text-gray-500 font-bold mb-1">
                                        Especialidad de Área
                                    </label>

                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value as Classroom["type"] })}
                                        className="w-full p-2 border border-purple-100 bg-white focus:outline-none focus:border-purple-400"
                                    >
                                        <option value="mirrors">Área Espejos</option>
                                        <option value="urban">Área Urbano</option>
                                        <option value="free">Estudio Libre</option>
                                        <option value="theories">Aula de Teorías</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-500 font-bold mb-1">
                                        Estado Operativo
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as Classroom["status"] })}
                                        className="w-full p-2 border border-purple-100 bg-white focus:outline-none focus:border-purple-400"
                                    >
                                        <option value="active">Activo</option>
                                        <option value="maintenance">En Mantenimiento</option>
                                    </select>
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
                            </div>

                            <div>
                                <label className="block text-gray-500 font-bold mb-1">Descripción de Equipamiento</label>
                                <textarea
                                    rows={3}
                                    placeholder="Detalla si el salón cuenta con barras de ballet, aire acondicionado o tipos específicos de pisos..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 resize-none"
                                />
                            </div>


                            {/* Botonera */}

                            <div className="pt-2 flex justify-between">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="cursor-pointer font-questrial px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="

                                        font-questrial px-4 py-2 flex items-center justify-center gap-2 font-medium transition text-xs cursor-pointer

                                        gradient-purple text-white shadow-md shadow-purple-200 hover:opacity-90

                                    "
                                >
                                    Registrar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


        </>
    );
}