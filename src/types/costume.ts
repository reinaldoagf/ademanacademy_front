import { Student } from "@/types/student";
import {
    LucideIcon
} from "lucide-react";

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
    category: CostumeCategory;
    availableSizes: SizeStock[];
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

// 🎯 Definimos una interfaz limpia para los datos serializables
export interface SaveCostumePayload {
    name: string;
    beat?: string;
    category: string;
    status: string;
    availableSizes: any[];
    images: { name: string; type: string; base64: string }[]; // 🚀 'type' agregado aquí
    existingImages: string[]; // 🚀 'type' agregado aquí
}

export interface StatusCardConfig {
    title: string;
    subtitle: string;
    icon: LucideIcon;
    iconBgClass: string;
    iconTextClass: string;
    unitLabel: string;
}
export type LockerRoomStatus = "pending_preparation" | "available" | "maintenance" | "retired";