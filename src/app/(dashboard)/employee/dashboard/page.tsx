// src/app/(dashboard)/employee/dashboard/page.tsx
'use client';

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
    DollarSign,
    Clock,
    Award,
    CheckCircle2,
    BookOpen,
    Briefcase,
    AlertCircle
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import HeroSection from "@/components/layout/HeroSection";

const ContractSummaryCard = dynamic(
    () => import("@/components/ContractSummaryCard").then((mod) => mod.ContractSummaryCard),
    { ssr: false }
);
// 🌟 Datos de ejemplo basados estrictamente en los campos del modelo Employee y Group de Prisma
const employeeDashboardData = {
    id: "emp-001",
    firstName: "Carlos",
    lastName: "Mendoza",
    typeOfEmployee: "Instructor", // Administrativo, Instructor, etc.
    typeOfContract: "Fijo",      // Fijo / Por Hora / Comisión
    baseSalary: 650.00,          // Salario base si aplica
    hoursTaughtMonth: 45,        // Horas impartidas en el mes
    hourlyRate: 15.00,           // Tarifa por hora
    payrollStatus: "Pendiente",    // Pendiente / Pagado
    groups: [
        {
            id: "grp-1",
            name: "Robótica Avanzada A",
            totalNumberOfSlots: 15,
            category: { name: "Tecnología" },
            _count: { students: 12 }
        },
        {
            id: "grp-2",
            name: "Programación Web Junior",
            totalNumberOfSlots: 20,
            category: { name: "Desarrollo" },
            _count: { students: 18 }
        }
    ]
};

export default function EmployeeDashboardPage() {
    const user = useAuthStore((state) => state.user);
    const [isClient, setIsEmployee] = useState(false);
    const emp = employeeDashboardData;

    // 🧮 Lógica de cálculo de ganancias según el tipo de contrato del esquema Prisma
    const calculatedEarnings = emp.typeOfContract === 'Fijo'
        ? Number(emp.baseSalary)
        : emp.hoursTaughtMonth * Number(emp.hourlyRate);

    const userName = isClient && user ? `${user.firstName} ${user.lastName}` : "Empleado";

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
            {/* GRILLA DEL DASHBOARD */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* COLUMNA IZQUIERDA Y CENTRAL */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Fila de Resumen de Ingresos y Métricas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ContractSummaryCard />
                    </div>
                </div>
            </div>
        </div>
        <div className="p-4 md:p-8 w-full overflow-y-auto">
            <div className="space-y-6 ">

                {/* 🌟 TARJETAS DE MÉTRICAS (KPIs) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* Ganancias Proyectadas / Acumuladas */}
                    <div className="bg-white p-5 rounded-xl border border-purple-100 shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-xs text-gray-400 uppercase tracking-wider">Ganancias del Periodo</span>
                            <div className="text-2xl font-bold text-gray-800">
                                ${calculatedEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5">
                                Calculado según contrato
                            </span>
                        </div>
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                            <DollarSign className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Horas Impartidas (hoursTaughtMonth) */}
                    <div className="bg-white p-5 rounded-xl border border-purple-100 shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-xs text-gray-400 uppercase tracking-wider">Horas Registradas</span>
                            <div className="text-2xl font-bold text-gray-800">
                                {emp.hoursTaughtMonth} hrs
                            </div>
                            <span className="text-[11px] text-gray-400">Mes corriente</span>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Grupos Asignados */}
                    <div className="bg-white p-5 rounded-xl border border-purple-100 shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-xs text-gray-400 uppercase tracking-wider">Grupos a Cargo</span>
                            <div className="text-2xl font-bold text-gray-800">
                                {emp.groups.length}
                            </div>
                            <span className="text-[11px] text-purple-600 font-medium">Activos en el periodo</span>
                        </div>
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                            <BookOpen className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Estado de Nómina */}
                    <div className="bg-white p-5 rounded-xl border border-purple-100 shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-xs text-gray-400 uppercase tracking-wider">Estatus de Pago</span>
                            <div className="text-xl font-bold text-gray-800 capitalize">
                                {emp.payrollStatus}
                            </div>
                            <span className="text-[11px] text-gray-400">Verifica con administración</span>
                        </div>
                        <div className={`p-3 rounded-xl ${emp.payrollStatus === 'Pagado' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                            <Award className="w-6 h-6" />
                        </div>
                    </div>

                </div>

                {/* 🌟 SECCIÓN INFERIOR: GRUPOS ASIGNADOS AL INSTRUCTOR */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Listado de Grupos (Ocupa 2 columnas) */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-purple-100 shadow-sm space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-md font-bold text-gray-800 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                                Grupos Académicos Asignados (Relación Instructor)
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-purple-100 text-xs text-gray-400 uppercase">
                                        <th className="pb-3 font-medium">Nombre del Grupo</th>
                                        <th className="pb-3 font-medium">Categoría</th>
                                        <th className="pb-3 font-medium text-center">Cupos Totales</th>
                                        <th className="pb-3 font-medium text-right">Estudiantes Inscritos</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-gray-700">
                                    {emp.groups.map((group) => (
                                        <tr key={group.id} className="hover:bg-purple-50/30 transition-colors">
                                            <td className="py-3.5 font-medium text-gray-800">{group.name}</td>
                                            <td className="py-3.5 text-xs text-gray-500">
                                                <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-medium">
                                                    {group.category.name}
                                                </span>
                                            </td>
                                            <td className="py-3.5 text-center text-gray-600">{group.totalNumberOfSlots}</td>
                                            <td className="py-3.5 text-right font-bold text-purple-700">
                                                {group._count.students} alumnos
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Panel lateral de Avisos / Políticas de Contrato */}
                    <div className="bg-white p-6 rounded-xl border border-purple-100 shadow-sm space-y-4">
                        <h2 className="text-md font-bold text-gray-800 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-purple-600" />
                            Información de Nómina
                        </h2>

                        <div className="space-y-3 text-xs text-gray-600">
                            <div className="p-3 bg-purple-50/40 border border-purple-100 rounded-lg space-y-1">
                                <span className="font-bold text-[#5e0472] block">📋 Modalidad: {emp.typeOfContract}</span>
                                <p>
                                    {emp.typeOfContract === 'Fijo'
                                        ? 'Recibes un monto base mensual independiente de la fluctuación de horarios, sujeto a cumplimiento de asistencia.'
                                        : 'Tus ingresos se calculan multiplicando las horas registradas en el mes por tu tarifa por hora asignada.'
                                    }
                                </p>
                            </div>

                            <div className="p-3 bg-blue-50/40 border border-blue-100 rounded-lg space-y-1">
                                <span className="font-bold text-blue-700 block">💡 Cierre de Periodo</span>
                                <p>El reporte de horas y la autorización del estatus de nómina se procesan al finalizar cada ciclo mensual.</p>
                            </div>
                        </div>
                    </div>

                </div>


            </div>
        </div>
    </>);
}