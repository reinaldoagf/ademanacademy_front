import { User } from "@/types/user";
import { Student } from "@/types/student";
export interface PaymentOrder {
    id: string;
    concept: "mensualidad" | "matricula" | "uniforme" | "entradas_gala";
    amount: number;
    dueDate: string;
    status: "pendiente" | "pagada" | "vencida" | "anulada";
    user: User;
    student?: Student;
    createdAt: string,
    updatedAt: string,
}
export interface FetchPaymentOrdersParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    concept?: string;
}