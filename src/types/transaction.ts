import { User } from "@/types/user";
import { Client } from "@/types/client";
import { PaymentOrder } from "@/types/payment-order";
export interface Transaction {
    id: string;
    concept: "monthly_payment" | "tuition" | "locker_room" | "ticket" | "product";
    method: "bank_transfer" | "credit_or_debit_card" | "cash" | "mobile_payment" | "check" | "other";
    status: "approved" | "pending" | "refused";
    bankName: string;
    referenceNumber: string;
    amount: number;
    receiptPath?: string;
    registeringUserId?: string;
    registeringUser?: User;
    clientId?: string;
    client?: Client;
    paymentOrderId?: string;
    paymentOrder?: PaymentOrder;
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