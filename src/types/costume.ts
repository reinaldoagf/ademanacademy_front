import { Student } from "@/types/student";
import {
    LucideIcon
} from "lucide-react";
import { S3Image } from "./s3-image";

// 🎯 Enums del ciclo de vida de la asignación
export type AssignmentStatus = "assigned" | "returned" | "damaged" | "lost";

export type CostumeCategory = "baby" | "childrens" | "youth" | "adult";

export type CostumeStatus = "pending_preparation" | "available" | "maintenance" | "retired";

export interface SizeStock {
    size: string;
    quantity: number;
}

// 🤝 Interfaz para la relación intermedia de asignaciones
export interface StudentCostume {
    id: string;
    studentId: string;
    costumeId: string;
    assignedSize: string;
    status: AssignmentStatus;
    observations: string | null;
    assignedAt: string;
    returnedAt: string | null;
    createdAt: string;
    updatedAt: string;
    student?: Student; // Incluido cuando haces el fetch con relaciones
    costume?: Costume;
}

// 👗 Interfaz Principal del Vestuario
export interface Costume {
    id: string;
    name: string;
    beat: string | null;
    price: number;
    category: CostumeCategory;
    images: string[]; // Representación del campo Json ("[]") en la app
    status: CostumeStatus;
    assignments?: StudentCostume[]; // Historial o alumnos asignados actualmente
    createdAt?: string;
    updatedAt?: string;
}

// 🔍 Parámetros para filtros de búsqueda (Fetch)
export interface FetchCostumesParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
}
// Interfaz para el estado del formulario
export interface CostumeFormData {
    name: string;
    beat?: string;
    category: string;
    status: string;
    price: number;
    images: S3Image[];
    existingImages: S3Image[];
}
// 🎯 Definimos una interfaz limpia para los datos serializables
export interface SaveCostumePayload {
    name: string;
    beat?: string;
    category: string;
    status: string;
    price: number;
    images: S3Image[];
}

export interface StatusCardConfig {
    title: string;
    subtitle: string;
    icon: LucideIcon;
    iconBgClass: string;
    iconTextClass: string;
    unitLabel: string;
}
export type LockerRoomStatus = "payment_pending" | "making" | "available" | "retired";

export interface ElementToBeAssigned {
    studentId: string;
    fullName: string;
    email: string;
    observations?: string;
}