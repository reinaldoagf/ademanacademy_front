// src/app/(dashboard)/admin/orders/page.tsx
"use client";

import { useState, useTransition, useEffect } from "react";
import {
    Calendar,
    CreditCard,
    Eye,
    FileText,
    Search,
    ShoppingBag,
    User,
} from "lucide-react";
import HeroSection from "@/components/layout/HeroSection";
import DataTable, { Column } from "@/components/common/DataTable";
import DatePipe from "@/components/pipes/DatePipe";
import { MacDockModal } from "@/components/ui/MacDockModal";
import Badge from "@/components/common/Badge";
import { useModal } from "@/hooks/useModal";
import { getAllOrdersAction } from "@/app/actions/order";
import { Order, OrderDetails } from "@/types/order";

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

    const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
    const {
        isOpen: isOrderDetailsModalOpen,
        openModal: openOrderDetailsModal,
        closeModal: closeOrderDetailsModal
    } = useModal();
    const handleOpenDetails = (order: OrderDetails) => {
        setSelectedOrder(order);
        openOrderDetailsModal();
    };
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
            header: "Usuario",
            render: (order) => {
                if (!order.user) {
                    return <p className="text-[11px] text-gray-400 mt-0.5">Sin usuario</p>;
                }
                const userInitials = order.user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
                return (
                    <div className="flex items-center gap-2 p-1 hover:bg-purple-50/80 transition-all cursor-pointer rounded-sm">
                        <div className="w-8 h-8 rounded-full bg-[#5e0472] flex items-center justify-center text-white text-xs font-anton tracking-wider shrink-0">
                            {userInitials}
                        </div>
                        <div className="hidden md:flex flex-col text-left font-questrial">
                            <span className="text-xs font-bold text-gray-700 leading-tight">{order.user.name}</span>
                            <span className="text-[10px] text-gray-400 max-w-[120px] truncate">{order.user.email}</span>
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
                <div className="relative inline-block group">
                    <button onClick={() => handleOpenDetails(element)}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-questrial font-bold rounded-xl cursor-pointer text-emerald-700 bg-emerald-50 hover:bg-emerald-100`}
                    >
                        <Eye className="w-3.5 h-3.5" /> Ver detalles
                    </button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-3 py-1.5 pointer-events-none">
                        Ver detalles
                    </div>
                </div>
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


            {/* MODAL: HISTORIAL DE ABONOS */}
            <MacDockModal
                isOpen={isOrderDetailsModalOpen}
                onClose={closeOrderDetailsModal}
                title={`Detalles de producto`}
                size={"lg"}
            >
                {/* Body */}
                <div className="space-y-6 overflow-y-auto flex-1 text-xs">
                    {/* Información General y Cliente */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Tarjeta Cliente */}
                        <div className="font-questrial p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-2">
                            <div className="flex items-center gap-2 text-[#5e0472] font-bold text-sm mb-1">
                                <User className="w-4 h-4" />
                                <span className="">Información del Cliente</span>
                            </div>
                            <p className="text-gray-900 font-bold text-sm">
                                {selectedOrder?.user?.name || "Sin Nombre"}
                            </p>
                            {selectedOrder?.user?.dni && (
                                <p className=" text-gray-500 font-medium">DNI / Cedula: {selectedOrder?.user.dni}</p>
                            )}
                            {selectedOrder?.user?.email && (
                                <p className="text-gray-500">Email: {selectedOrder?.user.email}</p>
                            )}
                            {selectedOrder?.user?.phone && (
                                <p className=" text-gray-500">Teléfono: {selectedOrder?.user.phone}</p>
                            )}
                        </div>

                        {/* Tarjeta Pedido */}
                        <div className="font-questrial p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-2.5">
                            <div className="flex items-center gap-2 text-[#5e0472] font-bold text-sm mb-1">
                                <FileText className="w-4 h-4" />
                                <span className="">Estado y Registro</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Estado Pedido:</span>
                                {selectedOrder && (<Badge variant={selectedOrder.status} />)}
                            </div>
                            <div className="flex justify-between items-center text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5 text-gray-400" /> Fecha:
                                </span>
                                <span className="font-medium text-gray-800">
                                    {selectedOrder && (<DatePipe value={selectedOrder.createdAt} format="short" />)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Tabla de Ítems / Productos */}
                    <div className="space-y-3 font-questrial">
                        <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-[#5e0472]" />
                            <span className="">Productos y Servicios ({selectedOrder?.items?.length || 0})</span>
                        </h4>

                        <div className="border border-purple-100 rounded-xl overflow-hidden">
                            <table className=" w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-purple-50/60 text-purple-900 font-bold border-b border-purple-100">
                                        <th className="p-3">Concepto</th>
                                        <th className="p-3">Descripción</th>
                                        <th className="p-3 text-center">Cantidad</th>
                                        <th className="p-3 text-right">Precio Un.</th>
                                        <th className="p-3 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-700">
                                    {selectedOrder?.items && selectedOrder?.items.length > 0 ? (
                                        selectedOrder?.items.map((item) => {
                                            const priceNum = Number(item.price) || 0;
                                            const subtotal = priceNum * item.quantity;
                                            return (
                                                <tr key={item.id} className="hover:bg-purple-50/20">
                                                    <td className="p-3 font-medium text-gray-900">
                                                        <div className="capitalize">{item.concept}</div>
                                                        {item.student && (
                                                            <div className="text-[10px] text-gray-400">
                                                                Alumno: {item.student.name || `${item.student.firstName || ''} ${item.student.lastName || ''}`}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-3">{item.description}</td>
                                                    <td className="p-3 text-center font-bold">{item.quantity}</td>
                                                    <td className="p-3 text-right">${priceNum.toFixed(2)}</td>
                                                    <td className="p-3 text-right font-bold text-gray-900">
                                                        ${subtotal.toFixed(2)}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="p-4 text-center text-gray-400 italic">
                                                No hay ítems detallados en este pedido
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Orden de Pago Asociada */}
                    {selectedOrder?.paymentOrder && (
                        <div className="font-questrial p-4 bg-purple-50/40 border border-purple-100 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5 font-bold text-purple-900">
                                    <CreditCard className="w-4 h-4 text-[#5e0472]" />
                                    <span>Orden de Pago Asociada</span>
                                </div>
                                <p className="text-[11px] text-gray-500 font-mono">
                                    ID: {selectedOrder?.paymentOrder.id}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs bg-purple-200/60 text-purple-800 font-semibold px-2.5 py-0.5 rounded-full capitalize">
                                    {selectedOrder?.paymentOrder.status}
                                </span>
                                <span className="font-bold text-base text-[#5e0472]">
                                    ${Number(selectedOrder?.paymentOrder.amount || 0).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Monto Total */}
                    <div className="font-questrial flex justify-between items-center p-4 gradient-purple text-white shadow-lg shadow-purple-200  rounded-xl font-bold">
                        <span className="text-sm">Monto Total del Pedido:</span>
                        <span className="text-lg text-emerald-400">
                            ${Number(selectedOrder?.totalAmount || 0).toFixed(2)}
                        </span>
                    </div>
                </div>
                <div className="pt-4 border-t border-purple-100 bg-purple-50/20 flex justify-between shrink-0">
                    <button
                        type="button"
                        onClick={() => closeOrderDetailsModal()}
                        className="cursor-pointer font-questrial px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50 rounded-md"
                    >
                        Cancelar
                    </button>
                </div>
            </MacDockModal>
        </>
    );
}