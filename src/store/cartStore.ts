import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Tipos basados en tu esquema Prisma
export type OrderItemConceptType =
    | "uniform"
    | "costume"
    | "ticket"
    | "merchandise"
    | "other"; // Ajusta a los valores de tu Enum en Prisma

export interface CartStudent {
    id: string;
    firstName: string;
    lastName: string;
}

export interface CartItem {
    tempId: string; // ID temporal para identificar el ítem en el estado local
    concept: OrderItemConceptType;
    conceptLabel?: string; // Nombre amigable para mostrar en UI (ej: "Vestuario de Gala")
    price: number;
    quantity: number;
    studentId?: string;
    student?: CartStudent;
}

interface CartState {
    items: CartItem[];
    userId: string | null;
    isOpen: boolean;

    // Acciones de la barra lateral
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;

    // Acciones del carrito
    setUserId: (userId: string | null) => void;
    addItem: (item: Omit<CartItem, "tempId">) => void;
    removeItem: (tempId: string) => void;
    updateQuantity: (tempId: string, quantity: number) => void;
    updateStudent: (tempId: string, student?: CartStudent) => void;
    clearCart: () => void;

    // Calculados / Selectores
    getTotalAmount: () => number;
    getTotalItemsCount: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            userId: null,
            isOpen: false,

            // Control del Drawer
            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),
            toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

            // Asignar el usuario dueño de la orden
            setUserId: (userId) => set({ userId }),

            // Agregar ítem al carrito
            addItem: (newItem) => {
                const { items } = get();

                // Buscar si existe un ítem idéntico (mismo concepto, precio y estudiante)
                const existingIndex = items.findIndex(
                    (i) =>
                        i.concept === newItem.concept &&
                        i.price === newItem.price &&
                        i.studentId === newItem.studentId
                );

                if (existingIndex > -1) {
                    const updatedItems = [...items];
                    updatedItems[existingIndex].quantity += newItem.quantity;
                    set({ items: updatedItems });
                } else {
                    set({
                        items: [
                            ...items,
                            {
                                ...newItem,
                                tempId: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                            },
                        ],
                    });
                }
            },

            // Eliminar un ítem por su tempId
            removeItem: (tempId) => {
                set({
                    items: get().items.filter((item) => item.tempId !== tempId),
                });
            },

            // Actualizar cantidad
            updateQuantity: (tempId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(tempId);
                    return;
                }

                set({
                    items: get().items.map((item) =>
                        item.tempId === tempId ? { ...item, quantity } : item
                    ),
                });
            },

            // Asignar o remover estudiante a un ítem
            updateStudent: (tempId, student) => {
                set({
                    items: get().items.map((item) =>
                        item.tempId === tempId
                            ? {
                                ...item,
                                studentId: student?.id,
                                student,
                            }
                            : item
                    ),
                });
            },

            // Vaciar carrito
            clearCart: () => set({ items: [] }),

            // Cálculo del monto total
            getTotalAmount: () => {
                return get().items.reduce(
                    (acc, item) => acc + item.price * item.quantity,
                    0
                );
            },

            // Conteo total de artículos
            getTotalItemsCount: () => {
                return get().items.reduce((acc, item) => acc + item.quantity, 0);
            },
        }),
        {
            name: "ademan-cart-storage",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ items: state.items, userId: state.userId }),
        }
    )
);