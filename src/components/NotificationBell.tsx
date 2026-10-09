'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Sparkles, Check } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationBellProps {
    userId?: string;
    onOpenUserMenuClose?: () => void; // Para cerrar otros dropdowns abiertos
}

export function NotificationBell({ userId, onOpenUserMenuClose }: NotificationBellProps) {
    const [isOpen, setIsOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    // Hook de tiempo real con WebSockets
    const { notifications, unreadCount, setUnreadCount, setNotifications } = useNotifications(userId);

    const hasUnread = unreadCount > 0;

    // Cerrar el popover al hacer clic fuera del componente
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

    // Marcar todas como leídas
    const markAllAsRead = () => {
        setUnreadCount(0);
        setNotifications((prev) =>
            prev.map((n) => ({ ...n, status: 'READ' }))
        );
    };

    return (
        <div className="relative" ref={notifRef}>
            {/* Botón de la Campana con Tooltip */}
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

            {/* Menú Desplegable de Notificaciones */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 md:w-80 bg-white border border-purple-100 shadow-xl rounded-none py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Header del Menú */}
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

                    {/* Lista de Notificaciones */}
                    <div className="max-h-64 overflow-y-auto divide-y divide-purple-50">
                        {notifications.length > 0 ? (
                            notifications.map((notif) => {
                                const isRead = notif.status === 'READ';
                                return (
                                    <div
                                        key={notif.id}
                                        className={`p-3 text-left transition-colors ${isRead ? 'bg-white' : 'bg-purple-50/40 font-medium'
                                            }`}
                                    >
                                        <p className="text-xs text-gray-700 font-questrial leading-normal">
                                            <strong className="block font-bold text-gray-800">{notif.title}</strong>
                                            {notif.message}
                                        </p>
                                        <span className="text-[9px] text-gray-400 font-questrial block mt-1">
                                            {new Date(notif.createdAt).toLocaleTimeString('es-ES', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-6 text-center text-xs text-gray-400 font-questrial">
                                No tienes notificaciones nuevas
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}