
import { Student } from "@/types/student";
export interface User {
    id: string;
    dni: string;
    name: string;
    email: string;
    phone: string;
    password?: string;
    isAdmin: boolean;
    students: Student[]
    createdAt: string;
    updatedAt: string;
}
export interface FetchUsersParams {
    page?: number;
    limit?: number;
    search?: string;
}