// src/app/(dashboard)/admin/payment-orders/page.tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Search,
    User,
    ChevronRight
} from "lucide-react";
import HeroSection from "@/components/layout/HeroSection";
import DatePipe from "@/components/pipes/DatePipe";
import DataTable, { Column } from "@/components/common/DataTable";
import Badge from "@/components/common/Badge";
import { ActionButton } from "@/components/ui/ActionButton";
import { getAllPaymentOrdersAction } from "@/app/actions/payment-order";
import { PaymentOrder } from "@/types/payment-order";

export default function PaymentOrdersPage() {
    const router = useRouter();
    // Mock Data alineado con tu esquema prisma nuevo
    const [orders, setOrders] = useState<PaymentOrder[]>([]);
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
    const [statusFilter, setStatusFilter] = useState("all")
    const [filterConcept, setFilterConcept] = useState("all");


    // Estados del formulario para nueva Orden




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
    const columns: Column<PaymentOrder>[] = [
        {
            header: "Fecha de Registro",
            render: (order) => (
                <p className="text-[11px] text-gray-400 mt-0.5">
                    <DatePipe value={order.createdAt} format="short" />
                </p>
            ),
        },
        {
            header: "Fecha de Vencimiento",
            render: (order) => (
                <p className="text-[11px] text-gray-400 mt-0.5">
                    <DatePipe value={order.dueDate} format="short" />
                </p>
            ),
        },
        {
            header: "Cliente",
            render: (order) => {
                if (!order.client) {
                    return <p className="text-[11px] text-gray-400 mt-0.5">Sin cliente</p>;
                }
                return (
                    <div className="flex items-center gap-2 p-1 hover:bg-purple-50/80 transition-all cursor-pointer rounded-sm">
                        <div className="w-8 h-8 rounded-full bg-[#5e0472] flex items-center justify-center text-white text-xs font-anton tracking-wider shrink-0">

                            <User className="w-3.5 h-3.5 shrink-0" />
                        </div>
                        {order.client ? (
                            <div className="hidden md:flex flex-col text-left font-questrial">
                                <span className="text-xs font-bold text-gray-700 leading-tight">{order.client.firstName}</span>
                                <span className="text-[10px] text-gray-400 max-w-[120px] truncate">{order.client.email || 'No registrado'}</span>
                            </div>) : (
                            <div className="hidden md:flex flex-col text-left font-questrial">
                                <span className="text-xs font-bold text-gray-700 leading-tight">Sin cliente</span>
                            </div>)}
                    </div>
                );
            },
        },
        {
            header: "Usuario",
            render: (order) => {
                if (!order.client?.user) {
                    return <p className="text-[11px] text-gray-400 mt-0.5">Sin usuario</p>;
                }
                return (
                    <div className="flex items-center gap-2 p-1 hover:bg-purple-50/80 transition-all cursor-pointer rounded-sm">
                        <div className="w-8 h-8 rounded-full bg-[#5e0472] flex items-center justify-center text-white text-xs font-anton tracking-wider shrink-0">
                            <User className="w-3.5 h-3.5 shrink-0" />
                        </div>
                        <div className="hidden md:flex flex-col text-left font-questrial">
                            <span className="text-xs font-bold text-gray-700 leading-tight">{order.client.user.name}</span>
                            <span className="text-[10px] text-gray-400 max-w-[120px] truncate">{order.client.user.email}</span>
                        </div>
                    </div>
                );
            },
        },
        {
            header: "Alumno",
            render: (order) => {
                if (!order.client?.student) {
                    return <p className="text-[11px] text-gray-400 mt-0.5">Sin alumno</p>;
                }
                return (
                    <div className="flex items-center gap-2 p-1 hover:bg-purple-50/80 transition-all cursor-pointer rounded-sm">
                        <div className="w-8 h-8 rounded-full bg-[#5e0472] flex items-center justify-center text-white text-xs font-anton tracking-wider shrink-0">
                            <User className="w-3.5 h-3.5 shrink-0" />
                        </div>
                        <div className="hidden md:flex flex-col text-left font-questrial">
                            <span className="text-xs font-bold text-gray-700 leading-tight">{order.client.student.firstName} {order.client.student.lastName}</span>
                            <span className="text-[10px] text-gray-400 max-w-[120px] truncate">{order.client?.student?.dni}</span>
                        </div>
                    </div>
                );
            },
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
            header: "Concepto",
            render: (order) => (
                <Badge variant={order.concept} />
            ),
        },
        {
            header: "Status",
            render: (order) => (
                <Badge variant={order.status} />
            ),
        },
        {
            header: "Acciones",
            className: "text-right", // Alinea el encabezado a la derecha
            render: (element) => (<div className="flex gap-2 justify-end">
                <Link
                    href={`/admin/payment-orders/${element.id}`}
                    className="font-questrial px-4 py-2 flex items-center justify-center gap-2 font-medium transition text-xs bg-purple-100 hover:bg-purple-200 border border-purple-100 text-purple-700 cursor-pointer rounded-xl"
                >
                    Ver detalles <ChevronRight className="w-3.5 h-3.5" />
                </Link>
            </div>
            ),
        },
    ];
    const fetchData = (pageToFetch: number, limitToFetch: number) => {
        startTransition(async () => {
            const res = await getAllPaymentOrdersAction({
                page: pageToFetch,
                limit: limitToFetch, // 🎯 Enviamos el límite dinámico
                search: searchTerm || undefined,
                status: statusFilter == 'all' ? undefined : statusFilter,
                concept: filterConcept == 'all' ? undefined : filterConcept,
            });
            if (res.success && res.data) {
                setOrders(res.data);
                setMeta(res.meta); // NestJS ya devuelve el "itemsPerPage" en su meta
            }
        });
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchData(currentPage, itemsPerPage);
        }, 300);

        return () => clearTimeout(handler);
    }, [searchTerm, statusFilter, filterConcept, currentPage, itemsPerPage]);
    return (
        <>
            {/* TOPBAR / HERO */}
            <HeroSection
                htmlTitle={`Órdenes de <em class="text-[#5e0472]">Pago</em>`}
                htmlSubTitle={`Administra, emite aranceles y monitorea las cuentas por cobrar de la academia.`}
                actions={[]}
            />

            {/* CONTENEDOR PRINCIPAL */}
            <div className="p-4 md:p-8 w-full overflow-y-auto space-y-6">

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
                    <div className="flex gap-2">
                        <select
                            value={filterConcept}
                            onChange={(e) => setFilterConcept(e.target.value)}
                            className="p-2 w-full sm:w-auto border border-purple-100 font-questrial text-xs bg-white text-gray-700 focus:outline-none"
                        >
                            <option value="all">Todos los conceptos</option>
                            <option value="monthly_payment">Mensualidades</option>
                            <option value="tuition">Matrículas</option>
                            <option value="locker_room">Tienda / Uniformes</option>
                            <option value="ticket">Entradas de Eventos</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="p-2 w-full sm:w-auto border border-purple-100 font-questrial text-xs bg-white text-gray-700 focus:outline-none"
                        >
                            <option value="all">Todos los estados</option>
                            <option value="pending">Pendiente</option>
                            <option value="paid">Pagada</option>
                            <option value="defeated">Vencida</option>
                            <option value="annulled">Anulada</option>
                        </select>

                    </div>
                </div>
                {/* TABLA DE ALUMNOS */}
                <DataTable
                    data={orders}
                    columns={columns}
                    meta={meta}
                    isLoading={isPending}
                    onPageChange={handlePageChange}
                    onLimitChange={handleLimitChange} // 👈 Pasamos el manejador del límite
                    rowKey={(order) => order.id}
                    emptyMessage="No se encontraron ordenes registradas."
                />
            </div>

        </>
    );
}