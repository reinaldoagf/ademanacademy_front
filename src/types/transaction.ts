import { User } from "@/types/user";
import { Client } from "@/types/client";

export interface Transaction {
    id: string;
    concept: "monthly_payment" | "tuition" | "locker_room" | "ticket" | "product";
    method: "bank_transfer" | "credit_or_debit_card" | "cash" | "mobile_payment" | "check" | "other";
    status: "approved" | "pending" | "refused";
    bankName: string;
    referenceNumber: string;
    amount: number;
    receiptPath?: string;
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