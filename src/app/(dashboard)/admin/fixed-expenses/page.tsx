// src/app/(dashboard)/admin/fixed-expenses/page.tsx
"use client";

import { useState, useTransition, useEffect, FormEvent, useRef } from "react";
import {
    Plus,
    Search,
    UserIcon,
    CreditCard,
    Trash2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import HeroSection from "@/components/layout/HeroSection";
import DataTable, { Column } from "@/components/common/DataTable";
import DatePipe from "@/components/pipes/DatePipe";
import { MacDockModal } from "@/components/ui/MacDockModal";
import { ActionButton } from "@/components/ui/ActionButton";
import { TextInput, DateInput, SelectInput } from "@/components/ui/forms";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { ExpenseFrequency, FixedExpense, FixedExpenseFormData } from "@/types/fixed-expense";
import { useSidebarStore } from "@/store/useSidebarStore";
import { formatDateForInput } from "@/helpers/dates";
import { useModal } from "@/hooks/useModal";
import { APP_KEYS } from "@/config/app-keys";
import { getAllFixedExpensesAction, saveFixedExpenseAction, deleteFixedExpenseAction } from "@/app/actions/fixed-expense";
const initialFormState: FixedExpenseFormData = {
    title: "",
    description: "",
    amount: 0,
    frequency: "Mensual",
    nextDueDate: "",
    supplierId: "",
};
export default function AdminFixedExpensesPage() {
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    // Estados para Modales
    const {
        isOpen: isFormOpen,
        openModal: openFormModal,
        closeModal: closeFormModal
    } = useModal();
    const setBadge = useSidebarStore((state) => state.setBadge);
    const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
    const [meta, setMeta] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 6,
        itemCount: 6,
    });
    const [isPending, startTransition] = useTransition();
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);
    const [selectedElement, setSelectedElement] = useState<FixedExpense | null>(null);
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
    // Formulario Nueva CXP
    const createFormReference = useRef<HTMLFormElement>(null);
    const [formData, setFormData] = useState(initialFormState);
    // 🎯 Configuración declarativa de las columnas
    const columns: Column<FixedExpense>[] = [
        {
            header: "Proveedor",
            render: (item) => {
                if (!item.supplier) {
                    return <p className="text-[11px] text-gray-400 mt-0.5">Sin proveedor</p>;
                }
                return (
                    <div className="flex items-center gap-2 p-1 hover:bg-purple-50/80 transition-all cursor-pointer rounded-sm">
                        <div className="w-8 h-8 rounded-full bg-[#5e0472] flex items-center justify-center text-white text-xs font-anton tracking-wider shrink-0">
                            <UserIcon className="w-3.5 h-3.5 shrink-0" />
                        </div>
                        <div className="hidden md:flex flex-col text-left font-questrial">
                            <span className="text-xs font-bold text-gray-700 leading-tight">{item.supplier.firstName} {item.supplier.lastName}</span>
                            <span className="text-[10px] text-gray-400 max-w-[120px] truncate">{item.supplier.email}</span>
                        </div>
                    </div>
                );
            },
        }, {
            header: "Título",
            render: (item) => (
                <div className="font-semibold text-slate-900">{item.title}</div>
            ),
        }, {
            header: "Descripción",
            render: (item) => (
                <div className="font-semibold text-slate-900">{item.description ?? 'Sin descripción'}</div>
            ),
        }, {
            header: "Frecuencia",
            render: (item) => (
                <div className="font-semibold text-slate-900">{item.frequency}</div>
            ),
        }, {
            header: "Próximo pago",
            render: (item) => (
                <DatePipe value={item.nextDueDate} format="short" />
            ),
        }, {
            header: "Monto",
            render: (item) => (
                <div className="font-semibold text-slate-900">
                    ${item.amount.toFixed(2)}
                </div>
            ),
        },

        {
            header: "Acciones",
            className: "text-right", // Alinea el encabezado a la derecha
            render: (element) => (<div className="flex gap-2 justify-end">
                <ActionButton
                    variant="success"
                    icon={CreditCard}
                    tooltip="Editar"
                    onClick={() => {
                        handleEditModal(element)
                    }}
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
                            description: "¿Quieres eliminar el registro de este gasto fijo?",
                            id: element.id,
                        });
                    }}
                >
                    Eliminar
                </ActionButton>
            </div>
            ),
        },
    ];
    const closeConfirmModal = () => setModalConfig((prev) => ({ ...prev, isOpen: false }));
    // Acción definitiva que se ejecuta al pasar el filtro del Modal
    const handleConfirmAction = async () => {
        if (modalConfig?.id) {
            startTransition(async () => {
                if (modalConfig?.id) {
                    const res = await deleteFixedExpenseAction(modalConfig.id);
                    if (res.success) {
                        toast.success("Operación exitosa");
                        fetchData(currentPage, itemsPerPage);
                    }
                }
            });
        }
    };
    const handleEditModal = (element: FixedExpense) => { // Puedes usar la interfaz de tu Student de Prisma
        setFormData({
            title: element.title || "",
            description: element.description || "",
            amount: element.amount || 0,
            frequency: element.frequency,
            nextDueDate: formatDateForInput(element.nextDueDate),
            supplierId: element.supplierId || "",
        });
        setSelectedElement(element);
        setErrorMsg(null);
        openFormModal();
    };
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null)

        // Validaciones preventivas en el cliente
        if (!formData.title.trim()) {
            setErrorMsg("El título es obligatorio.");
            return;
        }


        if (formData.amount <= 0) {
            setErrorMsg("El monto debe ser mayor a 0.");
            return;
        }

        if (!formData.nextDueDate) {
            setErrorMsg("La fecha de vencimiento es obligatoria.");
            return;
        }
        if (!formData.frequency) {
            setErrorMsg("La frecuencia es obligatoria.");
            return;
        }
        const res = await saveFixedExpenseAction(formData, selectedElement?.id || null);

        if (res.success) {
            toast.success("Gasto fijo guardado exitosamente");
            closeFormModal();
            setFormData(initialFormState);
            fetchData(currentPage, itemsPerPage);
        } else {
            toast.error(res.error || "Ocurrió un error al guardar.");
        }
    };
    // 3️⃣ 🎯 MANEJADOR DE CAMBIO DE PÁGINA
    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    // 🎯 MANEJADOR DE CAMBIO DE LÍMITE (Filas por página)
    const handleLimitChange = (newLimit: number) => {
        setItemsPerPage(newLimit);
        setCurrentPage(1); // 💡 Regla de oro: Si cambias el límite, vuelve siempre a la página 1
    };
    const fetchData = (pageToFetch: number, limitToFetch: number) => {
        startTransition(async () => {
            const res = await getAllFixedExpensesAction({
                page: pageToFetch,
                limit: limitToFetch, // 🎯 Enviamos el límite dinámico
                search: searchTerm || undefined,
            });

            if (res.success && res.data) {
                setFixedExpenses(res.data);
                setMeta(res.meta); // NestJS ya devuelve el "itemsPerPage" en su meta
                // 🎯 Cero peticiones extras: actualizamos el badge con el meta.totalItems recibido
                if (res.meta?.totalItems !== undefined) {
                    setBadge(APP_KEYS.FIXED_EXPENSES, res.meta.totalItems);
                }
            }
        });
    };
    // 🎯 MANEJADORES DE LA TABLA
    useEffect(() => {
        const handler = setTimeout(() => {
            fetchData(currentPage, itemsPerPage);
        }, 300);

        return () => clearTimeout(handler);
    }, [searchTerm, currentPage, itemsPerPage]);
    return (<>
        {/* HERO SECTION DE EVENTOS */}
        <HeroSection
            htmlTitle={`Gastos <em class="text-[#5e0472]">Fijos</em>`}
            htmlSubTitle="Lista de Gastos Fijos de la academia."
            actions={[
                {
                    label: "Registrar Gasto Fijo →",
                    onClick: () => openFormModal(),
                    icon: <Plus className="w-4 h-4" />,
                },
            ]}
        />
        <div className="p-4 md:p-8 w-full overflow-y-auto space-y-6">
            {/* CONTROLES Y FILTROS */}
            <div className="glass-card p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Buscar por título, descripción o proveedor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-purple-100 font-questrial text-xs bg-white/50 focus:outline-none focus:border-purple-400 transition text-gray-700"
                    />
                </div>

            </div>
            {/* TABLA DE CUENTAS POR PAGAR */}
            <DataTable
                data={fixedExpenses}
                columns={columns}
                meta={meta}
                isLoading={isPending}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange} // 👈 Pasamos el manejador del límite
                rowKey={(element) => element.id}
                emptyMessage="No se encontraron gastos fijos."
            />
        </div>


        {/* MODAL: NUEVO GASTO FIJO */}
        <MacDockModal
            isOpen={isFormOpen}
            onClose={closeFormModal}
            title={"Registrar Gasto Fijo"}
            size={"lg"}
        >
            <form
                ref={createFormReference}
                id="create-form" onSubmit={handleSave}
                className="flex-1 overflow-y-auto space-y-4 font-questrial text-xs scrollbar-thin pr-1"
            >
                {errorMsg && (
                    <p className="text-red-500 bg-red-50 p-2 text-sm text-center mb-4 border border-red-100">
                        {errorMsg}
                    </p>
                )}
                {/* 1. Título del Gasto Fijo */}
                <TextInput
                    label="Título del Gasto Fijo *"
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ej: Alquiler del Local, Internet, Luz"
                />

                {/* 2. Descripción opcional */}
                <TextInput
                    label="Descripción / Observaciones"
                    type="text"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ej: Pago mensual correspondiente al alquiler del espacio"
                />

                <div className="grid grid-cols-2 gap-4">
                    {/* 3. Monto Total ($) */}
                    <TextInput
                        label="Monto ($) *"
                        type="number"
                        step="0.01"
                        required
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0, })}
                        placeholder="0.00"
                    />

                    {/* 4. Frecuencia del Gasto Fijo */}

                    <SelectInput
                        label="Frecuencia *"
                        value={formData.frequency}
                        onChange={(e) => setFormData({ ...formData, frequency: e.target.value as ExpenseFrequency })}
                        options={[
                            { label: "Selecciona la frecuencia", value: "", disabled: true },
                            { label: "Semanal", value: "Semanal" },
                            { label: "Quincenal", value: "Quincenal" },
                            { label: "Mensual", value: "Mensual" },
                            { label: "Anual", value: "Anual" },
                        ]}
                    />

                </div>

                {/* 5. Próxima fecha de vencimiento/emisión */}
                <DateInput
                    label="Próxima Fecha de Vencimiento / Emisión *"
                    value={formData.nextDueDate}
                    onChange={(val) => setFormData({ ...formData, nextDueDate: val })}
                />

                {/* Botones de acción */}
                <div className="pt-4 border-t border-purple-100 bg-purple-50/20 flex justify-between shrink-0">
                    <button
                        type="button"
                        onClick={() => closeFormModal()}
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
                            : "Registrar Gasto Fijo →"}
                    </button>
                </div>
            </form>
        </MacDockModal>
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
    </>)
}