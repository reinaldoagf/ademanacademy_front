"use client";

import { useState, useEffect, useRef } from "react";
import {
    ShoppingBag,
    X,
    Minus,
    Plus,
    Trash2,
    ArrowRight,
    UserCheck,
    Search,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore"; // Ajusta la ruta a tu store
import { getAllUsersAction } from "@/app/actions/user"; // Ajusta la ruta a tu action

export function CartDrawer() {
    const {
        items,
        isOpen,
        closeCart,
        removeItem,
        updateQuantity,
        getTotalAmount,
        userId,
        setUserId,
    } = useCartStore();

    const totalAmount = getTotalAmount();
    const totalCount = items.reduce((acc, i) => acc + i.quantity, 0);

    // --- ESTADOS PARA BÚSQUEDA DE USUARIOS ---
    const [userSearch, setUserSearch] = useState("");
    const [usersList, setUsersList] = useState<any[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
    const [selectedUserName, setSelectedUserName] = useState("");
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);

    const userRef = useRef<HTMLDivElement>(null);

    // Cargar usuarios al abrir la barra lateral
    useEffect(() => {
        if (!isOpen) return;

        const fetchUsers = async () => {
            setIsLoadingUsers(true);
            try {
                const response = await getAllUsersAction({});
                if (response.success && response.data) {
                    setUsersList(response.data);
                    setFilteredUsers(response.data);
                } else {
                    setUsersList([]);
                    setFilteredUsers([]);
                }
            } catch (error) {
                console.error("Error al cargar usuarios:", error);
                setUsersList([]);
                setFilteredUsers([]);
            } finally {
                setIsLoadingUsers(false);
            }
        };

        fetchUsers();
    }, [isOpen]);

    // Evento para cerrar el desplegable al hacer clic fuera del componente
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userRef.current && !userRef.current.contains(event.target as Node)) {
                setShowUserDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filtrado reactivo de usuarios
    const handleSearchChange = (value: string) => {
        setUserSearch(value);
        setShowUserDropdown(true);

        if (userId) {
            setUserId(null);
            setSelectedUserName("");
        }

        const query = value.toLowerCase().trim();
        if (!query) {
            setFilteredUsers(usersList);
            return;
        }

        const filtered = usersList.filter((u) => {
            const fullName = `${u.firstName ?? ""} ${u.lastName ?? ""}`.toLowerCase();
            const email = u.email?.toLowerCase() ?? "";
            const dni = u.dni?.toLowerCase() ?? u.identification ?? "";
            return (
                fullName.includes(query) || email.includes(query) || dni.includes(query)
            );
        });

        setFilteredUsers(filtered);
    };

    const handleSelectUser = (user: any) => {
        const displayName =
            `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email;
        setUserId(user.id);
        setSelectedUserName(displayName);
        setUserSearch(displayName);
        setShowUserDropdown(false);
    };

    const handleClearUserSelection = () => {
        setUserId(null);
        setSelectedUserName("");
        setUserSearch("");
        setFilteredUsers(usersList);
    };

    return (
        <aside
            className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
                }`}
        >
            {/* Header */}
            <div className="p-4 bg-purple-50 border-b border-purple-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#5e0472]">
                    <ShoppingBag className="w-5 h-5" />
                    <h2 className="font-questrial font-bold text-base">
                        Carrito de Compras
                    </h2>
                    <span className="text-xs bg-purple-200/60 px-2 py-0.5 rounded-full font-semibold">
                        {totalCount}
                    </span>
                </div>
                <button
                    onClick={closeCart}
                    className="cursor-pointer p-1.5 text-gray-400 hover:text-gray-700 hover:bg-purple-100 rounded-lg transition"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Lista de Ítems */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-questrial text-xs">
                {items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                        <ShoppingBag className="w-12 h-12 stroke-1 text-purple-200" />
                        <p className="text-sm font-medium">Tu carrito está vacío</p>
                    </div>
                ) : (
                    items.map((item) => (
                        <div
                            key={item.tempId}
                            className="p-3 bg-purple-50/30 border border-purple-100 rounded-lg flex justify-between items-start gap-2"
                        >
                            <div className="space-y-1 flex-1">
                                <p className="font-bold text-gray-800">
                                    {item.conceptLabel || item.concept}
                                </p>
                                {item.student && (
                                    <p className="text-[10px] text-gray-500">
                                        Alumno: {item.student.firstName} {item.student.lastName}
                                    </p>
                                )}
                                <p className="text-purple-700 font-bold">
                                    ${(item.price ?? 0)}
                                </p>

                                <div className="flex items-center gap-2 pt-1">
                                    <button
                                        onClick={() =>
                                            updateQuantity(item.tempId, item.quantity - 1)
                                        }
                                        className="cursor-pointer p-1 border border-purple-200 rounded hover:bg-purple-100"
                                    >
                                        <Minus className="w-3 h-3 text-purple-700" />
                                    </button>
                                    <span className="font-bold text-xs px-1">
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() =>
                                            updateQuantity(item.tempId, item.quantity + 1)
                                        }
                                        className="cursor-pointer p-1 border border-purple-200 rounded hover:bg-purple-100"
                                    >
                                        <Plus className="w-3 h-3 text-purple-700" />
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={() => removeItem(item.tempId)}
                                className="cursor-pointer text-red-400 hover:text-red-600 p-1"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Footer: Búsqueda + Total + Botón */}
            {items.length > 0 && (
                <div className="p-4 border-t border-purple-100 bg-purple-50/20 space-y-3 font-questrial">
                    {/* Campo de Búsqueda de Usuario */}
                    <div className="relative" ref={userRef}>
                        <label className="block text-gray-600 font-bold mb-1 text-xs">
                            Asignar Cliente / Usuario *
                        </label>

                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar usuario por nombre, email o DNI..."
                                value={userSearch}
                                onFocus={() => setShowUserDropdown(true)}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className={`w-full p-2 pl-8 pr-7 border rounded-lg bg-white text-xs focus:outline-none transition ${userId
                                    ? "border-emerald-400 bg-emerald-50/20 text-emerald-900 font-medium"
                                    : "border-purple-200 focus:border-purple-400"
                                    }`}
                            />
                            <Search className="w-3.5 h-3.5 text-purple-400 absolute left-2.5 top-2.5" />

                            {isLoadingUsers && (
                                <div className="absolute right-2.5 top-2.5 w-3.5 h-3.5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                            )}

                            {userId && (
                                <button
                                    type="button"
                                    onClick={handleClearUserSelection}
                                    className="absolute right-2 top-2 p-0.5 text-gray-400 hover:text-rose-600 transition"
                                    title="Cambiar usuario"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Desplegable emergente superior */}
                        {showUserDropdown && !userId && (
                            <ul className="absolute z-50 left-0 right-0 bottom-full mb-1 max-h-44 overflow-y-auto bg-white border border-purple-100 shadow-xl rounded-lg divide-y divide-gray-50 text-xs">
                                {isLoadingUsers ? (
                                    <li className="p-2.5 text-gray-400 italic">
                                        Cargando usuarios...
                                    </li>
                                ) : filteredUsers.length === 0 ? (
                                    <li className="p-2.5 text-rose-500 bg-rose-50/40">
                                        No se encontraron usuarios coincidentes
                                    </li>
                                ) : (
                                    filteredUsers.map((u: any) => (
                                        <li
                                            key={u.id}
                                            onClick={() => handleSelectUser(u)}
                                            className="p-2 hover:bg-purple-50 cursor-pointer transition-colors flex justify-between items-center"
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-800">
                                                    {u.firstName} {u.lastName}
                                                </span>
                                                <span className="text-[10px] text-gray-400">
                                                    {u.email}
                                                </span>
                                            </div>
                                            {u.dni && (
                                                <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-sans">
                                                    {u.dni}
                                                </span>
                                            )}
                                        </li>
                                    ))
                                )}
                            </ul>
                        )}

                        {/* Badge de Selección */}
                        {userId && (
                            <div className="mt-1.5 flex items-center gap-1.5 text-emerald-700 text-[11px] font-medium bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                                <UserCheck className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="truncate">
                                    Cliente: <strong>{selectedUserName}</strong>
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Resumen de Total */}
                    <div className="flex justify-between items-center text-sm font-bold text-gray-800 pt-1">
                        <span>Total Estimado:</span>
                        <span className="text-[#5e0472] text-base">
                            ${(totalAmount ?? 0).toFixed(2)}
                        </span>
                    </div>

                    {/* Botón de Checkout */}
                    <button
                        disabled={!userId}
                        onClick={() => {
                            if (!userId) return;
                            closeCart();
                        }}
                        className={`w-full py-2.5 px-4 font-bold rounded-lg shadow-md transition flex items-center justify-center gap-2 text-xs ${userId
                            ? "bg-[#5e0472] hover:bg-[#4a0359] text-white cursor-pointer"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                            }`}
                    >
                        <span>{userId ? "Registrar Pedido" : "Selecciona un cliente"}</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </aside>
    );
}