// src/app/(dashboard)/admin/payments/page.tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import {
    Wallet,
    ArrowUpRight,
    Plus,
    Search,
    TrendingUp,
    CreditCard,
    AlertCircle
} from "lucide-react";
import HeroSection from '@/components/layout/HeroSection';
import DataTable, { Column } from "@/components/common/DataTable";
import Badge from "@/components/common/Badge";
import DatePipe from "@/components/pipes/DatePipe";
import PaymentDetailModal from "@/components/modals/PaymentDetailModal";
import { getAllTransactionsAction } from "@/app/actions/transaction";
import { Transaction } from "@/types/transaction";

export default function PaymentsPage() {
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
    // 💡 Estados para controlar el modal
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSuccessApproval = () => {
        fetchTableData(currentPage, itemsPerPage);
    };

    // Métricas financieras calculadas dinámicamente
    const ingresosMes = 6450;
    const porCobrar = 1120;
    const cajaChica = 340;

    const handleNewElement = async () => {
        console.log('handleNewElement')
    }
    const fetchTableData = (pageToFetch: number, limitToFetch: number) => {
        startTransition(async () => {
            const res = await getAllTransactionsAction({
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
            header: "Usuario",
            render: (transaction) => {
                const initials = transaction.user ? `${transaction.user.name[0] || ""}${transaction.user.name[1] || ""}`.toUpperCase() : "";
                return (
                    <div className="flex items-center gap-2 p-1 hover:bg-purple-50/80 transition-all cursor-pointer rounded-sm">
                        {initials && <div className="w-8 h-8 rounded-full bg-[#5e0472] flex items-center justify-center text-white text-xs font-anton tracking-wider shrink-0">
                            {initials}
                        </div>}
                        <div className="hidden md:flex flex-col text-left font-questrial">
                            <span className="text-xs font-bold text-gray-700 leading-tight">
                                {transaction.user?.name}
                            </span>
                            <span className="text-[10px] text-gray-400 max-w-[120px] truncate">{transaction.user?.email}</span>
                        </div>
                    </div>
                );
            },
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
        {
            header: "Acciones",
            className: "text-right", // Alinea el encabezado a la derecha
            render: (student) => (
                <button
                    onClick={() => {
                        setSelectedPayment(student); // Seteamos el objeto de la consola
                        setIsModalOpen(true);        // Abrimos el modal
                    }}
                    className="text-xs bg-white border border-purple-100 text-[#5e0472] px-3 py-1 font-semibold hover:bg-[#5e0472] hover:text-white transition shadow-sm cursor-pointer"
                >
                    Ver detalles
                </button>
            ),
        },
    ];
    return (
        <>
            {/* SUB-TOPBAR (Saludos y Acción rápida) */}
            <HeroSection
                htmlTitle={`Caja y Flujo de <em class="text-[#5e0472]">Pagos</em>`}
                htmlSubTitle={`Administra las recaudaciones diarias, mensualidades de alumnos e ingresos por tienda.`}
                actions={[{
                    label: "Registrar Ingreso a Caja →",
                    onClick: handleNewElement,
                    icon: <Plus className="w-4 h-4" />,
                }]}
            />
            <div className="p-4 md:p-8 w-full overflow-y-auto space-y-6">
                {/* REPORTE FINANCIERO EXPRESS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Total Recaudado */}
                    <div className="glass-card shadow-sm p-4 flex items-center gap-4">
                        <div className="w-10 h-10 bg-purple-100 flex items-center justify-center text-[#5e0472]">
                            <ArrowUpRight className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">Recaudación de Mayo</p>
                            <h4 className="text-xl font-anton text-gray-800">${ingresosMes.toLocaleString()}</h4>
                            <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 inline-flex items-center gap-0.5">
                                <TrendingUp className="w-3 h-3" /> +12% vs mes anterior
                            </span>
                        </div>
                    </div>
                    {/* Cuentas por Cobrar */}
                    <div className="glass-card shadow-sm p-4 flex items-center gap-4">
                        <div className="w-10 h-10 bg-pink-100 flex items-center justify-center text-pink-600 ">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">Cuentas por Cobrar</p>
                            <h4 className="text-xl font-anton text-gray-800">${porCobrar.toLocaleString()}</h4>
                            <p className="font-questrial text-xs text-gray-500">Alumnos con mensualidad vencida.</p>
                        </div>
                    </div>

                    {/* Caja Chica */}

                    <div className="glass-card shadow-sm p-4 flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <Wallet className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">Efectivo en Caja</p>
                            <h4 className="text-xl font-anton text-gray-800">${cajaChica.toLocaleString()}</h4>
                            <p className="font-questrial text-xs text-gray-500">Monto disponible para gastos locales.</p>
                        </div>
                    </div>
                </div>

                {/* BARRA DE FILTROS */}
                <div className="glass-card p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Buscar por bailarín o nro de recibo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-purple-100 font-questrial text-xs bg-white/50 focus:outline-none focus:border-purple-400 transition text-gray-700"
                        />
                    </div>

                    <select
                        value={filterConcept}
                        onChange={(e) => setFilterConcept(e.target.value)}
                        className="p-2 w-full sm:w-auto border border-purple-100 font-questrial text-xs bg-white text-gray-700 focus:outline-none"
                    >
                        <option value="Todos">Todos los conceptos</option>
                        <option value="monthly_payment">Mensualidades</option>
                        <option value="tuition">Matrículas</option>
                        <option value="locker_room">Tienda / Uniformes</option>
                        <option value="ticket">Entradas de Eventos</option>
                    </select>
                </div>

                {/* TABLA DE ALUMNOS */}
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
            <PaymentDetailModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedPayment(null);
                }}
                transaction={selectedPayment}
                onSuccess={handleSuccessApproval}
            />
        </>
    );
}