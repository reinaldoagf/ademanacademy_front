// src/app/(dashboard)/admin/classrooms/page.tsx
"use client";
import { useState, useTransition, useEffect } from "react";
import {
    Plus,
    Search,
    Trash2,
    Pencil,
    ChevronLeft,
    ChevronRight,
    Calendar,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useModal } from "@/hooks/useModal";
import HeroSection from "@/components/layout/HeroSection";
import DatePipe from "@/components/pipes/DatePipe";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { MacDockModal } from "@/components/ui/MacDockModal";
import { ActionButton } from '@/components/ui/ActionButton';
import { TextInput, TextArea, SelectInput } from "@/components/ui/forms";
import { saveClassroomAction, getAllClassroomsAction, deleteClassroomAction } from "@/app/actions/classroom";
import { Classroom } from "@/types/classroom";
import { APP_KEYS } from "@/consts/app";

export default function ClassroomsPage() {
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const { isOpen, openModal, closeModal } = useModal();
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

    const closeConfirmModal = () => setModalConfig((prev) => ({ ...prev, isOpen: false }));
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
                        window.dispatchEvent(new Event(APP_KEYS.REFRESH_CLASSROOMS_COUNT));
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
                window.dispatchEvent(new Event(APP_KEYS.REFRESH_CLASSROOMS_COUNT));
            }
            // 🎯 REACTIVIDAD: Si era una creación (id nuevo), el badge debe subir
            closeModal();
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
        openModal();
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
                            openModal()
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
                                className="glass-card bg-white border border-purple-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-300 flex flex-col justify-between"
                            >
                                {/* Cabecera de la tarjeta */}
                                <div className="p-5 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-sm font-questrial font-bold text-gray-800 hover:text-[#5e0472] transition cursor-pointer">
                                            {classroom.name}
                                        </h3>

                                        {
                                            classroom.createdAt && (
                                                <div className="flex items-center gap-1 text-gray-400 text-[11px] font-questrial">
                                                    <Calendar className="w-3 h-3" />
                                                    <DatePipe value={classroom.createdAt} format="short" />
                                                </div>
                                            )
                                        }
                                    </div>

                                    {/* Sub-métricas vectoriales del plano */}
                                    <div className="grid grid-cols-2 gap-2 pt-3 text-center border-t border-dashed border-gray-100">
                                        <div className="bg-slate-50 p-2">
                                            <p className="text-[10px] text-gray-400 font-questrial uppercase font-medium">
                                                Dirección
                                            </p>
                                            <p className="text-xs font-questrial font-bold text-gray-700">
                                                {classroom.address || 'No registrado'}
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 p-2">
                                            <p className="text-[10px] text-gray-400 font-questrial uppercase font-medium">
                                                Capacidad
                                            </p>
                                            <p className="text-xs font-questrial font-bold text-gray-700">
                                                {classroom.maxCapacity || 'No registrado'}
                                            </p>
                                        </div>
                                    </div>


                                </div>

                                {/* Acciones y Footer de la tarjeta */}
                                <div className="px-5 py-3 bg-slate-50 border-t border-gray-100 w-full flex items-center justify-between gap-1.5">
                                    <ActionButton
                                        variant="danger"
                                        icon={Trash2}
                                        tooltip="Eliminar"
                                        onClick={() => {
                                            setModalConfig({
                                                isOpen: true,
                                                type: "word",
                                                title: "Confirmar operación",
                                                description: "¿Quieres eliminar el registro de tu salón de clases?",
                                                id: classroom.id,
                                            });
                                        }}
                                    >
                                        Eliminar
                                    </ActionButton>
                                    <ActionButton
                                        variant="success"
                                        icon={Pencil}
                                        tooltip="Editar"
                                        onClick={() => handleEditModal(classroom)}
                                    >
                                        Editar
                                    </ActionButton>
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
                    <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-center gap-6 border border-purple-50/60 shadow-xs">
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

            <MacDockModal
                isOpen={isOpen}
                onClose={closeModal}
                title={editingId ? "Actualizar Salón de Clases" : "Registrar Nuevo Salón de Clases"}
                size={"lg"}
            >
                {/* Formulario */}

                <form
                    onSubmit={handleSave}
                    className="space-y-4 font-questrial text-xs"
                >
                    {errorMsg && <p className="text-red-500 bg-red-50 p-2 rounded text-sm text-center mb-4">{errorMsg}</p>}

                    <div className="grid grid-cols-1 gap-3">
                        <TextInput
                            label="Nombre de la Estructura / Aula *"
                            required
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Nombre de la Estructura / Aula *"
                        />

                    </div>

                    <div>
                        <TextArea
                            label="Dirección"
                            placeholder="Ej. Calle Principal #123..."
                            required
                            rows={3}
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <SelectInput
                            label="Especialidad de Área"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            options={[
                                { label: "Selecciona una especialidad", value: "", disabled: true },
                                { label: "Mirrors", value: "mirrors" },
                                { label: "Urbano", value: "urban" },
                                { label: "Estudio Libre", value: "free" },
                                { label: "Aula de Teorías", value: "theories" },
                            ]}
                        />

                        <SelectInput
                            label="Estado Operativo"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as Classroom["status"] })}
                            options={[
                                { label: "Selecciona un estado", value: "", disabled: true },
                                { label: "Activo", value: "active" },
                                { label: "Mantenimiento", value: "maintenance" },
                            ]}
                        />
                        {/* min={1}
                                max={60} */}
                        <TextInput
                            label="Aforo Máximo de Seguridad (Alumnos) *"
                            type="number"
                            step="0.01"
                            required
                            value={formData.maxCapacity}
                            onChange={(e) => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
                            placeholder="0.00"
                        />

                    </div>

                    <div>
                        <TextArea
                            label="Descripción de Equipamiento"
                            placeholder="Detalla si el salón cuenta con barras de ballet, aire acondicionado o tipos específicos de pisos..."
                            required
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>


                    {/* Botonera */}

                    <div className="pt-2 flex justify-between">
                        <button
                            type="button"
                            onClick={() => closeModal()}
                            className="cursor-pointer font-questrial px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50 rounded-md"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="font-questrial px-5 py-2 flex items-center justify-center gap-2 font-medium transition text-xs cursor-pointer gradient-purple text-white shadow-md shadow-purple-200 hover:opacity-90 disabled:opacity-50 rounded-md"
                        >
                            {isPending
                                ? "Guardando..."
                                : editingId
                                    ? "Actualizar Salón"
                                    : "Registrar Salón"}
                        </button>
                    </div>
                </form>
            </MacDockModal>
            {/* INSTANCIA ÚNICA DEL MODAL DINÁMICO */}
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={closeConfirmModal}
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