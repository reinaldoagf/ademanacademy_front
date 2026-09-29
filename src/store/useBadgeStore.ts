import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const BACKEND_URL = process.env.NEXT_PUBLIC_NEST_BACKEND_URL || "http://localhost:3000";

interface BadgeState {
    badges: Record<string, number>;
    setBadge: (key: string, count: number) => void;
    fetchBadges: () => Promise<void>;
}

export const useBadgeStore = create<BadgeState>()(
    persist(
        (set) => ({
            badges: {},
            setBadge: (key, count) =>
                set((state) => ({
                    badges: { ...state.badges, [key]: count },
                })),
            fetchBadges: async () => {
                try {
                    const res = await fetch(`${BACKEND_URL}/badges/summary`, {
                        method: "GET",
                        // 🎯 ESTA ES LA CLAVE: Envía las cookies HttpOnly automáticamente al backend
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });

                    if (!res.ok) {
                        if (res.status === 401) {
                            console.warn("Usuario no autenticado para obtener badges.");
                            return;
                        }
                        throw new Error(`Error ${res.status}: No se pudieron obtener los badges`);
                    }

                    const data = await res.json();

                    set({ badges: data });
                } catch (error) {
                    console.error("Error al cargar los badges en Zustand:", error);
                }
            },
        }),
        {
            name: 'sidebar-badges-storage',
        }
    )
);