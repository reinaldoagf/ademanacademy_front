// src/app/(dashboard)/admin/payment-orders/[id]/page.tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    User,
    Calendar,
    ShoppingBag,
    CreditCard,
    ArrowLeft,
    Package,
    Clock,
    DollarSign,
    Ticket,
    Receipt,
    Phone,
    Info
} from "lucide-react";
import HeroSection from "@/components/layout/HeroSection";
import Badge from "@/components/common/Badge";
import DatePipe from "@/components/pipes/DatePipe";
import { getPaymentOrderByIdAction } from "@/app/actions/payment-order";
import { PaymentOrder } from "@/types/payment-order";

export default function PaymentOrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [paymentOrder, setPaymentOrder] = useState<PaymentOrder | null>(null);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (!id) return;

        const fetchPaymentOrderDetails = async () => {
            try {
                startTransition(async () => {
                    const res = await getPaymentOrderByIdAction(id);
                    if (res.success && res.data) {
                        setPaymentOrder(res.data);
                    }
                });
            } catch (error) {
                console.error("Error al obtener los detalles de la orden de pago:", error);
            }
        };

        fetchPaymentOrderDetails();
    }, [id]);

    const handleBack = () => {
        router.back();
    };

    const totalPaid = paymentOrder?.transactions
        ?.filter((t) => t.status === "approved")
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
                <div className="p-4 md:p-8 w-full overflow-y-auto space-y-6">
                    {!paymentOrder ? (
                        <div className="text-center py-16 border border-dashed border-purple-100 bg-white">
                            <Package className="w-10 h-10 text-purple-200 mx-auto mb-3" />
                            <p className="font-questrial text-xs text-gray-400">
                                {isPending ? "Sincronizando..." : "No se encontró la orden de pago solicitada."}
                            </p>
                        </div>
                    ) : (

                        <div className="space-y-6">
                            {/* Información General y Cliente */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Tarjeta Cliente */}
                                <div className="glass-card p-6 shadow-sm">
                                    <h3 className="text-lg font-anton mb-4">Información del Cliente</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/50">
                                            <span className="text-sm font-questrial font-medium flex items-center gap-2 text-gray-700">
                                                <User className="w-4 h-4 text-purple-500" /> Cliente
                                            </span>
                                            <span className="text-sm font-anton text-gray-800">{paymentOrder.user?.name || paymentOrder.client?.firstName || "Sin Nombre"}</span>
                                        </div>
                                        {(paymentOrder.user?.dni) && (<div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/50">
                                            <span className="text-sm font-questrial font-medium flex items-center gap-2 text-gray-700">
                                                <User className="w-4 h-4 text-pink-500" /> DNI / Cédula
                                            </span>
                                            <span className="text-sm font-anton text-gray-800">{paymentOrder.user.dni}</span>
                                        </div>)}
                                        {(paymentOrder.user?.email || paymentOrder.client?.email) && (<div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/50">
                                            <span className="text-sm font-questrial font-medium flex items-center gap-2 text-gray-700">
                                                <Ticket className="w-4 h-4 text-indigo-500" /> Email
                                            </span>
                                            <span className="text-sm font-anton text-gray-800">{paymentOrder.user?.email || paymentOrder.client?.email}</span>
                                        </div>)}
                                        {(paymentOrder.user?.phone || paymentOrder.client?.phone) && (<div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/50">
                                            <span className="text-sm font-questrial font-medium flex items-center gap-2 text-gray-700">
                                                <Phone className="w-4 h-4 text-green-500" /> Teléfono
                                            </span>
                                            <span className="text-sm font-anton text-gray-800">{paymentOrder.user?.phone || paymentOrder.client?.phone}</span>
                                        </div>)}
                                    </div>

                                </div>

                                {/* Tarjeta Orden / Estado */}
                                <div className="glass-card p-6 shadow-sm">
                                    <h3 className="text-lg font-anton mb-4">Estado y Registro</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/50">
                                            <span className="text-sm font-questrial font-medium flex items-center gap-2 text-gray-700">
                                                <User className="w-4 h-4 text-purple-500" /> Estado Orden
                                            </span>
                                            <Badge variant={paymentOrder.status} />
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/50">
                                            <span className="text-sm font-questrial font-medium flex items-center gap-2 text-gray-700">
                                                <Info className="w-4 h-4 text-pink-500" /> Concepto Principal
                                            </span>
                                            <span className="text-sm font-anton text-gray-800">{paymentOrder.concept}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/50">
                                            <span className="text-sm font-questrial font-medium flex items-center gap-2 text-gray-700">
                                                <Ticket className="w-4 h-4 text-indigo-500" /> Creado
                                            </span>
                                            <span className="text-sm font-anton text-gray-800"><DatePipe value={paymentOrder.createdAt} format="short" /></span>
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
                                <div className="glass-card p-6 shadow-sm">
                                    <h3 className="text-lg font-anton mb-4">
                                        Entradas / Asientos Reservados
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                        {paymentOrder.eventSeats.map((seat) => (
                                            <div
                                                key={seat.id}
                                                className="p-3 border border-purple-100 bg-purple-50/30 rounded-lg grid grid-cols-3 gap-2 pt-3 text-center border-t border-dashed border-gray-100"
                                            >
                                                <div className="bg-slate-50 p-2">
                                                    <p className="text-[10px] text-gray-400 font-questrial uppercase font-medium">Evento</p>
                                                    <p className="text-xs font-questrial font-bold text-gray-700">{seat.event?.name || "Evento"}</p>
                                                </div> <div className="bg-slate-50 p-2">
                                                    <p className="text-[10px] text-gray-400 font-questrial uppercase font-medium">Status</p>
                                                    <Badge variant={seat.status} />
                                                </div>
                                                <div className="bg-slate-50 p-2">
                                                    <p className="text-[10px] text-gray-400 font-questrial uppercase font-medium"># de Silla</p>
                                                    <p className="text-xs font-questrial font-bold text-gray-700">{seat.seatingMapElement?.chairNumber || ""}</p>
                                                </div>
                                                <div className="bg-slate-50 p-2">
                                                    <p className="text-[10px] text-gray-400 font-questrial uppercase font-medium">Nombre de Silla</p>
                                                    <p className="text-xs font-questrial font-bold text-gray-700">{seat.seatingMapElement?.name || ""}</p>
                                                </div>
                                                <div className="bg-slate-50 p-2">
                                                    <p className="text-[10px] text-gray-400 font-questrial uppercase font-medium">Tipo de Silla</p>
                                                    <p className="text-xs font-questrial font-bold text-gray-700">{seat.seatingMapElement?.itemType || ""}</p>
                                                </div>
                                                <div className="bg-slate-50 p-2">
                                                    <p className="text-[10px] text-gray-400 font-questrial uppercase font-medium">Precio de Silla</p>
                                                    <p className="text-xs font-questrial font-bold text-gray-700">${seat.seatingMapElement?.price || ""}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Historial de Transacciones / Intentos de Pago */}
                            <div className="glass-card p-6 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-lg font-anton mb-1">Transacciones / Intentos de Pago</h3>
                                    </div>
                                    <div>
                                        <button className="font-questrial px-4 py-2 flex items-center justify-center gap-2 font-medium transition text-xs gradient-purple text-white shadow-md shadow-purple-200 cursor-pointer hover:bg-purple-50/30">
                                            <DollarSign className="w-4 h-4" /><span>Agregar Pago</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="border border-purple-100 rounded-lg overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="text-gray-400 border-b border-purple-50 font-questrial">
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
                                                            test
                                                            {/* <div>{tx.bankName || "N/A"}</div>
                                                            {tx.referenceNumber && (
                                                                <div className="text-[10px] text-gray-400 font-mono">
                                                                    Ref: {tx.referenceNumber}
                                                                </div>
                                                            )} */}
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
                            <div className="glass-card p-6 shadow-sm">
                                <h3 className="text-lg font-anton mb-4">
                                    Resumen y Monto Total
                                </h3>
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
                                </div></div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}