// src/app/(dashboard)/admin/users/page.tsx
"use client";
import React, { useState, useEffect, useTransition } from "react";
import {
    Wallet,
    ArrowUpRight,
    Plus,
    Search,
    TrendingUp,
    CreditCard,
    AlertCircle
} from "lucide-react";
import HeroSection from "@/components/layout/HeroSection";
import DataTable, { Column } from "@/components/common/DataTable";
import DatePipe from "@/components/pipes/DatePipe";
import { User } from "@/types/user";
import {
    getAllUsersAction
} from "@/app/actions/user";

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [meta, setMeta] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        itemCount: 10,
    });

    // Estados de Filtros
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [isPending, startTransition] = useTransition();
    const fetchTableData = (pageToFetch: number, limitToFetch: number) => {
        startTransition(async () => {
            const res = await getAllUsersAction({
                page: pageToFetch,
                limit: limitToFetch, // 🎯 Enviamos el límite dinámico
                search: searchTerm || undefined,
            });

            if (res.success && res.data) {
                setUsers(res.data);
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
    }, [searchTerm, currentPage, itemsPerPage]);

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
    const columns: Column<User>[] = [
        {
            header: "Fecha de Registro",
            render: (user) => (
                <p className="text-[11px] text-gray-400 mt-0.5">
                    <DatePipe value={user.createdAt} format="short" />
                </p>
            ),
        },
        {
            header: "Usuario",
            render: (user) => {
                const initials = `${user.name[0] || ""}${user.name[1] || ""}`.toUpperCase();
                return (
                    <div className="flex items-center gap-2 p-1 hover:bg-purple-50/80 transition-all cursor-pointer rounded-sm">
                        {initials && <div className="w-8 h-8 rounded-full bg-[#5e0472] flex items-center justify-center text-white text-xs font-anton tracking-wider shrink-0">
                            {initials}
                        </div>}
                        <div className="hidden md:flex flex-col text-left font-questrial">
                            <span className="text-xs font-bold text-gray-700 leading-tight">
                                {user?.name}
                            </span>
                            <span className="text-[10px] text-gray-400 max-w-[120px] truncate">{user?.email}</span>
                        </div>
                    </div>
                );
            },
        },
        {
            header: "DNI",
            render: (user) => (
                <span className="font-bold text-gray-800">
                    {user.dni}
                </span>
            ),
        },
        {
            header: "Télefono",
            render: (user) => (
                <span className="font-bold text-gray-800">
                    {user.phone}
                </span>
            ),
        },
    ];
    return (
        <>
            {/* SUB-TOPBAR (Saludos y Acción rápida) */}
            <HeroSection
                htmlTitle={`Gestión de <em class="text-[#5e0472]">Usuarios</em>`}
                htmlSubTitle={`Gestiona operaciones sobre usuarios registrados en sistema.`}
                actions={[]}
            />
            <div className="p-4 md:p-8 w-full overflow-y-auto space-y-6">
                {/* BARRA DE FILTROS */}
                <div className="glass-card p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, correo, DNI o nro de teléfono..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-purple-100 font-questrial text-xs bg-white/50 focus:outline-none focus:border-purple-400 transition text-gray-700"
                        />
                    </div>

                </div>

                {/* TABLA DE ALUMNOS */}
                <DataTable
                    data={users}
                    columns={columns}
                    meta={meta}
                    isLoading={isPending}
                    onPageChange={handlePageChange}
                    onLimitChange={handleLimitChange} // 👈 Pasamos el manejador del límite
                    rowKey={(transaction) => transaction.id}
                    emptyMessage="No se encontraron usuarios registradas."
                />
            </div>
        </>)
}