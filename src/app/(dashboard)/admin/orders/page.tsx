// src/app/(dashboard)/admin/orders/page.tsx
"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import {
    Search,
    User,
    ChevronRight
} from "lucide-react";
import HeroSection from "@/components/layout/HeroSection";
import DataTable, { Column } from "@/components/common/DataTable";
import DatePipe from "@/components/pipes/DatePipe";
import { getAllOrdersAction } from "@/app/actions/order";
import { Order } from "@/types/order";

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [meta, setMeta] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 6,
        itemCount: 6,
    });
    const [isPending, startTransition] = useTransition();
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);


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
    const columns: Column<Order>[] = [
        {
            header: "Fecha de Registro",
            render: (order) => (
                <p className="text-[11px] text-gray-400 mt-0.5">
                    <DatePipe value={order.createdAt} format="short" />
                </p>
            ),
        },
        {
            header: "Cliente",
            render: (order) => {
                return (
                    <div className="flex items-center gap-2 p-1 hover:bg-purple-50/80 transition-all cursor-pointer rounded-sm">
                        <div className={`w-8 h-8 rounded-full  flex items-center justify-center  text-xs font-anton tracking-wider shrink-0 ${order.client
                            ? "text-white bg-[#5e0472]"
                            : "bg-slate-50"
                            }`}

                        >
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
                )
            }
        },
        {
            header: "Usuario",
            render: (order) => {
                if (!order.client.user) {
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
            header: "Monto",
            render: (element) => (
                <span className="font-bold text-gray-800">
                    ${element.totalAmount}
                </span>
            ),
        },
        {
            header: "Acciones",
            className: "text-right", // Alinea el encabezado a la derecha
            render: (element) => (<div className="flex gap-2 justify-end">

                <Link
                    href={`/admin/orders/${element.id}`}
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
            const res = await getAllOrdersAction({
                page: pageToFetch,
                limit: limitToFetch, // 🎯 Enviamos el límite dinámico
                search: searchTerm || undefined,
            });

            if (res.success && res.data) {
                setOrders(res.data);
                setMeta(res.meta); // NestJS ya devuelve el "itemsPerPage" en su meta
            }
        });
    };
    // 🎯 MANEJADORES DE LA TABLA
    useEffect(() => {
        const handler = setTimeout(() => {
            fetchData(currentPage, itemsPerPage);
        }, 300);

        return () => clearTimeout(handler);
    }, [searchTerm, currentPage, itemsPerPage]);
    return (
        <>
            {/* TOPBAR / HERO */}
            <HeroSection
                htmlTitle={`Control de <em class="text-[#5e0472]">Pedidos</em>`}
                htmlSubTitle={`Despacha uniformes, gestiona inventario de taquilla y coordina con administración.`}
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
                </div>
                {/* TABLA DE PEDIDOS */}
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