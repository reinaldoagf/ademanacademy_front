// src/app/(dashboard)/admin/orders/[id]/page.tsx
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
    Phone
} from "lucide-react";
import HeroSection from "@/components/layout/HeroSection";
import Badge from "@/components/common/Badge";
import DatePipe from "@/components/pipes/DatePipe";
import { getOrderByIdAction } from "@/app/actions/order";
import { Order } from "@/types/order";

export default function PaymentOrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;
    const [order, setOrder] = useState<Order | null>(null);
    const [isPending, startTransition] = useTransition();
    const totalPaid = order?.paymentOrder?.transactions
        ?.filter((t) => t.status === "approved")
        .reduce((sum, t) => sum + Number(t.amount || 0), 0) || 0;
    const handleBack = () => {
        router.back();
    };
    useEffect(() => {
        if (!id) return;

        const fetchPaymentOrderDetails = async () => {
            try {
                startTransition(async () => {
                    const res = await getOrderByIdAction(id);
                    if (res.success && res.data) {
                        setOrder(res.data);
                    }
                });
            } catch (error) {
                console.error("Error al obtener los detalles del pedido:", error);
            }
        };

        fetchPaymentOrderDetails();
    }, [id]);
    return (
        <>
            {/* HERO SECTION */}
            <HeroSection
                htmlTitle={`Detalles de la <em class="text-[#5e0472]">Pedido</em>`}
                htmlSubTitle="Consulta la información detallada de la orden."
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
                    {!order ? (
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
                                            <span className="text-sm font-anton text-gray-800">{order.client?.firstName || "Sin Nombre"} {order.client?.lastName || "Sin Apellido"}</span>
                                        </div>
                                        {(order.client?.dni) && (<div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/50">
                                            <span className="text-sm font-questrial font-medium flex items-center gap-2 text-gray-700">
                                                <User className="w-4 h-4 text-pink-500" /> DNI / Cédula
                                            </span>
                                            <span className="text-sm font-anton text-gray-800">{order.client.dni}</span>
                                        </div>)}
                                        {(order.client?.email) && (<div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/50">
                                            <span className="text-sm font-questrial font-medium flex items-center gap-2 text-gray-700">
                                                <Ticket className="w-4 h-4 text-indigo-500" /> Email
                                            </span>
                                            <span className="text-sm font-anton text-gray-800">{order.client?.email}</span>
                                        </div>)}
                                        {(order.client?.phone) && (<div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/50">
                                            <span className="text-sm font-questrial font-medium flex items-center gap-2 text-gray-700">
                                                <Phone className="w-4 h-4 text-green-500" /> Teléfono
                                            </span>
                                            <span className="text-sm font-anton text-gray-800">{order.client?.phone}</span>
                                        </div>)}
                                    </div>

                                </div>

                                {/* Tarjeta Orden / Estado */}
                                <div className="glass-card p-6 shadow-sm">
                                    <h3 className="text-lg font-anton mb-4">Información de la Orden de Pago</h3>
                                    <div className="space-y-3">
                                        {order.paymentOrder?.status && (<div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/50">
                                            <span className="text-sm font-questrial font-medium flex items-center gap-2 text-gray-700">
                                                <User className="w-4 h-4 text-purple-500" /> Estado Orden
                                            </span>
                                            <Badge variant={order.paymentOrder?.status} />
                                        </div>)}
                                        {order.paymentOrder?.concept && (<div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/50">
                                            <span className="text-sm font-questrial font-medium flex items-center gap-2 text-gray-700">
                                                <User className="w-4 h-4 text-pink-500" /> Concepto Principal
                                            </span>
                                            <span className="text-sm font-anton text-gray-800">{order.paymentOrder?.concept}</span>
                                        </div>)}
                                        {order.paymentOrder?.createdAt && (<div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/50">
                                            <span className="text-sm font-questrial font-medium flex items-center gap-2 text-gray-700">
                                                <Ticket className="w-4 h-4 text-indigo-500" /> Creado
                                            </span>
                                            <span className="text-sm font-anton text-gray-800"><DatePipe value={order.paymentOrder?.createdAt} format="short" /></span>
                                        </div>)}
                                        {order.paymentOrder?.dueDate && (
                                            <div className="flex justify-between items-center text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5 text-gray-400" /> Vencimiento:
                                                </span>
                                                <span className="font-medium text-amber-700">
                                                    <DatePipe value={order.paymentOrder?.dueDate} format="short" />
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>
                            {/* Productos del Pedido */}
                            <div className="glass-card p-6 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-lg font-anton mb-1">Productos del Pedido</h3>
                                    </div>
                                </div>

                                <div className="border border-purple-100 rounded-lg overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="text-gray-400 border-b border-purple-50 font-questrial">
                                                <th className="p-3">Concepto</th>
                                                <th className="p-3">Descripción</th>
                                                <th className="p-3 text-center">Cantidad</th>
                                                <th className="p-3">Precio Un.</th>
                                                <th className="p-3 text-right">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-purple-50/50">
                                            {order?.items && order?.items.length > 0 ? (
                                                order?.items.map((item) => {
                                                    const priceNum = Number(item.price) || 0;
                                                    const subtotal = priceNum * item.quantity;
                                                    return (
                                                        <tr key={item.id} className="text-gray-700 hover:bg-purple-50/20 transition font-questrial">
                                                            <td className="p-3 text-[11px] text-gray-400">
                                                                <div className="capitalize">{item.concept}</div>
                                                                {item.student && (
                                                                    <div className="text-[10px] text-gray-400">
                                                                        Alumno: {item.student.name || `${item.student.firstName || ''} ${item.student.lastName || ''}`}
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="p-3 text-[11px] text-gray-400">{item.description}</td>
                                                            <td className="p-3 text-center font-bold">{item.quantity}</td>
                                                            <td className="p-3"> <span className="font-bold text-gray-800">${priceNum.toFixed(2)}</span>
                                                            </td>
                                                            <td className="p-3 text-right font-bold text-gray-900">
                                                                ${subtotal.toFixed(2)}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
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
                                        <tbody className="divide-y divide-purple-50/50">
                                            {order.paymentOrder?.transactions && order.paymentOrder?.transactions.length > 0 ? (
                                                order.paymentOrder?.transactions.map((tx) => (
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
                                            ${Number(order.totalAmount || 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}