

// Enums y Tipos
export type PayableStatus = "pending" | "partial" | "paid" | "cancelled";
export interface PayablePayment {
    id: string;
    amount: number;
    paymentDate: string;
    method: PaymentMethod;
    referenceNumber?: string;
    receiptUrl?: string;
    notes?: string;
}

export interface AccountPayable {
    id: string;
    supplierName: string;
    supplierDni?: string;
    invoiceNumber?: string;
    concept: string;
    amountTotal: number;
    amountPaid: number;
    amountRemaining: number;
    dueDate: string;
    status: PayableStatus;
    notes?: string;
    payments?: PayablePayment[];
}

// Enums del sistema

export type PaymentMethod =
    | "cash"
    | "bank_transfer"
    | "credit_or_debit_card"
    | "mobile_payment"
    | "check"
    | "other";

// Entidad Historial de Pago / Abono
export interface PayablePayment {
    id: string;
    accountPayableId: string;
    amount: number;
    paymentDate: string;
    method: PaymentMethod;
    referenceNumber?: string;
    receiptUrl?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

// Entidad Principal: Cuenta por Pagar
export interface AccountPayable {
    id: string;
    supplierName: string;
    supplierDni?: string;
    invoiceNumber?: string;
    concept: string;
    amountTotal: number;
    amountPaid: number;
    amountRemaining: number;
    dueDate: string;
    status: PayableStatus;
    notes?: string;
    payments?: PayablePayment[];
    createdAt?: string;
    updatedAt?: string;
}

// DTO para Crear / Actualizar una Cuenta por Pagar
export interface CreateAccountPayableDto {
    supplierName: string;
    supplierDni?: string;
    invoiceNumber?: string;
    concept: string;
    amountTotal: number;
    dueDate: string;
    notes?: string;
}

// DTO para Registrar un Pago / Abono
export interface CreatePayablePaymentDto {
    amount: number;
    method: PaymentMethod;
    referenceNumber?: string;
    notes?: string;
}

// Parámetros de consulta para Filtros y Paginación
export interface FetchAccountPayablesParams {
    search?: string;
    status?: PayableStatus | "all";
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
}

export interface PayableFormData {
    supplierName: string;
    supplierDni: string;
    invoiceNumber: string;
    concept: string;
    amountTotal: string;
    dueDate: string;
    notes: string;
}