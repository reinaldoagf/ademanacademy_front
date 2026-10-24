'use client';

import { getAuthHeaders } from '@/helpers/auth-headers';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from "axios";

export interface NotificationItem {
    id: string;
    title: string;
    message: string;
    status: string;
    createdAt: string;
    link?: string;
}

const BACKEND_URL = process.env.NEST_BACKEND_URL || "http://localhost:3000";
export function useNotifications(userId?: string) {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    // 1. Cargar las 8 notificaciones más recientes no leídas al montar el componente
    useEffect(() => {
        if (!userId) return;

        async function fetchInitialNotifications() {
            try {
                // 🌟 Petición con Axios al endpoint del backend enviando el userId
                const response = await axios.get(`${BACKEND_URL}/notifications/recent/`, {
                    withCredentials: true, // Importante si manejas cookies de sesión en el backend
                });

                if (response.data && Array.isArray(response.data)) {
                    setNotifications(response.data);
                    // Contamos únicamente las que estén pendientes
                    const unread = response.data.filter((n: NotificationItem) => n.status === 'Pendiente').length;
                    setUnreadCount(unread);
                }
            } catch (error) {
                console.error('Error cargando notificaciones recientes:', error);
            }
        }

        fetchInitialNotifications();
    }, [userId]);
    // 2. Escuchar WebSockets en tiempo real
    useEffect(() => {
        if (!userId) return;
        // 🎵 Instanciamos el objeto de audio apuntando a la carpeta public
        const notificationAudio = new Audio('/sounds/notification.mp3');

        const playSound = () => {
            notificationAudio.currentTime = 0; // Reinicia el audio si llega otro seguido
            notificationAudio.play().catch((error) => {
                console.warn('El navegador bloqueó la reproducción automática de audio:', error);
            });
        };
        const socket: Socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000/notifications', {
            query: { userId },
        });

        socket.on('notification', (newNotif: NotificationItem) => {
            playSound();
            setNotifications((prev) => [newNotif, ...prev]);
            setUnreadCount((prev) => prev + 1);
        });

        socket.on('admin_notification', (newNotif: NotificationItem) => {
            playSound();
            setNotifications((prev) => [newNotif, ...prev]);
            setUnreadCount((prev) => prev + 1);
        });

        return () => {
            socket.disconnect();
        };
    }, [userId]);
    // 3. Función para marcar una notificación como leída en la BDD con Axios
    const markAsRead = async (notificationId: string) => {
        try {
            await axios.patch(`${BACKEND_URL}/notifications/${notificationId}/read`, {}, {
                withCredentials: true,
            });

            setNotifications((prev) =>
                prev.map((n) => (n.id === notificationId ? { ...n, status: 'Leido' } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error al marcar notificación como leída:', error);
        }
    };

    // 4. Función para marcar todas como leídas en la BDD con Axios
    const markAllAsRead = async () => {
        try {
            if (!userId) return;
            await axios.patch(`${BACKEND_URL}/notifications/read-all/`, {}, {
                withCredentials: true,
            });

            setNotifications((prev) => prev.map((n) => ({ ...n, status: 'Leido' })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error al marcar todas como leídas:', error);
        }
    };
    return { notifications, unreadCount, markAsRead, markAllAsRead, setNotifications };
}