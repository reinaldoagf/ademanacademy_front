'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export interface NotificationItem {
    id: string;
    title: string;
    message: string;
    status: string;
    createdAt: string;
}

export function useNotifications(userId?: string) {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);

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

    return { notifications, unreadCount, setNotifications, setUnreadCount };
}