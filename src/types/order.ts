import { User } from "./user";

export interface OrderFormData {
    status: string;
    userId: string;
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