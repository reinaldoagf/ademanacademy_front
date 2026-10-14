import { User } from "@/types/user";
import { Group } from "@/types/group";
import { Client } from "./client";

export interface Student {
    id: string;
    dni: string;
    firstName: string;
    lastName: string;
    birthDate: string | Date;
    kinship: "Hijo" | "Hija" | "Sobrino" | "Sobrina" | "Tutorado" | "Otro" | undefined;
    shirtSize: string;
    groupId?: string;
    group?: Group;
    phone: string;
    address: string;
    hasExperience: boolean;
    medicalObservations?: string;
    userId?: string;
    user?: User;
    clients: Client[];
}

export interface RepresentedFormData {
    IDNumberPrefix: string;
    dni: string;
    email: string;
    firstName: string;
    lastName: string;
    birthDate: Date | string | null;
    representativeId: string | null;
    kinship: Student["kinship"];
    countryCode: string;
    phone: string;
    address: string;
    shirtSize: string;
    hasExperience: boolean;
    medicalObservations: string;
}

export interface FetchStudentsParams {
    page?: number;
    limit?: number;
    search?: string;
    kinship?: string;
}