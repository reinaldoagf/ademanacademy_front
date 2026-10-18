
import { Student } from "@/types/student";
import { Client } from "./client";
export interface User {
    id: string;
    dni: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password?: string;
    isAdmin: boolean;
    profileType: "Representante" | "Estudiante";
    students?: Student[]
    client: Client;
    profileOnboarding: boolean;
    clients?: Client[];
    createdAt?: string;
    updatedAt?: string;
}
export interface FetchUsersParams {
    page?: number;
    limit?: number;
    search?: string;
}