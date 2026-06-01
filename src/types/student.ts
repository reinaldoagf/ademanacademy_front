import { User } from "@/types/user";
export interface Student {
    id: string;
    dni: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    kinship: "Hijo" | "Hija" | "Sobrino" | "Sobrina" | "Tutorado" | "Otro" | undefined;
    medicalObservations?: string;
    userId?: string;
    user?: User;
}

export interface FetchStudentsParams {
    page?: number;
    limit?: number;
    search?: string;
    kinship?: string;
}