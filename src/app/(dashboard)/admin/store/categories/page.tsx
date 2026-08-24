// src/app/(dashboard)/store/categories/page.tsx
"use client";

import { useState, useTransition, useEffect } from "react";
import { useModal } from "@/hooks/useModal";
import {
    Plus, Search, Trash2, Pencil
} from "lucide-react";
import { toast } from "react-hot-toast";
import { ProductCategory } from "@/types/product-category";
import DataTable, { Column } from "@/components/common/DataTable";
import HeroSection from "@/components/layout/HeroSection";
import { MacDockModal } from "@/components/ui/MacDockModal";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import {
    saveProductCategoryAction,
    getAllProductCategoriesAction,
    deleteProductCategoryAction
} from "@/app/actions/product-category";

type ProductCategoryFormData = {
    name: string,
};
const initialFormState: ProductCategoryFormData = {
    name: "",
};
export default function ProductCategoriesPage() {
    const [isPending, startTransition] = useTransition();
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const { isOpen, openModal, closeModal } = useModal();
    const [meta, setMeta] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        itemCount: 0,
    });
    const [formData, setFormData] = useState<ProductCategoryFormData>(initialFormState);
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
    const closeConfirmModal = () => setModalConfig((prev) => ({ ...prev, isOpen: false }));
    // Acción definitiva que se ejecuta al pasar el filtro del Modal
    const handleConfirmAction = async () => {
        if (modalConfig?.id) {
            startTransition(async () => {
                if (modalConfig?.id) {
                    const res = await deleteProductCategoryAction(modalConfig.id);
                    if (res.success) {
                        toast.success("Operación exitosa");
                        fetchData(currentPage, itemsPerPage);
                        // 🎯 REACTIVIDAD: Notificamos al Sidebar de forma inmediata
                        window.dispatchEvent(new Event('refresh-product-categories-count'));
                    }
                }
            });
        }
    };
    const [editingId, setEditingId] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    // Estados de Filtros
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    // 🎯 Configuración declarativa de las columnas
    const columns: Column<ProductCategory>[] = [
        {
            header: "Categoría",
            render: (category) => {
                const initial = category.name ? category.name[0].toUpperCase() : "C";
                return (
                    <div className="flex items-center gap-2 p-1">
                        <div className="w-8 h-8 rounded-full bg-[#5e0472] flex items-center justify-center text-white text-xs font-anton tracking-wider shrink-0">
                            {initial}
                        </div>
                        <div className="flex flex-col text-left font-questrial">
                            <span className="text-xs font-bold text-gray-700 leading-tight">
                                {category.name}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                                #{category.id.slice(-6)}
                            </span>
                        </div>
                    </div>
                );
            },
        },
        {
            header: "Productos Asociados",
            render: (category) => {
                const count = category.products?.length || 0;
                return (
                    <span className="inline-flex items-center text-xs font-questrial font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full">
                        {count} {count === 1 ? "artículo" : "artículos"}
                    </span>
                );
            },
        },
        {
            header: "Fecha de Registro",
            render: (category) => (
                <span className="text-[11px] text-gray-500 font-questrial">
                    {category.createdAt
                        ? new Date(category.createdAt).toLocaleDateString("es-CO", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        })
                        : "—"}
                </span>
            ),
        },
        {
            header: "Acciones",
            className: "text-right",
            render: (category) => (
                <div className="flex gap-2 justify-end">
                    <div className="relative inline-block group">
                        <button
                            onClick={() => {
                                setEditingId(category.id);
                                setFormData({ name: category.name });
                                openModal();
                            }}
                            className="cursor-pointer flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-questrial font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors active:scale-95"
                        >
                            <Pencil className="w-3.5 h-3.5" /> Editar
                        </button><div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-3 py-1.5 pointer-events-none">
                            Editar
                        </div></div>

                    <div className="relative inline-block group">
                        <button
                            onClick={() => {
                                setModalConfig({
                                    isOpen: true,
                                    type: "word",
                                    title: "Eliminar categoría",
                                    description: `¿Seguro que deseas eliminar la categoría "${category.name}"?`,
                                    id: category.id,
                                });
                            }}
                            disabled={(category.products?.length || 0) > 0}
                            title={
                                (category.products?.length || 0) > 0
                                    ? "No puedes eliminar una categoría con productos asignados"
                                    : ""
                            }
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-questrial font-bold  rounded-xl transition-colors active:scale-95  ${(category.products?.length || 0) === 0
                                ? " text-rose-600 bg-rose-50 hover:bg-rose-100 cursor-pointer"
                                : "border-gray-100 bg-gray-100 text-gray-400 cursor-not-allowed"
                                }`}
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Eliminar
                        </button><div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-3 py-1.5 pointer-events-none">
                            Eliminar
                        </div></div>
                </div>
            ),
        },
    ];
    const handleLimitChange = (newLimit: number) => {
        setItemsPerPage(newLimit);
        setCurrentPage(1); // 💡 Regla de oro: Si cambias el límite, regresa siempre a la página 1
    };
    // 3️⃣ 🎯 MANEJADOR DE CAMBIO DE PÁGINA
    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };
    // Limpiar el formulario al cerrar el modal
    const handleCloseModal = () => {
        setEditingId(null);
        setFormData(initialFormState);
        setErrorMsg(null);
        closeModal();
    };
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        startTransition(async () => {
            const res = await saveProductCategoryAction(formData, editingId);
            if (!res.success) {
                setErrorMsg(res.error || "Ocurrió un error.");
                return;
            }
            toast.success("Operación exitosa");
            // Sincronizar estado local
            if (editingId) {
                setCategories(categories.map((item) => (item.id === editingId ? res.data! : item)));
            } else {
                setCategories([res.data!, ...categories]);
                // 🎯 REACTIVIDAD: Si era una creación (id nuevo), el badge debe subir
                window.dispatchEvent(new Event('refresh-product-categories-count'));
            }
            closeModal();
        });

    };
    const fetchData = (pageToFetch: number, limitToFetch: number) => {
        startTransition(async () => {
            const res1 = await getAllProductCategoriesAction({
                page: pageToFetch,
                limit: limitToFetch, // 🎯 Enviamos el límite dinámico
                search: searchTerm || undefined,
            });
            if (res1.success && res1.data) {
                setCategories(res1.data);
                setMeta(res1.meta); // NestJS ya devuelve el "itemsPerPage" en su meta
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
            {/* HERO SECTION DE LA SECCIÓN */}
            <HeroSection
                htmlTitle={`<em class="text-[#5e0472]">Categorías de Productos</em> de la tienda`}
                htmlSubTitle="Administra las categorías."
                actions={[
                    {
                        label: "Registrar categoría de Producto",
                        onClick: () => {
                            setFormData(initialFormState);
                            setEditingId(null);
                            setErrorMsg(null);
                            openModal()
                        },
                        icon: <Plus className="w-4 h-4" />,
                        variant: "secondary" as const,
                    },
                ]}
            />
            <div className="p-4 md:p-8 w-full overflow-y-auto space-y-6">
                {/* BARRA DE BÚSQUEDA */}
                <div className="glass-card p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-purple-100 font-questrial text-xs bg-white/50 focus:outline-none focus:border-purple-400 transition text-gray-700"
                        />
                    </div>
                </div>
                {/* TABLA DE ALUMNOS */}
                <DataTable
                    data={categories}
                    columns={columns}
                    meta={meta}
                    isLoading={isPending}
                    onPageChange={handlePageChange}
                    onLimitChange={handleLimitChange} // 👈 Pasamos el manejador del límite
                    rowKey={(category) => category.id}
                    emptyMessage="No se encontraron categorías registrados en la academia."
                />
            </div>
            <MacDockModal
                isOpen={isOpen}
                onClose={handleCloseModal}
                title={editingId ? "Editar Categoría" : "Nueva Categoría de Producto"}
                size={"md"}
            >
                {/* Formulario de Categoría */}
                <form
                    onSubmit={handleSave}
                    className="space-y-4 font-questrial text-xs"
                >
                    {errorMsg && (
                        <p className="text-red-500 bg-red-50 p-2 rounded text-xs text-center border border-red-100">
                            {errorMsg}
                        </p>
                    )}

                    <div>
                        <label className="block text-gray-600 font-bold mb-1">
                            Nombre de la Categoría <span className="text-purple-600">*</span>
                        </label>

                        <input
                            required
                            type="text"
                            placeholder="Ej: Accesorios, Calzado, Uniformes..."
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            className="w-full p-2.5 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 text-xs rounded-sm transition"
                        />
                    </div>

                    {/* Botonera de Acciones */}
                    <div className="pt-4 flex justify-between items-center border-t border-gray-100 mt-4">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="cursor-pointer font-questrial px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition rounded-xs"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="font-questrial px-5 py-2 flex items-center justify-center gap-2 font-medium transition text-xs cursor-pointer gradient-purple text-white shadow-xs hover:opacity-90 disabled:opacity-50 rounded-xs"
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