// src/app/(dashboard)/admin/payment-orders/[id]/page.tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    User,
    FileText,
    Calendar,
    ShoppingBag,
    CreditCard,
    ArrowLeft,
    Package,
    Clock,
    DollarSign,
    Ticket,
    Receipt,
    Building
} from "lucide-react";
import HeroSection from "@/components/layout/HeroSection";
import Badge from "@/components/common/Badge";
import DatePipe from "@/components/pipes/DatePipe";

// Interfaz adaptada al schema de Prisma para PaymentOrder
interface PaymentOrderDetail {
    id: string;
    concept: string;
    amount: number | string;
    dueDate?: string | Date | null;
    status: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    user?: {
        id: string;
        name?: string;
        email?: string;
        phone?: string;
        dni?: string;
    } | null;
    client?: {
        id: string;
        name?: string;
        email?: string;
        phone?: string;
    } | null;
    order?: {
        id: string;
        status: string;
        totalAmount: number | string;
        createdAt: string | Date;
        items?: Array<{
            id: string;
            concept: string;
            description: string;
            quantity: number;
            price: number | string;
            student?: {
                name?: string;
                firstName?: string;
                lastName?: string;
            };
        }>;
    } | null;
    transactions?: Array<{
        id: string;
        concept: string;
        amount: number | string;
        method: string;
        status: string;
        referenceNumber?: string | null;
        bankName?: string | null;
        receiptPath?: string | null;
        createdAt: string | Date;
    }>;
    eventSeats?: Array<{
        id: string;
        status: string;
        event?: {
            id: string;
            title?: string;
            name?: string;
        };
        seatingMapElement?: {
            id: string;
            label?: string;
            row?: string;
            number?: string | number;
        };
    }>;
}

export default function PaymentOrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [paymentOrder, setPaymentOrder] = useState<PaymentOrderDetail | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (!id) return;

        const fetchPaymentOrderDetails = async () => {
            setIsLoading(true);
            try {
                // Reemplaza por tu Server Action o API Endpoint correspondiente
                const res = await fetch(`/api/payment-orders/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setPaymentOrder(data);
                }
            } catch (error) {
                console.error("Error al obtener los detalles de la orden de pago:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPaymentOrderDetails();
    }, [id]);

    const handleBack = () => {
        router.back();
    };

    const totalPaid = paymentOrder?.transactions
        ?.filter((t) => t.status === "completed" || t.status === "approved" || t.status === "success")
        .reduce((sum, t) => sum + Number(t.amount || 0), 0) || 0;

    const pendingAmount = Math.max(0, Number(paymentOrder?.amount || 0) - totalPaid);

    return (
        <>
            {/* HERO SECTION */}
            <HeroSection
                htmlTitle={`Detalles de la <em class="text-[#5e0472]">Orden de Pago</em>`}
                htmlSubTitle="Consulta la información detallada de la orden, estado de la transacción, desglose de ítems y asientos asociados."
                actions={[
                    {
                        label: "Volver al listado",
                        icon: <ArrowLeft className="w-4 h-4" />,
                        onClick: handleBack,
                        variant: "secondary",
                    },
                ]}
            />
            {/* Capa de Carga Asíncrona */}
            <div className="relative w-full">
                {isPending && (
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center z-10 transition-opacity">
                        <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
                <div className="p-4 md:p-8 w-full overflow-y-auto space-y-6">
                    {isLoading ? (
                        <div className="flex justify-center items-center p-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5e0472]" />
                        </div>
                    ) : !paymentOrder ? (
                        <div className="text-center py-16 border border-dashed border-purple-100 bg-white">
                            <Package className="w-10 h-10 text-purple-200 mx-auto mb-3" />
                            <p className="font-questrial text-xs text-gray-400">
                                {isPending ? "Sincronizando..." : "No se encontró la orden de pago solicitada."}
                            </p>
                        </div>
                    ) : (
                        <div className="max-w-5xl mx-auto space-y-6 text-xs">
                            {/* Información General y Cliente */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Tarjeta Cliente */}
                                <div className="font-questrial p-4 border border-gray-100 bg-gray-50/80 rounded-lg space-y-2">
                                    <div className="flex items-center gap-2 text-[#5e0472] font-bold text-sm mb-1">
                                        <User className="w-4 h-4" />
                                        <span>Información del Cliente</span>
                                    </div>
                                    <p className="text-gray-900 font-bold text-sm">
                                        {paymentOrder.user?.name || paymentOrder.client?.name || "Sin Nombre"}
                                    </p>
                                    {(paymentOrder.user?.dni) && (
                                        <p className="text-gray-500 font-medium">DNI / Cédula: {paymentOrder.user.dni}</p>
                                    )}
                                    {(paymentOrder.user?.email || paymentOrder.client?.email) && (
                                        <p className="text-gray-500">
                                            Email: {paymentOrder.user?.email || paymentOrder.client?.email}
                                        </p>
                                    )}
                                    {(paymentOrder.user?.phone || paymentOrder.client?.phone) && (
                                        <p className="text-gray-500">
                                            Teléfono: {paymentOrder.user?.phone || paymentOrder.client?.phone}
                                        </p>
                                    )}
                                </div>

                                {/* Tarjeta Orden / Estado */}
                                <div className="font-questrial p-4 border border-gray-100 bg-gray-50/80 rounded-lg space-y-2.5">
                                    <div className="flex items-center gap-2 text-[#5e0472] font-bold text-sm mb-1">
                                        <FileText className="w-4 h-4" />
                                        <span>Estado y Registro</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Estado Orden:</span>
                                        <Badge variant={paymentOrder.status} />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Concepto Principal:</span>
                                        <span className="font-semibold text-purple-900 capitalize">
                                            {paymentOrder.concept}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5 text-gray-400" /> Creado:
                                        </span>
                                        <span className="font-medium text-gray-800">
                                            <DatePipe value={paymentOrder.createdAt} format="short" />
                                        </span>
                                    </div>
                                    {paymentOrder.dueDate && (
                                        <div className="flex justify-between items-center text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5 text-gray-400" /> Vencimiento:
                                            </span>
                                            <span className="font-medium text-amber-700">
                                                <DatePipe value={paymentOrder.dueDate} format="short" />
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Pedido Asociado e Ítems / Productos (Si existe relación con Order) */}
                            {paymentOrder.order && (
                                <div className="space-y-3 font-questrial">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                            <ShoppingBag className="w-4 h-4 text-[#5e0472]" />
                                            <span>
                                                Pedido Vinculado #{paymentOrder.order.id} ({paymentOrder.order.items?.length || 0})
                                            </span>
                                        </h4>
                                        <Badge variant={paymentOrder.order.status} />
                                    </div>

                                    <div className="border border-purple-100 rounded-lg overflow-hidden">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                                <tr className="bg-purple-50/60 text-purple-900 font-bold border-b border-purple-100">
                                                    <th className="p-3">Concepto</th>
                                                    <th className="p-3">Descripción</th>
                                                    <th className="p-3 text-center">Cantidad</th>
                                                    <th className="p-3 text-right">Precio Un.</th>
                                                    <th className="p-3 text-right">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 text-gray-700">
                                                {paymentOrder.order.items && paymentOrder.order.items.length > 0 ? (
                                                    paymentOrder.order.items.map((item) => {
                                                        const priceNum = Number(item.price) || 0;
                                                        const subtotal = priceNum * item.quantity;
                                                        return (
                                                            <tr key={item.id} className="hover:bg-purple-50/20">
                                                                <td className="p-3 font-medium text-gray-900">
                                                                    <div className="capitalize">{item.concept}</div>
                                                                    {item.student && (
                                                                        <div className="text-[10px] text-gray-400">
                                                                            Alumno: {item.student.name || `${item.student.firstName || ''} ${item.student.lastName || ''}`}
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td className="p-3">{item.description}</td>
                                                                <td className="p-3 text-center font-bold">{item.quantity}</td>
                                                                <td className="p-3 text-right">${priceNum.toFixed(2)}</td>
                                                                <td className="p-3 text-right font-bold text-gray-900">
                                                                    ${subtotal.toFixed(2)}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td colSpan={5} className="p-4 text-center text-gray-400 italic">
                                                            No hay ítems detallados en este pedido
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Asientos / Eventos Asociados (Si existen registros en EventSeat) */}
                            {paymentOrder.eventSeats && paymentOrder.eventSeats.length > 0 && (
                                <div className="space-y-3 font-questrial">
                                    <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                        <Ticket className="w-4 h-4 text-[#5e0472]" />
                                        <span>Entradas / Asientos Reservados ({paymentOrder.eventSeats.length})</span>
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                        {paymentOrder.eventSeats.map((seat) => (
                                            <div
                                                key={seat.id}
                                                className="p-3 border border-purple-100 bg-purple-50/30 rounded-lg flex justify-between items-center"
                                            >
                                                <div>
                                                    <p className="font-bold text-purple-950">
                                                        {seat.event?.title || seat.event?.name || "Evento"}
                                                    </p>
                                                    <p className="text-gray-500 text-[11px]">
                                                        {seat.seatingMapElement?.label
                                                            ? `Asiento: ${seat.seatingMapElement.label}`
                                                            : seat.seatingMapElement?.row
                                                                ? `Fila ${seat.seatingMapElement.row} - Asiento ${seat.seatingMapElement.number}`
                                                                : `Silla ID: ${seat.id}`}
                                                    </p>
                                                </div>
                                                <Badge variant={seat.status} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Historial de Transacciones / Intentos de Pago */}
                            <div className="space-y-3 font-questrial">
                                <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-[#5e0472]" />
                                    <span>Transacciones / Intentos de Pago ({paymentOrder.transactions?.length || 0})</span>
                                </h4>

                                <div className="border border-purple-100 rounded-lg overflow-hidden">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="bg-purple-50/60 text-purple-900 font-bold border-b border-purple-100">
                                                <th className="p-3">Método</th>
                                                <th className="p-3">Banco / Ref.</th>
                                                <th className="p-3">Fecha</th>
                                                <th className="p-3 text-center">Estado</th>
                                                <th className="p-3 text-right">Monto</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-gray-700">
                                            {paymentOrder.transactions && paymentOrder.transactions.length > 0 ? (
                                                paymentOrder.transactions.map((tx) => (
                                                    <tr key={tx.id} className="hover:bg-purple-50/20">
                                                        <td className="p-3 font-semibold uppercase">{tx.method}</td>
                                                        <td className="p-3">
                                                            <div>{tx.bankName || "N/A"}</div>
                                                            {tx.referenceNumber && (
                                                                <div className="text-[10px] text-gray-400 font-mono">
                                                                    Ref: {tx.referenceNumber}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="p-3 text-gray-500">
                                                            <DatePipe value={tx.createdAt} format="short" />
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            <Badge variant={tx.status} />
                                                        </td>
                                                        <td className="p-3 text-right font-bold text-gray-900">
                                                            ${Number(tx.amount || 0).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="p-4 text-center text-gray-400 italic">
                                                        No hay transacciones registradas para esta orden
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Resumen y Monto Total */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-questrial">
                                <div className="p-4 border border-purple-100 bg-purple-50/40 rounded-lg flex justify-between items-center">
                                    <span className="text-gray-600 font-medium">Abonado / Pagado:</span>
                                    <span className="text-base font-bold text-emerald-600">
                                        ${totalPaid.toFixed(2)}
                                    </span>
                                </div>
                                <div className="p-4 gradient-purple text-white shadow-lg shadow-purple-200 rounded-lg flex justify-between items-center font-bold">
                                    <span className="text-sm">Monto Total de la Orden:</span>
                                    <span className="text-lg text-emerald-400">
                                        ${Number(paymentOrder.amount || 0).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}