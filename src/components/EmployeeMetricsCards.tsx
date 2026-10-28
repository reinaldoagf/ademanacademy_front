// src/components/EmployeeMetricsCards.tsx
"use client";
import { useState, useEffect } from "react";
import { DollarSign, Clock, Award, BookOpen } from "lucide-react";
import { getEmployeeDashboardMetrics } from "@/app/actions/metric";
export function EmployeeMetricsCards() {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [data, setData] = useState({
        firstName: "",
        lastName: "",
        typeOfContract: "Fijo",
        baseSalary: 0,
        hourlyRate: 0,
        hoursTaughtMonth: 0,
        payrollStatus: "Pendiente",
        groupsCount: 0,
        calculatedEarnings: 0,
    });
    useEffect(() => {
        async function fetchMetrics() {
            try {
                // Reemplaza con la ruta de tu endpoint de NestJS o Server Action
                const res = await getEmployeeDashboardMetrics();
                if (res.success && res?.data) {
                    setData(res.data);
                }
            } catch (error) {
                console.error("Error al cargar métricas del empleado:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchMetrics();
    }, []);
    return (<>
        {/* 🌟 TARJETAS DE MÉTRICAS (KPIs) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <div className="glass-card shadow-sm p-4 flex items-center gap-4">
                {/* Icono fijo */}
                <div className="w-10 h-10 bg-purple-100 flex items-center justify-center text-[#5e0472]">
                    <DollarSign className="w-5 h-5" />
                </div>

                {/* Contenido condicional (Carga vs Datos reales) */}
                {isLoading ? (
                    <div className="animate-pulse space-y-2 flex-1 my-1">
                        <div className="h-3 w-28 bg-purple-100/60 rounded" />
                        <div className="h-6 w-20 bg-purple-100/80 rounded" />
                    </div>
                ) : (
                    <div className="flex-1">
                        <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                            Ganancias del Periodo
                        </p>
                        <h4 className="text-xl font-anton text-gray-800">
                            ${data.calculatedEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </h4>
                    </div>
                )}
            </div>

            {/* Horas Impartidas */}
            <div className="glass-card shadow-sm p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-100 flex items-center justify-center text-[#5e0472]">
                    <Clock className="w-5 h-5" />
                </div>
                {/* Contenido condicional (Carga vs Datos reales) */}
                {isLoading ? (
                    <div className="animate-pulse space-y-2 flex-1 my-1">
                        <div className="h-3 w-28 bg-purple-100/60 rounded" />
                        <div className="h-6 w-20 bg-purple-100/80 rounded" />
                    </div>
                ) : (
                    <div className="flex-1">
                        <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                            Horas Registradas
                        </p>
                        <h4 className="text-xl font-anton text-gray-800">
                            {data.hoursTaughtMonth} hrs
                        </h4>
                    </div>
                )}
            </div>



            {/* Grupos Asignados */}
            <div className="glass-card shadow-sm p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-100 flex items-center justify-center text-[#5e0472]">
                    <BookOpen className="w-5 h-5" />
                </div>
                {/* Contenido condicional (Carga vs Datos reales) */}
                {isLoading ? (
                    <div className="animate-pulse space-y-2 flex-1 my-1">
                        <div className="h-3 w-28 bg-purple-100/60 rounded" />
                        <div className="h-6 w-20 bg-purple-100/80 rounded" />
                    </div>
                ) : (
                    <div className="flex-1">
                        <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                            Grupos a Cargo
                        </p>
                        <h4 className="text-xl font-anton text-gray-800">
                            {data.groupsCount}
                        </h4>
                    </div>
                )}
            </div>

            {/* Estado de Nómina */}
            <div className="glass-card shadow-sm p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-100 flex items-center justify-center text-[#5e0472]">
                    <Award className="w-5 h-5" />
                </div>
                {isLoading ? (
                    <div className="animate-pulse space-y-2 flex-1 my-1">
                        <div className="h-3 w-28 bg-purple-100/60 rounded" />
                        <div className="h-6 w-20 bg-purple-100/80 rounded" />
                    </div>
                ) : (
                    <div className="flex-1">
                        <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                            Estatus de Pago
                        </p>
                        <h4 className="text-xl font-anton text-gray-800">
                            {data.payrollStatus}
                        </h4>
                    </div>
                )}
            </div>

        </div>
    </>);
}