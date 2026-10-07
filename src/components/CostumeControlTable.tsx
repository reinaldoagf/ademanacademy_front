// src/components/CostumeControlTable.tsx
"use client";

export interface CostumeInventoryItem {
    id: string;
    costumeName: string;
    responsible: string;
    status: string; // AssignmentStatus: assigned, returned, etc.
    costumeStatus?: string; // LockerRoomStatus: payment_pending, in_use, etc.
    pendingFee: number;
}

interface CostumeControlTableProps {
    data: CostumeInventoryItem[];
}

export function CostumeControlTable({ data }: CostumeControlTableProps) {
    // Helper para renderizar badges de estado según la asignación / vestuario
    const renderStatusBadge = (status: string, pendingFee: number) => {
        if (pendingFee > 0 || status === "delayed" || status === "damaged") {
            return (
                <span className="px-2.5 py-1 text-xs font-semibold bg-red-100 text-red-600 rounded-md">
                    {status === "damaged" ? "Dañado" : "Pendiente / Retrasado"}
                </span>
            );
        }

        if (status === "returned") {
            return (
                <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-600 rounded-md">
                    Devuelto
                </span>
            );
        }

        return (
            <span className="px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-600 rounded-md">
                En uso
            </span>
        );
    };

    return (
        <div className="glass-card p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-anton mb-4">
                    Control de Vestuarios e Impacto Financiero
                </h3>
            </div>
            <div className="overflow-x-auto">
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
                        {data.length > 0 ? (
                            data.map((item) => (
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
                </table>
            </div>
        </div>
    );
}