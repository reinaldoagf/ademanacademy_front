import { User } from "@/types/user";
import { Client } from "@/types/client";

export interface Transaction {
    id: string;
    concept: "Mensualidad" | "Matrícula" | "Uniforme" | "Entradas Gala";
    method: "Transferencia" | "Tarjeta" | "Efectivo" | "Pago Móvil";
    status: "approved" | "pending" | "refused";
    amount: number;
    userId?: string;
    user?: User;
    clientId?: string;
    client?: Client;
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