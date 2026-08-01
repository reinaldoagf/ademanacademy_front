import { User } from "@/types/user";
import { Group } from "@/types/group";

export interface Student {
    id: string;
    dni: string;
    firstName: string;
    lastName: string;
    birthDate: Date | string | null,
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

export interface RepresentedFormData {
    dni: string,
    firstName: string,
    lastName: string,
    birthDate: Date | string | null,
    kinship: Student["kinship"],
    phone: string,
    address: string,
    shirtSize: string,
    hasExperience: boolean,
    medicalObservations: string,
}

export interface FetchStudentsParams {
    page?: number;
    limit?: number;
    search?: string;
    kinship?: string;
}