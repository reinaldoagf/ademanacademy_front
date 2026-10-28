// src/app/(dashboard)/employee/dashboard/page.tsx
'use client';

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAuthStore } from "@/store/authStore";
import HeroSection from "@/components/layout/HeroSection";
import { ListOfGroups } from "@/components/ListOfGroups";
const EmployeeMetricsCards = dynamic(
    () => import("@/components/EmployeeMetricsCards").then((mod) => mod.EmployeeMetricsCards),
    { ssr: false }
);
const ContractSummaryCard = dynamic(
    () => import("@/components/ContractSummaryCard").then((mod) => mod.ContractSummaryCard),
    { ssr: false }
);

export default function EmployeeDashboardPage() {
    const user = useAuthStore((state) => state.user);
    const [isEmployee, setIsEmployee] = useState(false);
    const userName = isEmployee && user ? `${user.firstName} ${user.lastName}` : "Empleado";
    // Control de hidratación para Zustand
    useEffect(() => {
        setIsEmployee(true);
    }, []);
    return (<>
        {/* SUB-TOPBAR (Saludos y Acción rápida) */}
        <HeroSection
            htmlTitle={`Panel <em class="text-[#5e0472]">Principal</em>`}
            htmlSubTitle={`¡Hola, ${userName}👋! Gestiona los flujos de hoy.`}
            actions={[]}
        />
        <div className="p-4 md:p-8 w-full overflow-y-auto">
            <div className="space-y-6 ">
                <EmployeeMetricsCards />
                {/* 🌟 SECCIÓN INFERIOR: GRUPOS ASIGNADOS AL INSTRUCTOR */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Listado de Grupos (Ocupa 2 columnas) */}
                    <div className="lg:col-span-2">
                        <ListOfGroups />
                    </div>
                    {/* Panel lateral de Avisos / Políticas de Contrato */}
                    <ContractSummaryCard />
                </div>
            </div>
        </div>
    </>);
}