"use client";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { usePathname } from 'next/navigation';
import {
    Loader2,
    MonitorCheck
} from "lucide-react";
import { Notification } from '@/types/notification';
import { getAllNotificationsAction } from "@/app/actions/notification";

export function AutomaticNotifications() {
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [notifications, setNotifications] = useState<Notification[]>([]);// 🎯 1. Identificar el panel actual a partir de la URL
    const getDashboardBaseRoute = () => {
        if (pathname.startsWith('/admin')) return '/admin';
        if (pathname.startsWith('/client')) return '/client';
        if (pathname.startsWith('/collaborator')) return '/collaborator';
        return ''; // Ruta por defecto si está en otra sección
    };

    const baseRoute = getDashboardBaseRoute();
    useEffect(() => {
        async function fetchNotificationsData() {
            setIsLoading(true);
            try {
                const res = await getAllNotificationsAction({
                    page: 1,
                    limit: 3, // 🎯 Enviamos el límite dinámico
                    search: undefined,
                    ownerFilter: false
                });
                if (res.success && res.data) {
                    setNotifications(res.data);
                }
            } catch (error) {
                console.error('Error al actualizar métricas de balance:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchNotificationsData();
    }, []);
    return (
        <div className="glass-card p-6 shadow-sm">
            <h3 className="text-lg font-anton mb-4">Notificaciones Automáticas</h3>
            {isLoading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-xl">
                    <Loader2 className="w-5 h-5 animate-spin text-purple-700" />
                </div>
            )}
            <div className="space-y-3 divide-y divide-purple-50">
                {notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className="flex items-start justify-between gap-3 p-3 bg-white/40 border border-purple-100 text-xs shadow-xs"
                        >
                            <div className="flex items-start gap-3">
                                <div className="block space-y-2">
                                    {/* Icono representativo (WhatsApp o App) */}
                                    {
                                        (notification.channel === "Ambos" || notification.channel === "Whatsapp") && (
                                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397 0 11.948 0c3.174.001 6.161 1.24 8.401 3.487 2.24 2.246 3.475 5.236 3.47 8.411-.013 6.59-5.351 11.936-11.901 11.936-2.008-.001-3.98-.515-5.725-1.498L0 24zm6.49-3.376c1.592.943 3.517 1.442 5.45 1.443 5.375 0 9.757-4.417 9.768-9.842.005-2.628-1.017-5.097-2.877-6.963-1.859-1.864-4.331-2.89-6.96-2.891-5.401 0-9.785 4.417-9.796 9.844-.003 1.97.512 3.894 1.492 5.594l-.973 3.55 3.633-.961zm11.238-7.794c-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.197 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z" />
                                                </svg>
                                            </div>
                                        )
                                    }
                                    {
                                        (notification.channel === "Ambos" || notification.channel === "En_la_App") && (
                                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                                                <MonitorCheck className="w-4 h-4" />
                                            </div>
                                        )
                                    }
                                </div>

                                {/* Contenido de la notificación */}
                                <div className="space-y-1">
                                    <p className="font-questrial font-bold text-gray-800 text-sm">
                                        {notification.title}
                                    </p>
                                    <p className="font-questrial text-gray-600 leading-relaxed">
                                        {notification.message}
                                    </p>

                                    {/* Metadatos adicionales de la notificación */}
                                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[10px] text-gray-400 font-questrial">
                                        <div className="space-y-2">
                                            <div>
                                                <span>Canal: <strong className="text-gray-600">{notification.channel}</strong></span>
                                            </div>
                                            <div>{notification.recipientPhone && (<div>
                                                <span>Destino: <strong className="text-gray-600">{notification.recipientPhone}</strong></span>
                                            </div>)}
                                                {notification.user && (<div>
                                                    <span>Usuario: <strong className="text-gray-600">{notification.user.firstName} {notification.user.lastName} ({notification.user.email})</strong></span>
                                                </div>)}
                                            </div>
                                        </div>
                                        <div className="flex justify-end w-full">
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${notification.status === 'Leido' ? 'bg-emerald-100 text-emerald-700' :
                                                notification.status === 'Enviado' ? 'bg-blue-100 text-blue-700' :
                                                    notification.status === 'Fallido' ? 'bg-red-100 text-red-700' :
                                                        'bg-amber-100 text-amber-700'
                                                }`}>
                                                {notification.status}
                                            </span>

                                            <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700">
                                                {new Date(notification.createdAt).toLocaleDateString('es-ES', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 italic text-xs">No hay notificaciones automáticas registradas.</p>
                )}
            </div>
            <div className="p-2.5 mt-3 border-t border-purple-50 text-center bg-purple-50/20">
                <Link
                    href={`${baseRoute}/notifications`}
                    className="text-xs font-bold text-purple-700 hover:text-purple-900 font-questrial uppercase tracking-wider block transition-colors"
                >
                    Ver todas las notificaciones →
                </Link>
            </div>
        </div>
    )
}