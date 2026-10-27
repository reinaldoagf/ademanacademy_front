// src/components/NotificationBell.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Sparkles, Check, Link as LinkIcon, CheckCheck } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from "next/link";
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationBellProps {
    userId?: string;
    onOpenUserMenuClose?: () => void;
}

export function NotificationBell({ userId, onOpenUserMenuClose }: NotificationBellProps) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    // Consumimos el hook con las funciones reales de BDD
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(userId);

    const hasUnread = unreadCount > 0;
    const getDashboardBaseRoute = () => {
        if (pathname.startsWith('/admin')) return '/admin';
        if (pathname.startsWith('/client')) return '/client';
        if (pathname.startsWith('/employee')) return '/employee';
        return '';
    };

    const baseRoute = getDashboardBaseRoute();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={notifRef}>
            <div className="group relative flex justify-center">
                <button
                    onClick={() => {
                        setIsOpen(!isOpen);
                        if (onOpenUserMenuClose) onOpenUserMenuClose();
                    }}
                    className="w-9 h-9 bg-purple-50 flex items-center justify-center text-purple-600 relative hover:bg-purple-100 transition-colors cursor-pointer"
                >
                    <Bell className="w-4 h-4" />
                    {hasUnread && (
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
                    )}
                </button>
                <span className="absolute top-full mt-2 hidden group-hover:block w-auto rounded bg-gray-800 px-2.5 py-1.5 text-[10px] font-questrial text-white shadow-lg whitespace-nowrap z-50">
                    Ver notificaciones
                </span>
            </div>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 md:w-80 bg-white border border-purple-100 shadow-xl rounded-none py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-3 border-b border-purple-50 flex items-center justify-between">
                        <span className="text-xs font-anton text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-purple-500" /> Notificaciones
                        </span>
                        {hasUnread && (
                            <button
                                onClick={markAllAsRead}
                                className="text-[10px] text-purple-600 hover:text-purple-800 font-questrial font-bold flex items-center gap-0.5 cursor-pointer"
                            >
                                <Check className="w-3 h-3" /> Marcar leídas
                            </button>
                        )}
                    </div>

                    <div className="max-h-64 overflow-y-auto divide-y divide-purple-50">
                        {notifications.length > 0 ? (
                            notifications.map((notification) => {
                                const isRead = notification.status === 'Leido';
                                return (
                                    <div
                                        key={notification.id}
                                        className={`p-3 text-left transition-colors flex justify-between items-start gap-2 ${isRead ? 'bg-white opacity-70' : 'bg-purple-50/40 font-medium'
                                            }`}
                                    >
                                        <div className="text-xs text-gray-700 font-questrial leading-normal space-y-1 flex-1">
                                            <strong className="block font-bold text-gray-800">{notification.title}</strong>
                                            <p className="text-gray-600">{notification.message}</p>

                                            {notification.link && (
                                                <div className="pt-1">
                                                    <Link
                                                        href={notification.link}
                                                        onClick={() => setIsOpen(false)}
                                                        className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 font-questrial font-bold text-[11px]"
                                                    >
                                                        <LinkIcon className="w-3 h-3" /> Ver detalles
                                                    </Link>
                                                </div>
                                            )}

                                            <span className="text-[9px] text-gray-400 font-questrial block mt-1">
                                                {new Date(notification.createdAt).toLocaleTimeString('es-ES', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </div>

                                        {/* Botón Individual para Marcar como Leído */}
                                        {!isRead && (
                                            <button
                                                onClick={() => markAsRead(notification.id)}
                                                title="Marcar como leído"
                                                className="text-purple-400 hover:text-purple-700 p-1 transition-colors cursor-pointer shrink-0"
                                            >
                                                <CheckCheck className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-6 text-center text-xs text-gray-400 font-questrial">
                                No tienes notificaciones nuevas
                            </div>
                        )}
                    </div>

                    <div className="p-2.5 border-t border-purple-50 text-center bg-purple-50/20">
                        <Link
                            href={`${baseRoute}/notifications`}
                            onClick={() => setIsOpen(false)}
                            className="text-xs font-bold text-purple-700 hover:text-purple-900 font-questrial uppercase tracking-wider block transition-colors"
                        >
                            Ver todas las notificaciones →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}