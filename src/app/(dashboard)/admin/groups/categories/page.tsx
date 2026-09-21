// src/app/(dashboard)/admin/groups/categories/page.tsx
"use client";
import { useState, useTransition, useEffect } from "react";

import {
    Plus,
    BookmarkCheck,
    User, Search,
    ChevronLeft, ChevronRight,
    Trash2, Pencil, CalendarDays
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useModal } from "@/hooks/useModal";
import { MacDockModal } from "@/components/ui/MacDockModal";
import { ActionButton } from "@/components/ui/ActionButton";
import HeroSection from "@/components/layout/HeroSection";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { TextInput, RangeSliderInput } from "@/components/ui/forms";
import { getAllGroupCategoriesAction, saveGroupCategoryAction, deleteGroupCategoryAction } from "@/app/actions/group-category";
import { GroupCategory } from "@/types/group-category";
// 1. Tipado preciso para los datos que controla el formulario
type GroupFormData = Omit<GroupCategory, "id">;

// 2. Estado inicial limpio del formulario
const initialFormState: GroupFormData = {
    name: "",
    minimumAge: 5,
    maximumAge: 10,
};

export default function GroupsCategroiesPage() {
    const [groupCategories, setGroupCategories] = useState<GroupCategory[]>([]);
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
    const { isOpen, openModal, closeModal } = useModal();
    const [meta, setMeta] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 6,
        itemCount: 6,
    });

    const closeConfirmModal = () => setModalConfig((prev) => ({ ...prev, isOpen: false }));
    // Acción definitiva que se ejecuta al pasar el filtro del Modal
    const handleConfirmAction = async () => {
        if (modalConfig?.id) {
            startTransition(async () => {
                if (modalConfig?.id) {
                    const res = await deleteGroupCategoryAction(modalConfig.id);
                    if (res.success) {
                        toast.success("Operación exitosa");
                        fetchData(currentPage, itemsPerPage);
                    }
                }
            });
        }
    };
    // Estado del formulario tipado correctamente
    const [formData, setFormData] = useState<GroupFormData>(initialFormState);
    const [isPending, startTransition] = useTransition();
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);
    const [editingId, setEditingId] = useState<string | null>(null)
    const handleEditModal = (groupCategory: GroupCategory) => { // Puedes usar la interfaz de tu Student de Prisma
        setFormData({
            name: groupCategory.name || "",
            minimumAge: groupCategory.minimumAge || 1,
            maximumAge: groupCategory.maximumAge || 3,
        });
        setEditingId(groupCategory.id);
        setErrorMsg(null);
        openModal();
    };
    const handleSave = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMsg(null);

        // Validaciones preventivas en el cliente
        if (!formData.name.trim()) {
            setErrorMsg("El nombre de la categoría de grupo es obligatorio.");
            return;
        }

        try {
            startTransition(async () => {
                const res = await saveGroupCategoryAction(formData, editingId);

                if (!res.success) {
                    setErrorMsg(res.error || "Ocurrió un error.");
                    return;
                }

                toast.success("Operación exitosa");
                fetchData(currentPage, itemsPerPage);
                // 🎯 REACTIVIDAD: Si era una creación (id nuevo), el badge debe subir
                closeModal();
            });

            // Si todo sale bien, refrescamos y limpiamos estados
            closeModal();
            setFormData(initialFormState); // Resetea el formulario para el siguiente registro

        } catch (error: any) {
            console.error("Error detectado en handleSave:", error);
            setErrorMsg(error.message || "Ocurrió un problema de red al intentar crear el grupo.");
        }
    };
    const fetchData = (pageToFetch: number, limitToFetch: number) => {
        startTransition(async () => {
            const res = await getAllGroupCategoriesAction({
                page: pageToFetch,
                limit: limitToFetch, // 🎯 Enviamos el límite dinámico
                search: searchTerm || undefined,
            });

            if (res.success && res.data) {
                setGroupCategories(res.data);
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

            {/* SUB-TOPBAR (Saludos y Acción rápida) */}
            <HeroSection
                htmlTitle={`Categorías de Grupos de <em class="text-[#5e0472]">Clases</em>`}
                htmlSubTitle={`Monitorea el uso de los grupos de clases.`}
                actions={[{
                    label: "Registrar Nueva Categoría de Grupo →",
                    onClick: () => {
                        setFormData(initialFormState);
                        openModal()
                    },
                    icon: <Plus className="w-4 h-4" />,
                    variant: "primary",
                }]}
            />

            <div className="p-4 md:p-8 w-full overflow-y-auto space-y-6">

                <div className="glass-card p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
                    {/* Buscador */}
                    <div className="relative w-full md:w-80">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o estilo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-purple-100 font-questrial text-xs bg-white/50 focus:outline-none focus:border-purple-400 transition text-gray-700"
                        />
                    </div>

                </div>
                {/* FLUJO TIPO TIME-LINE / TARJETAS */}
                <div className="space-y-4">
                    {groupCategories.length > 0 ? (
                        groupCategories.map((groupCategory) => (
                            <div
                                key={groupCategory.id}
                                className={`glass-card p-5 shadow-sm border transition flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-[#5e0472] bg-purple-50/10`}
                            >
                                {/* Información e Identificador */}
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:w-2/5">
                                    {/* Iconografía por tipo */}
                                    <div className={`w-11 h-11 flex items-center justify-center shrink-0 bg-pink-100 text-pink-700`}>
                                        <BookmarkCheck className="w-5 h-5" />
                                    </div>

                                    <div>
                                        <h3 className="font-anton text-gray-800 text-base mt-1">{groupCategory.name}</h3>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-xs md:w-2/5 text-gray-500 font-medium">

                                    <div className="flex items-center gap-2 col-span-2">
                                        <User className="w-4 h-4 text-indigo-400 shrink-0" />
                                        <span className="font-questrial">Edad mínima: <strong className="text-gray-700 font-semibold">{groupCategory.minimumAge} años</strong></span>
                                    </div>
                                    <div className="flex items-center gap-2 col-span-2">
                                        <User className="w-4 h-4 text-indigo-400 shrink-0" />
                                        <span className="font-questrial">Edad máxima: <strong className="text-gray-700 font-semibold">{groupCategory.maximumAge} años</strong></span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-purple-50/50 shrink-0 font-questrial">
                                    <ActionButton
                                        variant="success"
                                        icon={Pencil}
                                        tooltip="Editar Parámetros"
                                        onClick={() => handleEditModal(groupCategory)}
                                    >
                                        Editar
                                    </ActionButton>
                                    <ActionButton
                                        variant="danger"
                                        icon={Trash2}
                                        tooltip="Eliminar"
                                        onClick={() => {
                                            setModalConfig({
                                                isOpen: true,
                                                type: "word",
                                                title: "Confirmar operación",
                                                description: "¿Quieres eliminar el registro del grupo?",
                                                id: groupCategory.id,
                                            });
                                        }}
                                    >
                                        Eliminar
                                    </ActionButton>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-16 border border-dashed border-purple-100 bg-white">
                            <CalendarDays className="w-10 h-10 text-purple-200 mx-auto mb-3" />
                            <p className="font-questrial text-xs text-gray-400">
                                {isPending ? "Sincronizando..." : "No hay categorías de grupos registrados para este filtro."}
                            </p>
                        </div>
                    )}
                </div>
                {/* Seccion de Paginación */}
                {meta.totalPages > 1 && (
                    <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-center gap-6 border border-purple-50/60 shadow-xs">
                        <div className="text-xs font-questrial text-gray-500">
                            Mostrando <span className="font-semibold text-gray-700">{groupCategories.length}</span> de{" "}
                            <span className="font-semibold text-gray-700">{meta.totalItems}</span> categorías
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
                title={editingId ? "Actualizar Categoría de Grupo" : "Registrar Nueva Categoría de Grupo"}
                size={"lg"}
            >
                <form
                    className="space-y-4 font-questrial text-xs"
                    onSubmit={handleSave}
                >
                    {errorMsg && (
                        <p className="text-red-500 bg-red-50 p-2 text-sm text-center mb-4">
                            {errorMsg}
                        </p>
                    )}

                    {/* Fila 1: Nombre de la Categoría */}
                    <TextInput
                        label="Nombre de la Categoría *"
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ej: Juvenil"
                    />


                    {/* Fila 2: Barra Única de Rango Doble (Mínimo y Máximo) */}
                    <RangeSliderInput
                        label="Rango de Edad Permitido *"
                        minValue={formData.minimumAge ?? 3}
                        maxValue={formData.maximumAge ?? 18}
                        minLimit={1}
                        maxLimit={30}
                        unitLabel="años"
                        onRangeChange={(min, max) =>
                            setFormData({
                                ...formData,
                                minimumAge: min,
                                maximumAge: max,
                            })
                        }
                    />


                    {/* Botones de Acción */}
                    <div className="pt-2 flex justify-between">
                        <button
                            type="button"
                            onClick={closeModal}
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
                                    ? "Actualizar Categoría"
                                    : "Registrar Categoría"}
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