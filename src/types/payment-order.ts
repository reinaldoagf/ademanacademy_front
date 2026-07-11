import { User } from "@/types/user";
import { Student } from "@/types/student";
export interface PaymentOrder {
    id: string;
    concept: "monthly_payment" | "tuition" | "locker_room" | "ticket";
    amount: number;
    dueDate: string;
    status: "pending" | "approved" | "refused";
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