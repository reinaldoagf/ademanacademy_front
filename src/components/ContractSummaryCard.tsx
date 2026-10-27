// src/components/ContractSummaryCard.tsx
"use client";
import React, { useEffect, useState } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Briefcase,
    DollarSign,
    Clock,
} from "lucide-react";
import { getContractDataMetrics } from '@/app/actions/metric';

export function ContractSummaryCard() {
    const [isLoading, setIsLoading] = useState(true);
    const [contractData, setContractData] = useState<{
        typeOfContract: string;
        baseSalary?: number | null;
        hourlyRate?: number;
        hoursTaughtMonth?: number;
    }>({
        typeOfContract: "",
        baseSalary: 0,
        hourlyRate: 0,
        hoursTaughtMonth: 0,
    });
    const [currentPage, setCurrentPage] = useState(0);

    // Mapeamos los datos reales del empleado a una lista de conceptos para la tarjeta
    const concepts = [
        {
            label: 'Esquema de Contrato',
            icon: <Briefcase className="w-4 h-4 text-purple-500" />,
            value: contractData?.typeOfContract ? `Contrato ${contractData.typeOfContract}` : 'No definido',
        },
        {
            label: contractData?.typeOfContract === 'Fijo' ? 'Salario Base' : 'Tarifa por Hora',
            icon: <DollarSign className="w-4 h-4 text-purple-500" />,
            value: contractData?.typeOfContract === 'Fijo'
                ? `$${Number(contractData?.baseSalary || 0).toFixed(2)}`
                : `$${Number(contractData?.hourlyRate || 0).toFixed(2)} / hr`,
        },
        {
            label: contractData?.typeOfContract === 'Fijo' ? 'Modalidad de Pago' : 'Horas Registradas',
            icon: <Clock className="w-4 h-4 text-purple-500" />,
            value: contractData?.typeOfContract === 'Fijo'
                ? 'Pago mensual fijo'
                : `${contractData?.hoursTaughtMonth || 0} hrs`,
        },
    ];

    const itemsPerPage = 3;
    const totalPages = Math.ceil(concepts.length / itemsPerPage);
    const currentItems = concepts.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
    );
    useEffect(() => {
        async function fetchContractDataMetrics() {
            setIsLoading(true);
            try {
                // Ejecutamos ambas peticiones en paralelo de manera limpia
                const res = await getContractDataMetrics()
                if (res.success && res.data) {
                    setContractData(res.data);
                }
            } catch (error) {
                console.error('Error al obtener métricas de ingresos por concepto:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchContractDataMetrics();
    }, []);
    return (
        <div className="glass-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-anton">Resumen de Contrato</h3>

                {/* Botones de control de paginación corregidos */}
                {!isLoading && totalPages > 1 && (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                            disabled={currentPage === 0}
                            className={currentPage === 0 ? "cursor-not-allowed opacity-30" : "cursor-pointer p-1 rounded-lg border border-purple-100 bg-purple-50/50 hover:bg-purple-100 transition-colors"}
                        >
                            <ChevronLeft className="w-4 h-4 text-purple-700" />
                        </button>
                        <span className="text-xs font-questrial font-medium text-gray-500 px-1">
                            {currentPage + 1}/{totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                            disabled={currentPage === totalPages - 1}
                            className={currentPage === totalPages - 1 ? "cursor-not-allowed opacity-30" : "cursor-pointer p-1 rounded-lg border border-purple-100 bg-purple-50/50 hover:bg-purple-100 transition-colors"}
                        >
                            <ChevronRight className="w-4 h-4 text-purple-700" />
                        </button>
                    </div>
                )}
            </div>

            {isLoading ? (
                <div className="space-y-3 animate-pulse">
                    <div className="h-10 bg-purple-100/50 rounded-xl" />
                    <div className="h-10 bg-purple-100/50 rounded-xl" />
                    <div className="h-10 bg-purple-100/50 rounded-xl" />
                </div>
            ) : (
                <div key={currentPage} className="space-y-3">
                    {currentItems.map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/50 border border-purple-100/40"
                        >
                            <span className="text-sm font-questrial font-medium flex items-center gap-2 text-gray-700">
                                {item.icon} {item.label}
                            </span>
                            <span className="text-sm font-anton text-gray-800">
                                {item.value}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}