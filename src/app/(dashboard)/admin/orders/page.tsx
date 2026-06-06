// src/app/(dashboard)/admin/orders/page.tsx
"use client";

import { useState, useTransition } from "react";
import {
    Plus,
    Search,
    ShoppingBag,
    User,
    Calendar,
    Package,
    CheckCircle2,
    Truck,
    XCircle,
    AlertCircle,
    ChevronDown,
    Trash2,
    DollarSign,
    Layers,
    X
} from "lucide-react";
import HeroSection from "@/components/layout/HeroSection";

// Interfaces basadas estrictamente en tu schema.prisma
interface OrderItemMock {
    id: string;
    concept: "uniforme" | "entradas_gala";
    quantity: number;
    price: number;
}

interface OrderMock {
    id: string;
    userId: string;
    user: { name: string; dni: string };
    studentId: string | null;
    student: { firstName: string; lastName: string } | null;
    totalAmount: number;
    status: "pending_preparation" | "ready_for_delivery" | "delivered" | "canceled";
    createdAt: string;
    items: OrderItemMock[];
    paymentOrder: {
        status: "pending" | "paid" | "defeated" | "annulled";
    } | null;
}

export default function OrdersPage() {
    const [isPending, startTransition] = useTransition();
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Formulario de nuevo pedido
    const [formData, setFormData] = useState({
        userDni: "",
        studentDni: "",
    });
    const [cartItems, setCartItems] = useState<{ concept: "uniforme" | "entradas_gala"; quantity: number; price: string }[]>([
        { concept: "uniforme", quantity: 1, price: "" }
    ]);

    // Data Mockeada que representa la estructura relacional de Prisma
    const [orders, setOrders] = useState<OrderMock[]>(
        [
            {
                id: "ORD-9921",
                userId: "u1",
                user: { name: "Carlos Mendoza", dni: "V-12345678" },
                studentId: "s1",
                student: { firstName: "Sofía", lastName: "Mendoza" },
                totalAmount: 50.00,
                status: "pending_preparation",
                createdAt: "2026-06-02",
                items: [
                    { id: "item1", concept: "uniforme", quantity: 2, price: 25.00 }
                ],
                paymentOrder: { status: "paid" } // Ya pagó, el almacén puede prepararlo
            },
            {
                id: "ORD-4412",
                userId: "u2",
                user: { name: "Mariana Silva", dni: "V-18765432" },
                studentId: "s2",
                student: { firstName: "Thiago", lastName: "Silva" },
                totalAmount: 15.00,
                status: "ready_for_delivery",
                createdAt: "2026-06-01",
                items: [
                    { id: "item2", concept: "entradas_gala", quantity: 3, price: 5.00 }
                ],
                paymentOrder: { status: "paid" } // Listo para entregar en taquilla
            },
            {
                id: "ORD-1102",
                userId: "u3",
                user: { name: "Alejandro Ruiz", dni: "V-14555666" },
                studentId: null,
                student: null,
                totalAmount: 25.00,
                status: "pending_preparation",
                createdAt: "2026-05-28",
                items: [
                    { id: "item3", concept: "uniforme", quantity: 1, price: 25.00 }
                ],
                paymentOrder: { status: "pending" } // No ha pagado, congelar logística
            }
        ]
    );

    // Mapeos estéticos legibles
    const conceptLabels = {
        uniforme: "Uniforme",
        entradas_gala: "Entradas Gala",
    };

    const statusLabels = {
        pending_preparation: "Pendiente por Preparar",
        ready_for_delivery: "Listo para Entregar",
        delivered: "Entregado",
        canceled: "Cancelado",
    };

    const paymentStatusLabels = {
        pending: "Pago Pendiente",
        paid: "Pagado",
        defeated: "Vencido",
        annulled: "Anulado",
    };

    // Render de Badges Logísticos
    const renderOrderStatus = (status: OrderMock["status"]) => {
        const styles = {
            pending_preparation: "bg-amber-500/10 text-amber-400 border-amber-500/20",
            ready_for_delivery: "bg-blue-500/10 text-blue-400 border-blue-500/20",
            delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
            canceled: "bg-rose-500/10 text-rose-400 border-rose-500/20"
        };
        return (
            <span className={`px-2.5 py-1 text-xs font-questrial font-semibold border ${styles[status]}`}>
                {statusLabels[status]}
            </span>
        );
    };

    // Render de Badges Financieros
    const renderPaymentStatus = (status: OrderMock["paymentOrder"]["status"] | undefined) => {
        if (!status) return null;
        const styles = {
            pending: "bg-rose-500/10 text-rose-400 border-rose-500/20",
            paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
            defeated: "bg-amber-500/10 text-amber-400 border-amber-500/20",
            annulled: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20"
        };
        return (
            <span className={`px-2 py-0.5 text-[10px] font-questrial font-medium border ${styles[status]}`}>
                {paymentStatusLabels[status]}
            </span>
        );
    };

    // Manejador del ciclo de vida logístico
    const handleUpdateStatus = (orderId: string, newStatus: OrderMock["status"]) => {
        startTransition(async () => {
            // Aquí iría tu Server Action: await updateOrderStatus(orderId, newStatus);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        });
    };

    const handleNewElement = () => {
        setIsModalOpen(true);
    };

    // Agregar fila de ítem al carrito de creación
    const addCartItem = () => {
        setCartItems([...cartItems, { concept: "uniforme", quantity: 1, price: "" }]);
    };

    const removeCartItem = (index: number) => {
        setCartItems(cartItems.filter((_, i) => i !== index));
    };

    const handleCartItemChange = (index: number, field: string, value: any) => {
        const updated = [...cartItems];
        updated[index] = { ...updated[index], [field]: value };
        setCartItems(updated);
    };

    const onSubmitNewOrder = (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const total = cartItems.reduce((acc, item) => acc + (item.quantity * (parseFloat(item.price) || 0)), 0);

            const newOrder: OrderMock = {
                id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
                userId: "u-new",
                user: { name: "Usuario Manual (DNI)", dni: formData.userDni },
                studentId: formData.studentDni ? "s-new" : null,
                student: formData.studentDni ? { firstName: "Estudiante", lastName: "Asociado" } : null,
                totalAmount: total,
                status: "pending_preparation",
                createdAt: new Date().toISOString().split("T")[0],
                items: cartItems.map((c, idx) => ({
                    id: `itm-${idx}`,
                    concept: c.concept,
                    quantity: c.quantity,
                    price: parseFloat(c.price) || 0
                })),
                paymentOrder: { status: "pending" }
            };

            setOrders([newOrder, ...orders]);
            setIsModalOpen(false);
            setFormData({ userDni: "", studentDni: "" });
            setCartItems([{ concept: "uniforme", quantity: 1, price: "" }]);
        });
    };

    const filteredOrders = orders.filter(order =>
        order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user.dni.includes(searchTerm) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            {/* TOPBAR / HERO */}
            <HeroSection
                htmlTitle={`Control de <em class="text-[#5e0472]">Pedidos</em>`}
                htmlSubTitle={`Despacha uniformes, gestiona inventario de taquilla y coordina con administración.`}
                actions={[{
                    label: "Registrar Pedido",
                    onClick: handleNewElement,
                    icon: <Plus className="w-4 h-4" />,
                }]}
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




                {/* GRILLA / LISTADO DE PEDIDOS LOGÍSTICOS */}
                <div className="space-y-4">
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                            <div
                                key={order.id}
                                className={`glass-card p-5 shadow-sm border transition flex flex-col md:flex-row md:items-center justify-between gap-4 border-purple-50/60`}
                            >
                                {/* Bloque 1: Identificación y Persona */}
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:w-2/5">
                                    <div className="w-11 h-11 flex items-center justify-center shrink-0 bg-purple-100 text-purple-700">
                                        <User className="w-5 h-5" />
                                    </div>
                                    {
                                        order.user && (
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap font-questrial">
                                                    <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 font-bold bg-gray-100 text-gray-500"> {order.id}</span>
                                                    <span className="text-[10px] text-gray-400 font-questrial">{order.createdAt}</span>
                                                </div>
                                                <h3 className="font-anton text-gray-800 text-base mt-1">
                                                    {order.user.name}
                                                </h3>
                                                <p className="text-xs text-gray-500 font-questrial font-medium">
                                                    DNI: {order.user.dni}
                                                </p>
                                                {order.student && (
                                                    <p className="text-xs font-questrial text-[#6e0372]">
                                                        Para Alumno: <span className="font-semibold">{order.student.firstName} {order.student.lastName}</span>
                                                    </p>
                                                )}
                                            </div>
                                        )
                                    }

                                </div>




                                {/* Bloque 2: Desglose de Productos (Items) */}
                                <div className="flex-1 p-3 space-y-1.5 self-center w-full lg:max-w-md">
                                    <p className="text-[10px] font-questrial text-gray-400 tracking-wider uppercase mb-1">Artículos solicitados:</p>
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center text-xs font-questrial">
                                            <div className="flex items-center gap-2">
                                                <ShoppingBag className="w-3.5 h-3.5 text-[#5e0472]" />
                                                <span>{conceptLabels[item.concept]} <span className="text-gray-500">x{item.quantity}</span></span>
                                            </div>
                                            <span className="font-mono text-gray-400">${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                    <div className="border-t border-[#6e0372] pt-1.5 mt-2 flex justify-between items-center font-questrial">
                                        <span className="text-xs font-bold text-[#6e0372]">Total calculado:</span>
                                        <span className="text-sm font-bold text-[#6e0372]">${order.totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Bloque 3: Estado de Pago y Flujo Logístico */}
                                <div className="flex flex-col sm:flex-row lg:flex-col justify-between items-start sm:items-center lg:items-end gap-4 min-w-[240px]">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-400 font-questrial font-medium">Finanzas:</span>
                                            {renderPaymentStatus(order.paymentOrder?.status)}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-400 font-questrial font-medium">Logística:</span>
                                            {renderOrderStatus(order.status)}
                                        </div>
                                    </div>

                                    {/* Controladores Rápidos del Administrador */}
                                    <div className="flex gap-1.5 w-full sm:w-auto">
                                        {order.status === "pending_preparation" && (
                                            <button
                                                disabled={order.paymentOrder?.status !== "paid"}
                                                onClick={() => handleUpdateStatus(order.id, "ready_for_delivery")}
                                                className="w-full sm:w-auto px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                                title={order.paymentOrder?.status !== "paid" ? "No se puede preparar hasta que esté pagada" : ""}
                                            >
                                                <Package className="w-3.5 h-3.5" /> Empacar / Listo
                                            </button>
                                        )}
                                        {order.status === "ready_for_delivery" && (
                                            <button
                                                onClick={() => handleUpdateStatus(order.id, "delivered")}
                                                className="w-full sm:w-auto px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                            >
                                                <Truck className="w-3.5 h-3.5" /> Despachar / Entregar
                                            </button>
                                        )}
                                        {order.status !== "delivered" && order.status !== "canceled" && (
                                            <button
                                                onClick={() => handleUpdateStatus(order.id, "canceled")}
                                                className="px-2 py-1.5 border border-white/10 hover:border-rose-500/50 text-gray-400 hover:text-rose-400 rounded text-xs transition-all cursor-pointer"
                                            >
                                                <XCircle className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center text-gray-500 backdrop-blur-md">
                            <AlertCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                            No se encontraron registros de pedidos en el sistema.
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL: REGISTRAR COMPRA DESDE TAQUILLA */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-xl bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">

                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute right-4 top-4 text-gray-400 p-1 rounded-full hover:bg-white/5 transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-xl font-bold mb-1 text-purple-200 flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-[#5e0472]" /> Crear Pedido de Tienda
                        </h3>
                        <p className="text-xs text-gray-400 mb-5">Genera una solicitud física de uniformes o boletería desde la oficina.</p>

                        <form onSubmit={onSubmitNewOrder} className="space-y-4">

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider">DNI Representante *</label>
                                    <input
                                        type="text" required placeholder="Ej: V-12345678"
                                        value={formData.userDni}
                                        onChange={(e) => setFormData({ ...formData, userDni: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 py-2.5 px-3 focus:outline-none focus:border-[#5e0472] rounded-lg text-sm transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider">DNI Alumno (Opcional)</label>
                                    <input
                                        type="text" placeholder="Ej: V-30222111"
                                        value={formData.studentDni}
                                        onChange={(e) => setFormData({ ...formData, studentDni: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 py-2.5 px-3 focus:outline-none focus:border-[#5e0472] rounded-lg text-sm transition-all"
                                    />
                                </div>
                            </div>

                            {/* Sección del carrito dinámico */}
                            <div className="space-y-2 border-t border-white/5 pt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-purple-300 uppercase tracking-wide">Líneas del Pedido (Items)</label>
                                    <button
                                        type="button" onClick={addCartItem}
                                        className="text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 px-2 py-1 rounded border border-purple-500/20 transition-all flex items-center gap-1 cursor-pointer"
                                    >
                                        <Plus className="w-3 h-3" /> Añadir Artículo
                                    </button>
                                </div>

                                {cartItems.map((item, index) => (
                                    <div key={index} className="flex gap-2 items-center bg-white/5 p-2 rounded-lg animate-in fade-in duration-200">
                                        <div className="flex-1">
                                            <select
                                                value={item.concept}
                                                onChange={(e) => handleCartItemChange(index, "concept", e.target.value)}
                                                className="w-full bg-neutral-900 border border-white/10 p-2 rounded text-xs focus:outline-none text-gray-300"
                                            >
                                                <option value="uniforme">Uniforme</option>
                                                <option value="entradas_gala">Entradas Gala</option>
                                            </select>
                                        </div>
                                        <div className="w-20">
                                            <input
                                                type="number" min="1" required placeholder="Cant"
                                                value={item.quantity}
                                                onChange={(e) => handleCartItemChange(index, "quantity", parseInt(e.target.value) || 1)}
                                                className="w-full bg-white/5 border border-white/10 p-2 rounded text-xs text-center focus:outline-none"
                                            />
                                        </div>
                                        <div className="w-24 relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-emerald-500 text-xs">$</span>
                                            <input
                                                type="number" step="0.01" required placeholder="Precio"
                                                value={item.price}
                                                onChange={(e) => handleCartItemChange(index, "price", e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 py-2 pl-5 pr-2 rounded text-xs focus:outline-none"
                                            />
                                        </div>
                                        {cartItems.length > 1 && (
                                            <button
                                                type="button" onClick={() => removeCartItem(index)}
                                                className="p-2 text-gray-500 hover:text-rose-400 transition-all cursor-pointer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Botones */}
                            <div className="flex gap-3 pt-4 border-t border-white/5">
                                <button
                                    type="button" onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 border border-white/10 rounded-lg text-xs font-semibold text-gray-400 uppercase tracking-wider hover:bg-white/5 transition-all cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit" disabled={isPending}
                                    className="flex-1 px-4 py-2.5 gradient-purple rounded-lg text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                                >
                                    {isPending ? "Procesando..." : "Emitir Pedido"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}