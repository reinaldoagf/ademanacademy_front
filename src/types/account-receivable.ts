// /src/types/account-receivable.ts

export type PaymentOrderStatus = "Pendiente" | "Pagada" | "Vencida" | "Anulada";

export type TransactionStatus = "Aprobado" | "Pendiente" | "Rechazado";

export type ConceptType = "Clase" | "Mensualidad" | "Inscripción" | "Vestuario" | "Entradas_Gala" | "Producto" | "Otro";

export type PaymentMethod =
    | "Transferencia"
    | "Tarjeta"
    | "Efectivo"
    | "Pago_Movil"
    | "Cheque"
    | "Otro";

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