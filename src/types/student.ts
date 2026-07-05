import { User } from "@/types/user";
import { Group } from "@/types/group";
export interface Student {
    id: string;
    dni: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    kinship: "son" | "daughter" | "nephew" | "niece" | "tutored" | "other" | undefined;
    shirtSize: string;
    groupId?: string;
    group?: Group;
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