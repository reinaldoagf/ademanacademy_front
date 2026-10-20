// src/app/(dashboard)/notifications/page.tsx
"use client";

import React, { useTransition, useEffect, useState } from "react";
import {
    House,
    User as UserIcon,
    Search,
    LinkIcon,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import Link from "next/link";
import HeroSection from "@/components/layout/HeroSection";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { getAllNotificationsAction } from "@/app/actions/notification";
import { Notification } from "@/types/notification";


export default function NotificationsPage() {
    const pathname = usePathname();
    const user = useAuthStore((state) => state.user);
    const isAdmin = pathname.startsWith('/admin') && user?.isAdmin
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);
    const [isPending, startTransition] = useTransition();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [meta, setMeta] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 6,
        itemCount: 6,
    });
    useEffect(() => {
        async function fetchNotificationsData(pageToFetch: number, limitToFetch: number) {

            startTransition(async () => {
                try {
                    const res = await getAllNotificationsAction({
                        page: pageToFetch,
                        limit: limitToFetch, // 🎯 Enviamos el límite dinámico
                        search: searchTerm || undefined,
                        ownerFilter: false
                    });
                    if (res.success && res.data) {
                        setNotifications(res.data);
                        setMeta(res.meta); // NestJS ya devuelve el "itemsPerPage" en su meta
                    }
                } catch (error) {
                    console.error('Error al actualizar métricas de balance:', error);
                }
            });
        }
        const handler = setTimeout(() => {
            fetchNotificationsData(currentPage, itemsPerPage);
        }, 300);

        return () => clearTimeout(handler);
    }, [searchTerm, currentPage, itemsPerPage]);
    return (
        <>
            <HeroSection
                htmlTitle={`Notificaciones del <em class="text-[#5e0472]">Sistema</em>`}
                htmlSubTitle={`Gestiona y revisa las notificaciones enviadas a los estudiantes y profesores.`}
                actions={[]}
            />
            <div className="p-4 md:p-8 w-full space-y-6">
                {/* FILTROS POR CATEGORÍA DE SALÓN */}
                <div className="glass-card p-4 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
                    {/* Buscador e Infraestructura */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-center justify-end">
                        <div className="relative w-full sm:w-64">
                            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, descripción, y/o dirección..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-purple-100 font-questrial text-xs bg-white/50 focus:outline-none focus:border-purple-400 transition text-gray-700"
                            />
                        </div>
                    </div>
                </div>
                {notifications.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {notifications.map((notification: Notification) => (
                        <div
                            key={notification.id}
                            className="glass-card bg-white border border-purple-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-300 flex flex-col justify-between"
                        >
                            <div className="p-5 space-y-3">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-sm font-questrial font-bold text-gray-800 hover:text-[#5e0472] transition cursor-pointer">
                                        {notification.title}
                                    </h3>

                                    {
                                        notification.createdAt && (
                                            <div className="flex items-center gap-1 text-gray-400 text-[11px] font-questrial">
                                                {new Date(notification.createdAt).toLocaleString()}
                                            </div>
                                        )
                                    }
                                </div>
                                <div className="flex gap-2">


                                    {/* 🛠️ Corrección Semántica: Usamos div en lugar de p para contener enlaces */}
                                    <div className="text-xs text-gray-700 font-questrial leading-normal space-y-1">
                                        <p className="text-gray-600">{notification.message}</p>

                                        {notification.link && !isAdmin && (
                                            <div className="pt-1">
                                                <Link
                                                    href={notification.link}
                                                    className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 font-questrial font-bold text-[11px]"
                                                >
                                                    <LinkIcon className="w-3 h-3" /> Ver orden de pago
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                    {
                                        notification.user && (
                                            <div className="border-gray-300 flex items-center gap-2 p-1 transition-all">
                                                <div className="w-8 h-8 rounded-full bg-[#5e0472] flex items-center justify-center text-white text-xs font-anton tracking-wider shrink-0">

                                                    <UserIcon className="w-3.5 h-3.5 shrink-0" />
                                                </div>
                                                <div className="hidden md:flex flex-col text-left font-questrial">
                                                    <span className="text-xs font-bold text-gray-700 leading-tight">{notification.user.firstName} {notification.user.lastName}</span>
                                                    <span className="text-[10px] text-gray-400 max-w-[120px] truncate">{notification.user.email}</span>
                                                </div>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        </div>

                    ))}
                </div>) : (
                    <div className="text-center py-16 border border-dashed border-purple-100 bg-white">
                        <House className="w-10 h-10 text-purple-200 mx-auto mb-3" />
                        <p className="font-questrial text-xs text-gray-400">
                            {isPending ? "Sincronizando..." : "No se encuentran salones configurados bajo la modalidad seleccionada."}
                        </p>
                    </div>
                )}
                {/* Seccion de Paginación */}
                {meta.totalPages > 1 && (
                    <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-center gap-6 border border-purple-50/60 shadow-xs">
                        <div className="text-xs font-questrial text-gray-500">
                            Mostrando <span className="font-semibold text-gray-700">{notifications.length}</span> de{" "}
                            <span className="font-semibold text-gray-700">{meta.totalItems}</span> notificaciones
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Selector de Items por Página */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-questrial text-gray-400">Ver:</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1); // Volver a la 1 tras cambiar el límite
                                    }}
                                    className="p-1 border border-purple-100 font-questrial text-xs bg-white text-gray-700 focus:outline-none"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>

                            {/* Controles de Navegación */}
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={meta.currentPage === 1 || isPending}
                                    className="p-1.5 border border-purple-50 bg-white text-gray-600 hover:bg-purple-50 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer rounded-xs"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                <span className="text-xs font-questrial px-3 py-1 bg-[#5e0472]/5 text-[#5e0472] font-semibold">
                                    Pág. {meta.currentPage} de {meta.totalPages}
                                </span>

                                <button
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, meta.totalPages))}
                                    disabled={meta.currentPage === meta.totalPages || isPending}
                                    className="p-1.5 border border-purple-50 bg-white text-gray-600 hover:bg-purple-50 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer rounded-xs"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}