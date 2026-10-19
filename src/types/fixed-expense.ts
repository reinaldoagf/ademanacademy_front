// /front/src/types/fixed-expense.ts
export type ExpenseFrequency = "Semanal" | "Quincenal" | "Mensual" | "Anual";

export interface FixedExpense {
    id: string;
    title: string;
    description?: string;
    amount: number;
    frequency: ExpenseFrequency;
    nextDueDate: string; // Fecha en formato ISO string (YYYY-MM-DD)
    isActive?: boolean;
    supplierId?: string;
    supplier?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

export interface FetchFixedExpensesParams {
    search?: string;
    page?: number;
    limit?: number;
    supplierId?: string;
    status?: string;
}

export interface FixedExpenseFormData {
    title: string;
    description: string;
    amount: number;
    frequency: ExpenseFrequency;
    nextDueDate: string;
    isActive?: boolean;
    supplierId: string;
}