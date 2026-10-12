import { Group } from "./group";
import { Student } from "./student";
import { User } from "./user";

export interface Client {
    id: string;
    IDNumberPrefix: string;
    dni: string;
    firstName: string;
    lastName: string;
    email: string;
    birthDate: string | Date;
    address: string;
    countryCode: string;
    phone: string;
    type?: "Estudiante" | "Representante";
    studentId?: string;
    student?: Student;
    userId?: string | null;
    user?: User | null;
    representativeId?: string | null;
    representative?: User | null;
    groupId?: string;
    group?: Group;
    createdAt?: string;
    updatedAt?: string;
}

export interface FetchClientsParams {
    page?: number;
    limit?: number;
    search?: string;
}

export interface CustomerFormData {
    firstName: string;
    lastName: string;
    IDNumberPrefix: string;
    dni: string;
    email: string;
    countryCode: string;
    phone: string;
    address: string;
    birthDate: string | Date;
    userId?: string | null; // ID opcional para vincular con un Usuario registrado
    representativeId?: string | null;
    type: "Estudiante" | "Representante";
    kinship: Student["kinship"];
    shirtSize: string;
    hasExperience: boolean;
    medicalObservations: string;
} 