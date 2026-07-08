// src/app/(dashboard)/admin/classrooms/page.tsx
"use client";
import { useState, useTransition, useEffect } from "react";
import {
    Plus,
    Sparkles,
    Search,
    Trash2,
    Edit3,
    X,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import HeroSection from "@/components/layout/HeroSection";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { saveClassroomAction, getAllClassroomsAction, deleteClassroomAction } from "@/app/actions/classroom";
import { Classroom } from "@/types/classroom";

export default function ClassroomPage() {
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
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
    const [meta, setMeta] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 6,
        itemCount: 6,
    });
    const [isPending, startTransition] = useTransition();
    const [activeTab, setActiveTab] = useState<"all" | "active" | "maintenance">("all");
    const [typeOfRoom, setTypeOfRoom] = useState<"all" | "mirrors" | "urban" | "free" | "theories">("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);

    // Estado del formulario interno del modal
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        maxCapacity: 20,
        type: "mirrors" as Classroom["type"],
        status: "active" as Classroom["status"],
        description: ""
    });

    const closeModal = () => setModalConfig((prev) => ({ ...prev, isOpen: false }));
    // Acción definitiva que se ejecuta al pasar el filtro del Modal
    const handleConfirmAction = async () => {
        if (modalConfig?.id) {
            startTransition(async () => {
                if (modalConfig?.id) {
                    const res = await deleteClassroomAction(modalConfig.id);
                    if (res.success) {
                        toast.success("Operación exitosa");
                        setClassrooms(classrooms.filter((item) => item.id !== modalConfig.id));
                        // 🎯 REACTIVIDAD: Notificamos al Sidebar de forma inmediata
                        window.dispatchEvent(new Event('refresh-classrooms-count'));
                    }
                }
            });
        }
    };
    // Manejo de inserción de nuevo salón
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        startTransition(async () => {
            const res = await saveClassroomAction(formData, editingId);
            if (!res.success) {
                setErrorMsg(res.error || "Ocurrió un error.");
                return;
            }
            toast.success("Operación exitosa");
            // Sincronizar estado local
            if (editingId) {
                setClassrooms(classrooms.map((item) => (item.id === editingId ? res.data! : item)));
            } else {
                setClassrooms([res.data!, ...classrooms]);
                // 🎯 REACTIVIDAD: Si era una creación (id nuevo), el badge debe subir
                window.dispatchEvent(new Event('refresh-classrooms-count'));
            }
            // 🎯 REACTIVIDAD: Si era una creación (id nuevo), el badge debe subir
            setIsModalOpen(false);



        });
    };


    const handleEditModal = (classroom: any) => { // Puedes usar la interfaz de tu Student de Prisma
        setFormData({
            name: classroom.name || "",
            address: classroom.address || "",
            maxCapacity: classroom.maxCapacity || "",
            type: classroom.type,
            status: classroom.status,
            description: classroom.description || ""
        });
        setEditingId(classroom.id);
        setErrorMsg(null);
        setIsModalOpen(true);
    };

    const fetchData = (pageToFetch: number, limitToFetch: number) => {
        startTransition(async () => {
            const res = await getAllClassroomsAction({
                page: pageToFetch,
                limit: limitToFetch, // 🎯 Enviamos el límite dinámico
                search: searchTerm || undefined,
                status: activeTab == 'all' ? undefined : activeTab,
                type: typeOfRoom == 'all' ? undefined : typeOfRoom
            });

            if (res.success && res.data) {
                setClassrooms(res.data);
                setMeta(res.meta); // NestJS ya devuelve el "itemsPerPage" en su meta
            }
        });
    };

    // Resetear a la página 1 cuando cambien los filtros de búsqueda o categorías
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, activeTab, typeOfRoom]);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchData(currentPage, itemsPerPage);
        }, 300);

        return () => clearTimeout(handler);
    }, [searchTerm, activeTab, typeOfRoom, currentPage, itemsPerPage]);

    return (
        <>
            <HeroSection
                htmlTitle={`Salones de <em class="text-[#5e0472]">Clases</em>`}
                htmlSubTitle={`Administra la infraestructura física de la academia, aforos máximos permitidos y estatus de mantenimiento.`}
                actions={[
                    {
                        label: "Nuevo Salón →",
                        onClick: () => {
                            setFormData({
                                name: "",
                                address: "",
                                maxCapacity: 20,
                                type: "mirrors" as Classroom["type"],
                                status: "active" as Classroom["status"],
                                description: ""
                            });
                            setEditingId(null);
                            setErrorMsg(null);
                            setIsModalOpen(true)
                        },
                        icon: <Plus className="w-4 h-4" />,
                    },
                ]}
            />

            <div className="p-4 md:p-8 w-full space-y-6">

                {/* FILTROS POR CATEGORÍA DE SALÓN */}
                <div className="glass-card p-4 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
                    {/* Buscador e Infraestructura */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-center justify-end">
                        <div className="relative w-full sm:w-64">
                            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, descripción, y/o dirección..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-purple-100 font-questrial text-xs bg-white/50 focus:outline-none focus:border-purple-400 transition text-gray-700"
                            />
                        </div>
                        <select
                            value={typeOfRoom}
                            onChange={(e: any) => setTypeOfRoom(e.target.value)}
                            className="p-2 w-full sm:w-auto border border-purple-100 font-questrial text-xs bg-white text-gray-700 focus:outline-none"
                        >
                            <option value="all">Todos los salones</option>
                            <option value="mirrors">Salones Espejos</option>
                            <option value="urban">Salones Urbano</option>
                            <option value="free">Salones Libre</option>
                            <option value="theories">Salones Teorias</option>
                        </select>
                    </div>
                    {/* Pestañas de Tipo */}
                    <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 justify-end">
                        <button
                            onClick={() => setActiveTab("all")}
                            className={`px-3 py-1.5 text-xs font-questrial font-semibold transition cursor-pointer whitespace-nowrap ${activeTab === "all" ? "bg-[#5e0472] text-white shadow-sm shadow-purple-100" : "bg-white border border-purple-50 text-gray-400 hover:text-[#5e0472]"}`}
                        >
                            Todos
                        </button>
                        <button
                            onClick={() => setActiveTab("active")}
                            className={`px-3 py-1.5 text-xs font-questrial font-semibold transition cursor-pointer whitespace-nowrap ${activeTab === "active" ? "bg-[#5e0472] text-white shadow-sm shadow-purple-100" : "bg-white border border-purple-50 text-gray-400 hover:text-[#5e0472]"}`}
                        >
                            Activo
                        </button>
                        <button
                            onClick={() => setActiveTab("maintenance")}
                            className={`px-3 py-1.5 text-xs font-questrial font-semibold transition cursor-pointer whitespace-nowrap ${activeTab === "maintenance" ? "bg-[#5e0472] text-white shadow-sm shadow-purple-100" : "bg-white border border-purple-50 text-gray-400 hover:text-[#5e0472]"}`}
                        >
                            Mantenimiento
                        </button>
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
                                                onClick={() => handleEditModal(classroom)}
                                                className="p-1.5 hover:bg-purple-50 text-gray-400 hover:text-purple-700 transition rounded cursor-pointer"
                                                title="Editar Parámetros"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setModalConfig({
                                                        isOpen: true,
                                                        type: "word",
                                                        title: "Confirmar operación",
                                                        description: "¿Quieres eliminar el registro de tu salón de clases?",
                                                        id: classroom.id,
                                                    });
                                                }}
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

                {/* Seccion de Paginación */}
                {meta.totalPages > 1 && (
                    <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-purple-50/60 shadow-xs">
                        <div className="text-xs font-questrial text-gray-500">
                            Mostrando <span className="font-semibold text-gray-700">{classrooms.length}</span> de{" "}
                            <span className="font-semibold text-gray-700">{meta.totalItems}</span> salones
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Selector de Items por Página */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-questrial text-gray-400">Ver:</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1); // Volver a la 1 tras cambiar el límite
                                    }}
                                    className="p-1 border border-purple-100 font-questrial text-xs bg-white text-gray-700 focus:outline-none"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>

                            {/* Controles de Navegación */}
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={meta.currentPage === 1 || isPending}
                                    className="p-1.5 border border-purple-50 bg-white text-gray-600 hover:bg-purple-50 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer rounded-xs"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                <span className="text-xs font-questrial px-3 py-1 bg-[#5e0472]/5 text-[#5e0472] font-semibold">
                                    Pág. {meta.currentPage} de {meta.totalPages}
                                </span>

                                <button
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, meta.totalPages))}
                                    disabled={meta.currentPage === meta.totalPages || isPending}
                                    className="p-1.5 border border-purple-50 bg-white text-gray-600 hover:bg-purple-50 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer rounded-xs"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL: APERTURA / REGISTRO DE SALÓN */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white border border-purple-100 shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-150 rounded-none">
                        {/* Cabecera del Modal */}

                        <div className="bg-purple-50/50 px-5 py-4 border-b border-purple-100 flex justify-between items-center">
                            <h3 className="font-anton text-gray-800 text-sm uppercase tracking-wider flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-purple-600" />
                                {editingId ? 'Actualizar Salón' : 'Dar de alta Salón'}
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
                                    className="font-questrial px-4 py-2 flex items-center justify-center gap-2 font-medium transition text-xs cursor-pointer gradient-purple text-white shadow-md shadow-purple-200 hover:opacity-90"
                                >
                                    {editingId ? 'Actualizar' : 'Registrar'}
                                </button>
                            </div>
                        </form>
                    </div>
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