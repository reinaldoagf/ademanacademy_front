"use client";
import React, { useEffect, useState } from 'react';
import { BalanceChart } from "@/components/BalanceChart";
import { DateRangePicker, DateRangeValue } from "@/components/ui/forms/DateRangePicker";
import { getBalanceMetrics } from '@/app/actions/metric';
import { BalanceChartData } from '@/types/dashboard';
// Convierte Date a string en formato YYYY-MM-DD
const formatDateToString = (date: Date): Date => {
    return new Date(date);
};
// Genera el rango por defecto: Último Año (hace 365 días hasta hoy)
const getDefaultDateRange = (): DateRangeValue => {
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    return {
        startDate: formatDateToString(oneYearAgo),
        endDate: formatDateToString(today),
    };
};
export function MonthlyBalanceChart() {
    const [dateRange, setDateRange] = useState<DateRangeValue>(getDefaultDateRange());
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [balanceData, setBalanceData] = useState<BalanceChartData | null>(null);
    useEffect(() => {
        async function loadBalanceData() {
            if (!dateRange?.startDate || !dateRange?.endDate) return;

            setIsLoading(true);
            try {
                const res = await getBalanceMetrics({
                    startDate: String(dateRange.startDate),
                    endDate: String(dateRange.endDate),
                });

                if (res.success && res.data) {
                    setBalanceData(res.data);
                }
            } catch (error) {
                console.error('Error al actualizar métricas de balance:', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadBalanceData();
    }, [dateRange]);
    return (
        <div className="glass-card p-6 shadow-sm relative z-20 overflow-visible">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div>
                    <h3 className="text-lg font-anton mb-2">Balance de Ingresos vs Egresos</h3>
                    <div className="flex flex-wrap gap-4 text-xs mt-1">
                        <span className="flex items-center gap-1.5 text-sm font-questrial font-medium text-gray-700">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#f472b6] inline-block"></span> Ingresos
                        </span>
                        <span className="flex items-center gap-1.5 text-sm font-questrial font-medium text-gray-700">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#5e0472] inline-block"></span> Egresos
                        </span>
                    </div>
                </div>

                {/* Filtro por Rango de Fechas */}{/* Componente DateRangePicker */}
                {/* Uso del componente reutilizable DateRangePicker */}
                <div className="w-full sm:w-72">
                    <DateRangePicker value={dateRange} onChange={setDateRange} />
                </div>
            </div>

            {/* Contenedor del Gráfico */}
            <div className="h-44 w-full relative mt-2">
                <BalanceChart
                    chartData={balanceData}
                    isLoading={isLoading}
                />
            </div>
        </div>
    )
}