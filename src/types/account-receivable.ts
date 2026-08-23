// /src/types/account-receivable.ts

export type PaymentOrderStatus = "pending" | "paid" | "defeated" | "annulled";

export type TransactionStatus = "approved" | "pending" | "refused";

export type ConceptType =
    | "monthly_payment"
    | "tuition"
    | "locker_room"
    | "ticket";

export type PaymentMethod =
    | "cash"
    | "mobile_payment"
    | "bank_transfer"
    | "pos"
    | "zelle"
    | "other";

// Interface para el listado de transacciones / abonos
export interface ReceivableTransaction {
    id: string;
    paymentOrderId: string;
    userId: string;
    studentId?: string | null;
    concept: ConceptType;
    amount: number;
    method: PaymentMethod;
    status: TransactionStatus;
    referenceNumber?: string | null;
    bankName?: string | null;
    receiptPath?: string | null;
    createdAt: string;
    updatedAt: string;
}

// Interface principal para la Orden de Pago (Cuenta por Cobrar)
export interface AccountReceivable {
    id: string;
    userId: string;
    user?: {
        id: string;
        name: string;
        email: string;
    };
    studentId?: string | null;
    student?: {
        id: string;
        firstName: string;
        lastName: string;
    } | null;
    orderId?: string | null;
    concept: ConceptType;
    amount: number;
    amountPaid: number;
    amountRemaining: number;
    dueDate?: string | null;
    status: PaymentOrderStatus;
    createdAt: string;
    updatedAt: string;
    transactions?: ReceivableTransaction[];
}

// DTO para Crear una nueva Cuenta por Cobrar (PaymentOrder)
export interface CreateAccountReceivableDto {
    userId: string;
    studentId?: string | null;
    concept: ConceptType;
    amount: number;
    dueDate?: string;
}

// DTO para Registrar un Abono / Pago (Transaction)
export interface CreateReceivablePaymentDto {
    amount: number;
    method: PaymentMethod;
    referenceNumber?: string;
    bankName?: string;
    receiptPath?: string;
    userId: string;
    studentId?: string | null;
}

// Filtros para la búsqueda
export interface FetchAccountReceivablesParams {
    search?: string;
    status?: PaymentOrderStatus | "all";
    concept?: ConceptType | "all";
    page?: number;
    limit?: number;
}