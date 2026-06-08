import { User } from "@/types/user";
export interface Student {
    id: string;
    dni: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    kinship: "son" | "daughter" | "nephew" | "niece" | "tutored" | "other" | undefined;
    shirtSize: string;
    group: string;
    phone: string;
    address: string;
    hasExperience: boolean;
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