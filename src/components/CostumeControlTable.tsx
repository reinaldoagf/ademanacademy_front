// src/components/CostumeControlTable.tsx
"use client";

import { useEffect, useState } from "react";
import { getCostumeInventoryMetrics } from "@/app/actions/metric";
import Badge from "@/components/common/Badge";

export interface CostumeInventoryItem {
    id: string;
    costumeName: string;
    responsible: string;
    status: string; // AssignmentStatus: assigned, returned, etc.
    costumeStatus?: string; // CostumeStatus: payment_pending, in_use, etc.
    pendingFee: number;
}


export function CostumeControlTable() {
    const [costumeData, setCostumeData] = useState<CostumeInventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    useEffect(() => {
        async function loadCostumeControlData() {

            setIsLoading(true);
            try {
                const res = await getCostumeInventoryMetrics();

                if (res.success && res.data) {
                    setCostumeData(res.data);
                }
            } catch (error) {
                console.error('Error al actualizar métricas de balance:', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadCostumeControlData();
    }, []);
    // Helper para renderizar badges de estado según la asignación / vestuario
    const renderStatusBadge = (status: string, pendingFee: number) => {
        return (<Badge variant={status} />
        );
    };

    return (
        <div className="glass-card p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-anton mb-4">
                    Control de Vestuarios e Impacto Financiero
                </h3>
            </div>
            <div className="overflow-x-auto">{isLoading ? (
                <div className="h-8 w-28 bg-white/20 rounded animate-pulse mt-2" />
            ) : (
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="text-gray-400 border-b border-purple-50">
                            <th className="pb-3 font-questrial font-semibold">Vestuario</th>
                            <th className="pb-3 font-questrial font-semibold">Responsable</th>
                            <th className="pb-3 font-questrial font-semibold">Estado</th>
                            <th className="pb-3 font-questrial font-semibold text-right">
                                Cuota Pendiente
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-50/50">
                        {costumeData.length > 0 ? (
                            costumeData.map((item) => (
                                <tr key={item.id} className="text-gray-700">
                                    <td className="py-3.5 font-medium flex items-center gap-2 font-questrial">
                                        <span
                                            className={`w-2.5 h-2.5 rounded-full ${item.pendingFee > 0 ? "bg-amber-400" : "bg-purple-400"
                                                }`}
                                        ></span>
                                        {item.costumeName}
                                    </td>
                                    <td className="py-3.5 text-gray-500 font-questrial">
                                        {item.responsible}
                                    </td>
                                    <td className="py-3.5 font-questrial">
                                        {renderStatusBadge(item.status, item.pendingFee)}
                                    </td>
                                    <td
                                        className={`py-3.5 text-right font-questrial ${item.pendingFee > 0
                                            ? "font-bold text-red-500"
                                            : "font-semibold text-gray-400"
                                            }`}
                                    >
                                        ${item.pendingFee.toFixed(2)}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="py-6 text-center text-gray-400 font-questrial text-xs"
                                >
                                    No hay asignaciones de vestuarios registradas.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>)}
            </div>
        </div>
    );
}