import { create } from 'zustand';

// Mapa simple de Key -> Conteo (ej: { 'users': 25, 'store_products': 10 })
type BadgeMap = Record<string, number>;

interface SidebarState {
    badges: BadgeMap;
    // Actualizar un solo badge de forma directa (sin peticiones HTTP)
    setBadge: (key: string, count: number) => void;
    // Actualizar múltiples badges de golpe
    setBadges: (newBadges: BadgeMap) => void;
    // Incrementar/Decrementar dinámicamente
    incrementBadge: (key: string, step?: number) => void;
    decrementBadge: (key: string, step?: number) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
    badges: {},

    setBadge: (key, count) =>
        set((state) => ({
            badges: { ...state.badges, [key]: Math.max(0, count) },
        })),

    setBadges: (newBadges) =>
        set((state) => ({
            badges: { ...state.badges, ...newBadges },
        })),

    incrementBadge: (key, step = 1) =>
        set((state) => ({
            badges: {
                ...state.badges,
                [key]: (state.badges[key] || 0) + step,
            },
        })),

    decrementBadge: (key, step = 1) =>
        set((state) => ({
            badges: {
                ...state.badges,
                [key]: Math.max(0, (state.badges[key] || 0) - step),
            },
        })),
}));