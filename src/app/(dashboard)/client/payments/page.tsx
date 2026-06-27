// src/app/(dashboard)/client/payments/page.tsx
"use client";

import { useEffect, useState, useTransition } from "react";
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
import HeroSection from "@/components/layout/HeroSection";
import DataTable, { Column } from "@/components/common/DataTable";
import Badge from "@/components/common/Badge";
import DatePipe from "@/components/pipes/DatePipe";
import { getMyTransactionsAction } from "@/app/actions/transaction";
import { Transaction } from "@/types/transaction";

export default function ClientPaymentsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [meta, setMeta] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        itemCount: 10,
    });
    const [isPending, startTransition] = useTransition();
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [filterConcept, setFilterConcept] = useState("all");

    // Métricas financieras calculadas del grupo familiar
    const totalInvertidoMes = 10;
    const saldoPendiente = 45; // Ejemplo de mensualidad o vestuario por pagar

    const handleReportarPago = async () => {
        console.log('Abrir modal de reporte de pago');
    };
    const fetchTableData = (pageToFetch: number, limitToFetch: number) => {
        startTransition(async () => {
            const res = await getMyTransactionsAction({
                page: pageToFetch,
                limit: limitToFetch, // 🎯 Enviamos el límite dinámico
                search: searchTerm || undefined,
                concept: filterConcept == 'all' ? undefined : filterConcept
            });
            if (res.success && res.data) {
                setTransactions(res.data);
                setMeta(res.meta); // NestJS ya devuelve el "itemsPerPage" en su meta
            }
        });
    };
    // 🔄 Efecto reactivo con debounce para consultas al servidor
    // Reacciona a cambios en buscador, página o cantidad de filas
    useEffect(() => {
        const handler = setTimeout(() => {
            fetchTableData(currentPage, itemsPerPage);
        }, 300);

        return () => clearTimeout(handler);
    }, [searchTerm, filterConcept, currentPage, itemsPerPage]);
    // 3️⃣ 🎯 MANEJADOR DE CAMBIO DE PÁGINA
    const handlePageChange = (newPage: number) => {
        // Actualizamos el estado local. Al cambiar, disparará el useEffect superior de forma reactiva
        setCurrentPage(newPage);

        // 💡 Opcional y Recomendado: Scroll suave hacia arriba de la tabla para mejorar la UX al cambiar de página
        //window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 🎯 MANEJADOR DE CAMBIO DE LÍMITE (Filas por página)
    const handleLimitChange = (newLimit: number) => {
        setItemsPerPage(newLimit);
        setCurrentPage(1); // 💡 Regla de oro: Si cambias el límite, vuelve siempre a la página 1
    };
    // 🎯 Configuración declarativa de las columnas
    const columns: Column<Transaction>[] = [
        {
            header: "Fecha de Registro",
            render: (transaction) => (
                <p className="text-[11px] text-gray-400 mt-0.5">
                    <DatePipe value={transaction.createdAt} format="short" />
                </p>
            ),
        },
        {
            header: "Alumno",
            render: (transaction) => {
                if (!transaction.student) {
                    return <p className="text-[11px] text-gray-400 mt-0.5">Sin alumno</p>;
                }
                const userInitials = transaction.student.firstName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
                return (
                    <div className="flex items-center gap-2 p-1 hover:bg-purple-50/80 transition-all cursor-pointer rounded-sm">
                        <div className="w-8 h-8 rounded-full bg-[#5e0472] flex items-center justify-center text-white text-xs font-anton tracking-wider shrink-0">
                            {userInitials}
                        </div>
                        <div className="hidden md:flex flex-col text-left font-questrial">
                            <span className="text-xs font-bold text-gray-700 leading-tight">{transaction.student.firstName} {transaction.student.lastName}</span>
                            <span className="text-[10px] text-gray-400 max-w-[120px] truncate">{transaction.student.dni}</span>
                        </div>
                    </div>
                );
            },
        },
        {
            header: "Concepto",
            render: (transaction) => (
                <Badge variant={transaction.concept} />
            ),
        },
        {
            header: "Monto",
            render: (transaction) => (
                <span className="font-bold text-gray-800">
                    ${transaction.amount}
                </span>
            ),
        },
        {
            header: "Método de Pago",
            render: (transaction) => (
                <Badge variant={transaction.method} />
            ),
        },
        {
            header: "Status",
            render: (transaction) => (
                <Badge variant={transaction.status} />
            ),
        },
    ];
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
                        {/* Filtro por Concepto */}
                        <select
                            value={filterConcept}
                            onChange={(e) => setFilterConcept(e.target.value)}
                            className="p-2 w-full sm:w-auto border border-purple-100 font-questrial text-xs bg-white text-gray-700 focus:outline-none"
                        >
                            <option value="all">Todos los conceptos</option>
                            <option value="monthly_payment">Mensualidades</option>
                            <option value="tuition">Matrículas</option>
                            <option value="locker_room">Vestuario / Uniformes</option>
                            <option value="ticket">Entradas de Eventos</option>
                        </select>
                    </div>
                </div>

                {/* TABLA HISTORIAL DE MOVIMIENTOS */}
                <DataTable
                    data={transactions}
                    columns={columns}
                    meta={meta}
                    isLoading={isPending}
                    onPageChange={handlePageChange}
                    onLimitChange={handleLimitChange} // 👈 Pasamos el manejador del límite
                    rowKey={(transaction) => transaction.id}
                    emptyMessage="No se encontraron transacciones registradas."
                />
            </div>
        </>
    );
}