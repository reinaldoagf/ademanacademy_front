// src/app/(dashboard)/admin/accounts-payable/page.tsx
"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import {
    Plus,
    Search,
    DollarSign,
    Calendar,
    FileText,
    User,
    CreditCard,
    History,
    AlertCircle,
    X,
    Check,
} from "lucide-react";
import { AccountPayable, PaymentMethod, PayableStatus, CreateAccountPayableDto, PayablePayment, PayableFormData, CreatePayablePaymentDto } from "@/types/account-payable";
import { useModal } from "@/hooks/useModal";
import HeroSection from "@/components/layout/HeroSection";
import { MacDockModal } from "@/components/ui/MacDockModal";
import DataTable, { Column } from "@/components/common/DataTable";
import Badge from "@/components/common/Badge";
import DatePipe from "@/components/pipes/DatePipe";
import {
    getAllAccountPayablesAction,
    getAccountPayableByIdAction,
    saveAccountPayableAction,
    addPayablePaymentAction,
    deleteAccountPayableAction,
} from "@/app/actions/account-payable";
// Estado inicial limpio del formulario para Empleados
const initialFormState: PayableFormData = {
    supplierName: "",
    supplierDni: "",
    invoiceNumber: "",
    concept: "",
    amountTotal: "",
    dueDate: "",
    notes: "",
};
export default function AccountsPayablePage() {
    const [payables, setPayables] = useState<AccountPayable[]>([]);
    const [meta, setMeta] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        itemCount: 10,
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedStatus, setSelectedStatus] = useState<PayableStatus | "all">("all");
    const [isPending, startTransition] = useTransition();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Estados para Modales
    const {
        isOpen: isCreateOpen,
        openModal: openCreateModal,
        closeModal: closeCreateModal
    } = useModal();
    const {
        isOpen: isHistoryOpen,
        openModal: openHistoryModal,
        closeModal: closeHistoryModal
    } = useModal();
    const {
        isOpen: isPaymentOpen,
        openModal: openPaymentModal,
        closeModal: closePaymentModal
    } = useModal();
    const [selectedPayable, setSelectedPayable] = useState<AccountPayable | null>(null);

    // Formulario Nueva CXP
    const createFormReference = useRef<HTMLFormElement>(null);
    const [createForm, setCreateForm] = useState(initialFormState);

    // Formulario Nuevo Abono/Pago
    const [paymentForm, setPaymentForm] = useState({
        amount: "",
        method: "mobile_payment" as PaymentMethod,
        referenceNumber: "",
        notes: "",
    });
    // 3️⃣ 🎯 MANEJADOR DE CAMBIO DE PÁGINA
    const handlePageChange = (newPage: number) => {
        // Actualizamos el estado local. Al cambiar, disparará el useEffect superior de forma reactiva
        setCurrentPage(newPage);

        // 💡 Opcional y Recomendado: Scroll suave hacia arriba de la tabla para mejorar la UX al cambiar de página
        //window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 🎯 MANEJADOR DE CAMBIO DE LÍMITE (Filas por página)
    const handleLimitChange = (newLimit: number) => {
        setItemsPerPage(newLimit);
        setCurrentPage(1); // 💡 Regla de oro: Si cambias el límite, vuelve siempre a la página 1
    };
    // Cargar cuentas por pagar desde el API
    const fetchData = async (pageToFetch: number, limitToFetch: number) => {
        startTransition(async () => {
            setLoading(true);
            const res = await getAllAccountPayablesAction({
                page: pageToFetch,
                limit: limitToFetch,
                search: searchTerm || undefined,
                status: selectedStatus == 'all' ? undefined : selectedStatus,
            });

            if (res.success && res.data) {
                setPayables(res.data);
                setMeta(res.meta); // NestJS ya devuelve el "itemsPerPage" en su meta
            }
            setLoading(false);
        });
    };

    // Crear Cuenta por Pagar
    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload: CreateAccountPayableDto = {
            supplierName: createForm.supplierName,
            supplierDni: createForm.supplierDni || undefined,
            invoiceNumber: createForm.invoiceNumber || undefined,
            concept: createForm.concept,
            amountTotal: parseFloat(createForm.amountTotal),
            dueDate: createForm.dueDate,
            notes: createForm.notes || undefined,
        };

        const result = await saveAccountPayableAction(payload);

        if (result.success) {
            closeCreateModal();
            setCreateForm(initialFormState);
            fetchData(currentPage, itemsPerPage);
        } else {
            alert(result.error || "Ocurrió un error al guardar.");
        }
    };

    // Registrar Abono
    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPayable) return;

        try {
            // 1. Preparamos el DTO asegurando los tipos correspondientes
            const paymentPayload: CreatePayablePaymentDto = {
                amount: parseFloat(paymentForm.amount),
                method: paymentForm.method,
                referenceNumber: paymentForm.referenceNumber || undefined,
                notes: paymentForm.notes || undefined,
            };

            // 2. Ejecutamos la Server Action directamente
            const result = await addPayablePaymentAction(selectedPayable.id, paymentPayload);

            if (result.success) {
                // 3. Reseteamos el modal y el formulario tras la respuesta exitosa
                closePaymentModal();
                setPaymentForm({
                    amount: "",
                    method: "mobile_payment",
                    referenceNumber: "",
                    notes: "",
                });
                setSelectedPayable(null);

                // 4. Recargamos la tabla de datos
                fetchData(currentPage, itemsPerPage);
            } else {
                console.error("Error al registrar el abono:", result.error);
                alert(result.error || "No se pudo procesar el pago.");
            }
        } catch (error) {
            console.error("Error al registrar el pago:", error);
        }
    };
    // Ver Historial
    const handleOpenHistory = async (payable: AccountPayable) => {
        const result = await getAccountPayableByIdAction(payable.id);
        if (result.success && result.data) {
            setSelectedPayable(result.data);
            openHistoryModal();
        } else {
            alert(result.error || "No se pudo obtener el historial.");
        }
    };

    // 🎯 Configuración declarativa de las columnas
    const columns: Column<AccountPayable>[] = [
        {
            header: "Proveedor / Factura",
            render: (item) => (<>
                <div className="font-semibold text-slate-900">{item.supplierName}</div>
                <div className="text-xs text-slate-400">
                    {item.invoiceNumber ? `Fact: #${item.invoiceNumber}` : "Sin factura"} |{" "}
                    {item.supplierDni || "Sin DNI"}
                </div></>
            ),
        }, {
            header: "Concepto",
            render: (item) => (
                <div className="font-semibold text-slate-900">{item.concept}</div>
            ),
        }, {
            header: "Vencimiento",
            render: (item) => (
                <DatePipe value={item.dueDate} format="short" />
            ),
        }, {
            header: "Monto Total",
            render: (item) => (
                <div className="font-semibold text-slate-900">
                    ${item.amountTotal.toFixed(2)}
                </div>
            ),
        },
        {
            header: "Saldo Pendiente",
            render: (item) => {
                // Evitamos división por cero si amountTotal fuera 0
                const percentageRemaining = item.amountTotal > 0
                    ? (item.amountRemaining / item.amountTotal) * 100
                    : 0;

                // Definimos el color de la fuente según el porcentaje pendiente
                let colorClass = "text-emerald-600"; // Verde (<= 20% pendiente)

                if (percentageRemaining > 70) {
                    colorClass = "text-red-600"; // Rojo (> 70% pendiente)
                } else if (percentageRemaining > 20) {
                    colorClass = "text-amber-600"; // Naranja (entre 20% y 70%)
                }

                return (
                    <div className={`font-semibold ${colorClass}`}>
                        ${item.amountRemaining.toFixed(2)}
                    </div>
                );
            },
        }, {
            header: "Estado",
            render: (item) => (
                <Badge variant={item.status} />
            ),
        },
        {
            header: "Acciones",
            className: "text-right", // Alinea el encabezado a la derecha
            render: (element) => (<div className="flex gap-2">

                <button disabled={element.status == "paid" || element.status == "cancelled"}
                    onClick={() => {
                        setSelectedPayable(element);
                        setPaymentForm({
                            ...paymentForm,
                            amount: element.amountRemaining.toString(),
                        });
                        openPaymentModal();
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-questrial font-bold text-emerald/80 rounded-xl ${element.status == "paid" || element.status == "cancelled" ? "bg-gray-200" : "cursor-pointer bg-emerald-400 hover:bg-emerald-500 hover:text-white"}`}
                >
                    <CreditCard className="w-3.5 h-3.5" /> Abonar
                </button>

                <button
                    onClick={() => handleOpenHistory(element)}
                    className="
                    cursor-pointer flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-questrial font-bold text-[#5e0472] bg-white hover:bg-[#5e0472] hover:text-white rounded-xl transition-colors active:scale-95"
                >
                    <History className="w-3.5 h-3.5" /> Historial
                </button></div>
            ),
        },
    ];

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchData(currentPage, itemsPerPage);
        }, 300);

        return () => clearTimeout(handler);
    }, [searchTerm, selectedStatus, currentPage, itemsPerPage]);
    return (
        <>
            {/* TOPBAR / HERO */}
            <HeroSection
                htmlTitle={`Cuentas por <em class="text-[#5e0472]">Pagar</em>`}
                htmlSubTitle={`Administra las cuentas por pagar, facturas de proveedores y abonos de la academia.`}
                actions={[
                    {
                        label: "Registrar Cuenta por Pagar →",
                        onClick: () => openCreateModal(),
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
                            placeholder="Buscar por bailarín o nro de recibo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-purple-100 font-questrial text-xs bg-white/50 focus:outline-none focus:border-purple-400 transition text-gray-700"
                        />
                    </div>

                    {/* Filtro Estado */}
                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value as PayableStatus | "all")}
                            className="p-2 w-full sm:w-auto border border-purple-100 font-questrial text-xs bg-white text-gray-700 focus:outline-none"
                        >
                            <option value="all">Todos</option>
                            <option value="pending">Pendientes</option>
                            <option value="partial">Parcial</option>
                            <option value="paid">Pagado</option>
                            <option value="cancelled">Cancelado</option>
                        </select>



                    </div>
                </div>

                {/* TABLA DE CUENTAS POR PAGAR */}
                <DataTable
                    data={payables}
                    columns={columns}
                    meta={meta}
                    isLoading={isPending}
                    onPageChange={handlePageChange}
                    onLimitChange={handleLimitChange} // 👈 Pasamos el manejador del límite
                    rowKey={(element) => element.id}
                    emptyMessage="No se encontraron cuentas por pagar."
                />
            </div>
            {/* MODAL: NUEVA CUENTA POR PAGAR */}
            <MacDockModal
                isOpen={isCreateOpen}
                onClose={closeCreateModal}
                title={"Registrar Cuenta por Pagar"}
                size={"lg"}
            >
                <form
                    ref={createFormReference}
                    id="create-form" onSubmit={handleCreateSubmit}
                    className="flex-1 overflow-y-auto space-y-4 font-questrial text-xs scrollbar-thin pr-1">

                    <div>
                        <label className="block text-gray-700 font-bold mb-1">
                            Nombre del Proveedor *
                        </label>
                        <input
                            type="text"
                            required
                            value={createForm.supplierName}
                            onChange={(e) => setCreateForm({ ...createForm, supplierName: e.target.value })}
                            placeholder="Ej: Imprenta Rápida C.A."
                            className="w-full p-2.5 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 rounded transition-colors"
                        />
                    </div>



                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 font-bold mb-1">DNI / RIF</label>
                            <input
                                type="text"
                                value={createForm.supplierDni}
                                onChange={(e) => setCreateForm({ ...createForm, supplierDni: e.target.value })}
                                className="w-full p-2.5 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 rounded transition-colors"
                                placeholder="J-12345678-9"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-bold mb-1">
                                Nº Factura / Control
                            </label>
                            <input
                                type="text"
                                value={createForm.invoiceNumber}
                                onChange={(e) =>
                                    setCreateForm({ ...createForm, invoiceNumber: e.target.value })
                                }
                                className="w-full p-2.5 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 rounded transition-colors"
                                placeholder="FACT-00123"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-700 font-bold mb-1">Concepto *</label>
                        <input
                            type="text"
                            required
                            value={createForm.concept}
                            onChange={(e) => setCreateForm({ ...createForm, concept: e.target.value })}
                            className="w-full p-2.5 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 rounded transition-colors"
                            placeholder="Ej: Impresión de diplomas y certificados"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 font-bold mb-1">
                                Monto Total ($) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={createForm.amountTotal}
                                onChange={(e) => setCreateForm({ ...createForm, amountTotal: e.target.value })}
                                className="w-full p-2.5 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 rounded transition-colors"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-bold mb-1">
                                Fecha de Vencimiento *
                            </label>
                            <input
                                type="date"
                                required
                                value={createForm.dueDate}
                                onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                                className="w-full p-2.5 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 rounded transition-colors"

                            />
                        </div>
                    </div>


                    <div className="pt-4 border-t border-purple-100 bg-purple-50/20 flex justify-between shrink-0">
                        <button
                            type="button"
                            onClick={() => closeCreateModal()}
                            className="cursor-pointer font-questrial px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50 rounded-md"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="font-questrial px-5 py-2 flex items-center justify-center gap-2 font-medium transition text-xs cursor-pointer gradient-purple text-white shadow-md shadow-purple-200 hover:opacity-90 disabled:opacity-50 rounded-md"
                        >
                            {isSubmitting
                                ? "Guardando..."
                                : "Guardar Cuenta"}
                        </button>
                    </div>
                </form>
            </MacDockModal>


            {/* MODAL: REGISTRAR ABONO / PAGO */}
            <MacDockModal
                isOpen={isPaymentOpen}
                onClose={closePaymentModal}
                title={`Registrar Pago / Abono de ${selectedPayable?.supplierName} - ${selectedPayable?.concept}`}
                size={"lg"}
            >
                {selectedPayable && (<form onSubmit={handlePaymentSubmit} className="flex-1 overflow-y-auto space-y-4 font-questrial text-xs scrollbar-thin pr-1">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between text-sm">
                        <span className="text-slate-500">Saldo Pendiente:</span>
                        <span className="font-bold text-slate-900">
                            ${selectedPayable?.amountRemaining.toFixed(2)}
                        </span>
                    </div>

                    <div>
                        <label className="block text-gray-700 font-bold mb-1">
                            Monto del Abono ($) *
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            max={selectedPayable.amountRemaining}
                            required
                            value={paymentForm.amount}
                            onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                            className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400"

                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-bold mb-1">
                            Método de Pago *
                        </label>
                        <select
                            value={paymentForm.method}
                            onChange={(e) =>
                                setPaymentForm({ ...paymentForm, method: e.target.value as PaymentMethod })
                            }
                            className="w-full p-2 border border-purple-100 bg-white focus:outline-none focus:border-purple-400"
                        >
                            <option value="bank_transfer">Transferencia Bancaria</option>
                            <option value="cash">Efectivo</option>
                            <option value="credit_or_debit_card">Tarjeta de Débito o Crédito</option>
                            <option value="mobile_payment">Pago Móvil</option>
                            <option value="check">Cheque</option>
                            <option value="other">Otro</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-700 font-bold mb-1">
                            Nº Referencia / Transferencia
                        </label>
                        <input
                            type="text"
                            value={paymentForm.referenceNumber}
                            onChange={(e) =>
                                setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })
                            }
                            className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400"
                            placeholder="Ej: REF-987654"
                        />
                    </div>

                    <div className="pt-4 border-t border-purple-100 bg-purple-50/20 flex justify-between shrink-0">
                        <button
                            type="button"
                            onClick={() => closePaymentModal()}
                            className="cursor-pointer font-questrial px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50 rounded-md"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="font-questrial px-5 py-2 flex items-center justify-center gap-2 font-medium transition text-xs cursor-pointer gradient-purple text-white shadow-md shadow-purple-200 hover:opacity-90 disabled:opacity-50 rounded-md"
                        >
                            Confirmar Abono
                        </button>
                    </div>
                </form>)}

            </MacDockModal>

            {/* MODAL: HISTORIAL DE ABONOS */}
            <MacDockModal
                isOpen={isHistoryOpen}
                onClose={closeHistoryModal}
                title={`Historial de Pago / ${selectedPayable?.supplierName} - ${selectedPayable?.concept}`}
                size={"lg"}
            >
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                    {selectedPayable?.payments && selectedPayable?.payments.length > 0 ? (
                        <div className="glass-card shadow-sm relative">
                            <table className="text-slate-600 w-full text-left text-sm">
                                <thead className=" text-xs text-slate-500 uppercase border-b">
                                    <tr className="text-gray-400 border-b border-purple-50 font-questrial">
                                        <th className="pb-3 font-semibold ">Fecha</th>
                                        <th className="pb-3 font-semibold ">Método</th>
                                        <th className="pb-3 font-semibold ">Referencia</th>
                                        <th className="pb-3 font-semibold  text-right">Monto</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-purple-50/50">
                                    {selectedPayable.payments.map((p) => (
                                        <tr key={p.id} className="text-gray-700 hover:bg-purple-50/20 transition font-questrial">
                                            <td className="py-3 text-xs">
                                                {new Date(p.paymentDate).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 text-xs">{p.method}</td>
                                            <td className="py-3 text-xs">{p.referenceNumber || "-"}</td>
                                            <td className="py-3 text-xs font-bold text-emerald-600 text-right">
                                                +${p.amount.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                        </div>
                    ) : (
                        <p className="text-center text-slate-400">
                            Aún no existen abonos registrados para esta cuenta.
                        </p>
                    )}
                </div>
            </MacDockModal>

        </>
    );
}