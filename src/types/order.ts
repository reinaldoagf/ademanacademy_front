import { CartItem } from "@/store/cartStore";
import { User } from "./user";
// Tipos para la petición que va hacia el backend
export interface CleanOrderItem {
    concept: string;      // Enum o valor en mayúsculas según backend (ej: "UNIFORM", "MERCHANDISE")
    price: number;        // Número decimal válido
    quantity: number;     // Entero positivo
    studentId?: string;   // Opcional: solo se incluye si existe
}

export interface OrderPayload {
    userId: string;
    status?: string;
    items: CleanOrderItem[];
}
export interface OrderFormData {
    status?: string;
    userId: string;
    items?: CartItem[];
}
export interface FetchOrdersParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
}

export interface Order {
    id: string;
    userId: string;
    user: User;
    totalAmount: number;
    status: "pending_preparation" | "ready_for_delivery" | "delivered" | "canceled";
    createdAt: string,
    updatedAt: string,
}

// Tipos requeridos según el schema y backend
export type OrderStatus = "pending_preparation" | "processing" | "completed" | "cancelled";
export type ConceptType = "VESTUARIO" | "ENTRADAS" | string;

export interface FormOrderItem {
    concept: ConceptType;
    quantity: number;
    price: number;
    studentId?: string;
    studentSearch?: string;
}

// Tipo auxiliar para sugerencias de estudiantes
export interface StudentOption {
    id: string;
    firstName: string;
    lastName: string;
    dni?: string;
}
export interface OrderItem {
    id: string;
    orderId: string;
    studentId?: string | null;
    concept: string;
    quantity: number;
    description?: string | null;
    price: string | number;
    student?: {
        id: string;
        firstName?: string;
        lastName?: string;
        name?: string;
    } | null;
}
export interface OrderDetails {
    id: string;
    userId: string;
    totalAmount: string | number;
    status: string;
    createdAt: string;
    updatedAt: string;
    user?: {
        id: string;
        dni?: string;
        name?: string;
        email?: string;
        phone?: string;
    } | null;
    items?: OrderItem[];
    paymentOrder?: {
        id: string;
        concept: string;
        amount: string | number;
        status: string;
        createdAt: string;
    } | null;
}