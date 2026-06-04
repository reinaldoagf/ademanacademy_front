// src/app/(dashboard)/client/payments/page.tsx
"use client";

import { useState } from "react";
import {
    Wallet,
    ArrowUpRight,
    Plus,
    Search,
    TrendingUp,
    CreditCard,
    AlertCircle,
    Users
} from "lucide-react";
import HeroSection from '@/components/layout/HeroSection';

interface Transaccion {
    id: string;
    alumno: string;
    concepto: "Mensualidad" | "Matrícula" | "Uniforme" | "Entradas Gala";
    monto: number;
    metodo: "Transferencia" | "Tarjeta" | "Efectivo" | "Pago Móvil";
    fecha: string;
    estado: "Aprobado" | "Pendiente";
}

const DEMO_TRANSACCIONES_CLIENTE: Transaccion[] = [
    { id: "TX-901", alumno: "Sofía Valentina", concepto: "Mensualidad", monto: 45, metodo: "Pago Móvil", fecha: "2026-05-21", estado: "Aprobado" },
    { id: "TX-903", alumno: "Sofía Valentina", concepto: "Uniforme", monto: 25, metodo: "Efectivo", fecha: "2026-05-20", estado: "Aprobado" },
    { id: "TX-904", alumno: "Lucas Mateo", concepto: "Mensualidad", monto: 45, metodo: "Transferencia", fecha: "2026-05-19", estado: "Pendiente" },
    { id: "TX-905", alumno: "Sofía Valentina", concepto: "Entradas Gala", monto: 60, metodo: "Tarjeta", fecha: "2026-05-18", estado: "Aprobado" },
];

export default function ClientPagosPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterConcepto, setFilterConcepto] = useState("Todos");
    const [filterAlumno, setFilterAlumno] = useState("Todos");

    // Filtrado de historial familiar
    const filteredTx = DEMO_TRANSACCIONES_CLIENTE.filter((tx) => {
        const matchesSearch = tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.concepto.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesConcepto = filterConcepto === "Todos" || tx.concepto === filterConcepto;
        const matchesAlumno = filterAlumno === "Todos" || tx.alumno === filterAlumno;

        return matchesSearch && matchesConcepto && matchesAlumno;
    });

    // Métricas financieras calculadas del grupo familiar
    const totalInvertidoMes = DEMO_TRANSACCIONES_CLIENTE
        .filter(tx => tx.estado === "Aprobado")
        .reduce((acc, curr) => acc + curr.monto, 0);

    const saldoPendiente = 45; // Ejemplo de mensualidad o vestuario por pagar

    const handleReportarPago = async () => {
        console.log('Abrir modal de reporte de pago');
    };

    return (
        <>
            {/* SUB-TOPBAR (Saludos y Acción del Cliente) */}
            <HeroSection
                htmlTitle={`Historial y <em class="text-[#5e0472]">Estado de Pagos</em>`}
                htmlSubTitle={`Revisa tus recibos emitidos, saldos pendientes de tus representados y reporta nuevas transacciones.`}
                actions={[{
                    label: "Reportar Nuevo Pago →",
                    onClick: handleReportarPago,
                    icon: <Plus className="w-4 h-4" />,
                }]}
            />

            <div className="p-4 md:p-8 w-full overflow-y-auto space-y-6">

                {/* REPORTE FINANCIERO FAMILIAR */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Total Invertido */}
                    <div className="glass-card shadow-sm p-4 flex items-center gap-4">
                        <div className="w-10 h-10 bg-purple-100 flex items-center justify-center text-[#5e0472]">
                            <ArrowUpRight className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">Inversión del Mes (Mayo)</p>
                            <h4 className="text-xl font-anton text-gray-800">${totalInvertidoMes.toLocaleString()}</h4>
                            <span className="text-[10px] bg-purple-50 text-[#5e0472] font-bold px-2 py-0.5 inline-flex items-center gap-0.5 mt-1">
                                <TrendingUp className="w-3 h-3" /> Al día con matrículas
                            </span>
                        </div>
                    </div>

                    {/* Saldos por Pagar */}
                    <div className="glass-card shadow-sm p-4 flex items-center gap-4">
                        <div className="w-10 h-10 bg-pink-100 flex items-center justify-center text-pink-600">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">Saldos Pendientes</p>
                            <h4 className="text-xl font-anton text-gray-800">${saldoPendiente.toLocaleString()}</h4>
                            <p className="font-questrial text-xs text-gray-500">Correspondiente a asignaciones vigentes o por revisar.</p>
                        </div>
                    </div>
                </div>

                {/* BARRA DE FILTROS */}
                <div className="glass-card p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
                    <div className="relative w-full md:w-72">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Buscar por concepto o Nro. recibo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-purple-100 font-questrial text-xs bg-white/50 focus:outline-none focus:border-purple-400 transition text-gray-700"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
                        {/* Filtro por Representado */}
                        <div className="flex items-center gap-2 w-full sm:w-auto border border-purple-100 px-2 bg-white">
                            <Users className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <select
                                value={filterAlumno}
                                onChange={(e) => setFilterAlumno(e.target.value)}
                                className="p-2 w-full sm:w-auto font-questrial text-xs bg-white text-gray-700 focus:outline-none border-none"
                            >
                                <option value="Todos">Todos los representados</option>
                                <option value="Sofía Valentina">Sofía Valentina</option>
                                <option value="Lucas Mateo">Lucas Mateo</option>
                            </select>
                        </div>

                        {/* Filtro por Concepto */}
                        <select
                            value={filterConcepto}
                            onChange={(e) => setFilterConcepto(e.target.value)}
                            className="p-2 w-full sm:w-auto border border-purple-100 font-questrial text-xs bg-white text-gray-700 focus:outline-none"
                        >
                            <option value="Todos">Todos los conceptos</option>
                            <option value="Mensualidad">Mensualidades</option>
                            <option value="Matrícula">Matrículas</option>
                            <option value="Uniforme">Tienda / Uniformes</option>
                            <option value="Entradas Gala">Entradas de Eventos</option>
                        </select>
                    </div>
                </div>

                {/* TABLA HISTORIAL DE MOVIMIENTOS */}
                <div className="glass-card p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-800 mb-4 font-questrial">Historial de Recibos Familiares</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="text-gray-400 border-b border-purple-50 font-questrial">
                                    <th className="pb-3 font-semibold">ID Recibo</th>
                                    <th className="pb-3 font-semibold">Alumno</th>
                                    <th className="pb-3 font-semibold">Concepto</th>
                                    <th className="pb-3 font-semibold">Método</th>
                                    <th className="pb-3 font-semibold">Fecha</th>
                                    <th className="pb-3 font-semibold">Monto</th>
                                    <th className="pb-3 font-semibold text-right">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-purple-50/50">
                                {filteredTx.length > 0 ? (
                                    filteredTx.map((tx) => (
                                        <tr key={tx.id} className="text-gray-700 hover:bg-purple-50/20 transition font-questrial">
                                            {/* ID */}
                                            <td className="py-3.5 font-mono text-xs text-gray-400">{tx.id}</td>

                                            {/* Alumno */}
                                            <td className="py-3.5 font-bold text-gray-800">{tx.alumno}</td>

                                            {/* Concepto */}
                                            <td className="py-3.5 text-xs font-semibold">
                                                <span className={`px-2 py-0.5 ${tx.concepto === "Mensualidad" ? "bg-purple-50 text-purple-700" :
                                                    tx.concepto === "Uniforme" ? "bg-pink-50 text-pink-700" :
                                                        "bg-indigo-50 text-indigo-700"
                                                    }`}>
                                                    {tx.concepto}
                                                </span>
                                            </td>

                                            {/* Método de pago */}
                                            <td className="py-3.5 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <CreditCard className="w-3.5 h-3.5 text-gray-400" /> {tx.metodo}
                                                </span>
                                            </td>

                                            {/* Fecha */}
                                            <td className="py-3.5 text-xs text-gray-400 font-medium">{tx.fecha}</td>

                                            {/* Monto */}
                                            <td className="py-3.5 font-bold text-gray-800">${tx.monto}</td>

                                            {/* Estado */}
                                            <td className="py-3.5 text-right">
                                                <span className={`text-[10px] font-bold px-2.5 py-0.5 ${tx.estado === "Aprobado"
                                                    ? "bg-emerald-100 text-emerald-800"
                                                    : "bg-amber-100 text-amber-800 animate-pulse"
                                                    }`}>
                                                    {tx.estado}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-xs text-gray-400">
                                            No se encontraron registros de pago asociados a los criterios de búsqueda.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}