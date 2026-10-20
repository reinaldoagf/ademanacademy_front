// src/app/(dashboard)/admin/accounts-payable/[id]/page.tsx
"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, DollarSign, Package, Ticket, User } from "lucide-react";
import HeroSection from "@/components/layout/HeroSection";
import Badge from "@/components/common/Badge";
import DatePipe from "@/components/pipes/DatePipe";
import { AccountPayable } from "@/types/account-payable";
import { getAccountPayableByIdAction } from "@/app/actions/account-payable";
export default function AccountPayableDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;
    const [payable, setPayable] = useState<AccountPayable | null>(null);
    const [isPending, startTransition] = useTransition();
    const totalPaid = payable?.payments
        ?.reduce((sum, t) => sum + Number(t.amount || 0), 0) || 0;
    const handleBack = () => {
        router.back();
    };
    const fetchAccountPayableDetails = async () => {
        try {
            startTransition(async () => {
                const res = await getAccountPayableByIdAction(id);
                if (res.success && res.data) {
                    setPayable(res.data);
                }
            });
        } catch (error) {
            console.error("Error al obtener los detalles de la orden de pago:", error);
        }
    };
    useEffect(() => {
        if (!id) return;
        fetchAccountPayableDetails();
    }, [id]);
    return (
        <>
            {/* HERO SECTION */}
            <HeroSection
                htmlTitle={`Detalles de la <em class="text-[#5e0472]">Cuenta por Pagar</em>`}
                htmlSubTitle="Consulta la información detallada de la cuenta por pagar y su estado."
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
                    {!payable ? (
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
                                    <h3 className="text-lg font-anton mb-4">Información del Proveedor</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/50">
                                            <span className="text-sm font-questrial font-medium flex items-center gap-2 text-gray-700">
                                                <User className="w-4 h-4 text-purple-500" /> Proveedor
                                            </span>
                                            <span className="text-sm font-anton text-gray-800">{payable.supplierName}</span>
                                        </div>
                                        {payable.supplierDni && (<div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/50">
                                            <span className="text-sm font-questrial font-medium flex items-center gap-2 text-gray-700">
                                                <User className="w-4 h-4 text-pink-500" /> DNI / Cédula
                                            </span>
                                            <span className="text-sm font-anton text-gray-800">{payable.supplierDni}</span>
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
                                            <Badge variant={payable.status} />
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/50">
                                            <span className="text-sm font-questrial font-medium flex items-center gap-2 text-gray-700">
                                                <User className="w-4 h-4 text-pink-500" /> Concepto Principal
                                            </span>
                                            <span className="text-sm font-anton text-gray-800">{payable.concept}</span>
                                        </div>
                                        {
                                            payable.notes && (
                                                <div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/50">
                                                    <span className="text-sm font-questrial font-medium flex items-center gap-2 text-gray-700">
                                                        <User className="w-4 h-4 text-pink-500" /> Notas
                                                    </span>
                                                    <span className="text-sm font-anton text-gray-800">{payable.notes}</span>
                                                </div>
                                            )
                                        }
                                        {payable.dueDate && (
                                            <div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/50">
                                                <span className="text-sm font-questrial font-medium flex items-center gap-2 text-gray-700">
                                                    <Clock className="w-4 h-4 text-pink-500" /> Vencimiento
                                                </span>
                                                <DatePipe value={payable.dueDate} format="short" />
                                            </div>

                                        )}
                                    </div>

                                </div>
                            </div>
                            {/* Historial de Transacciones / Intentos de Pago */}
                            <div className="glass-card p-6 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-lg font-anton mb-1">Transacciones / Intentos de Pago</h3>
                                    </div>

                                </div>

                                <div className="border border-purple-100 rounded-lg overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="text-gray-400 border-b border-purple-50 font-questrial">
                                                <th className="p-3">Método</th>
                                                <th className="p-3">Ref.</th>
                                                <th className="p-3">Fecha</th>
                                                <th className="p-3 text-right">Monto</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-purple-50/50">
                                            {payable.payments && payable.payments.length > 0 ? (
                                                payable.payments.map((tx) => (
                                                    <tr key={tx.id} className="hover:bg-purple-50/20">
                                                        <td className="p-3 font-semibold uppercase">{tx.method}</td>
                                                        <td className="p-3">
                                                            {tx.referenceNumber && (
                                                                <div className="text-[10px] text-gray-400 font-mono">
                                                                    Ref: {tx.referenceNumber}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="p-3 text-gray-500">
                                                            <DatePipe value={tx.paymentDate} format="short" />
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
                                            ${totalPaid?.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="p-4 gradient-purple text-white shadow-lg shadow-purple-200 rounded-lg flex justify-between items-center font-bold">
                                        <span className="text-sm">Monto Total de la Orden:</span>
                                        <span className="text-lg text-emerald-400">
                                            ${Number(payable?.amountTotal || 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>)}
                </div>
            </div>
        </>
    );
}