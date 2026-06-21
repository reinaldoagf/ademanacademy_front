import { User } from "@/types/user";
import { Student } from "@/types/student";

export interface Transaction {
    id: string;
    concept: "Mensualidad" | "Matrícula" | "Uniforme" | "Entradas Gala";
    method: "Transferencia" | "Tarjeta" | "Efectivo" | "Pago Móvil";
    status: "Aprobado" | "Pendiente";
    amount: number;
    userId?: string;
    user?: User;
    studentId?: string;
    student?: Student;
    createdAt: string;
    updatedAt: string;
}

export interface FetchTransactionsParams {
    page?: number;
    limit?: number;
    search?: string;
    concept?: string;
    userId?: string;
}