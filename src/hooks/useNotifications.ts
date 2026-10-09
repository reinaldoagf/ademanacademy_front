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
        const socket: Socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000/notifications', {
            query: { userId },
        });

        socket.on('notification', (newNotif: NotificationItem) => {
            setNotifications((prev) => [newNotif, ...prev]);
            setUnreadCount((prev) => prev + 1);
        });

        socket.on('admin_notification', (newNotif: NotificationItem) => {
            setNotifications((prev) => [newNotif, ...prev]);
            setUnreadCount((prev) => prev + 1);
        });

        return () => {
            socket.disconnect();
        };
    }, [userId]);

    return { notifications, unreadCount, setNotifications, setUnreadCount };
}