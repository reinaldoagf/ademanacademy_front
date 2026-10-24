import { Student } from "@/types/student";
import {
    LucideIcon
} from "lucide-react";
import { S3Image } from "./s3-image";
import { Client } from "./client";

// 🎯 Enums del ciclo de vida de la asignación
export type AssignmentStatus = "Asignado" | "Listo_Para_Entregar" | "Devuelto_En_Buen_Estado" | "Devuelto_Con_Daños" | "Extraviado";

export type CostumeCategory = "Bebé" | "Infantil" | "Juvenil" | "Adulto";

export type CostumeStatus = "Pendiente_por_Pago" | "Confeccionando" | "Disponible" | "Retirado";

export interface SizeStock {
    size: string;
    quantity: number;
}

// 🤝 Interfaz para la relación intermedia de asignaciones
export interface StudentCostume {
    id: string;
    clientId: string;
    studentId: string;
    costumeId: string;
    assignedSize: string;
    status: AssignmentStatus;
    observations: string | null;
    assignedAt: string | Date;
    returnDate: string | Date | null;
    returnedAt: string | Date | null;
    createdAt: string | Date;
    updatedAt: string | Date;
    client?: Client; // Incluido cuando haces el fetch con relaciones
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
    costumeAssignments?: StudentCostume[]; // Historial o alumnos asignados actualmente
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


export interface ElementToBeAssigned {
    studentId: string;
    fullName: string;
    email: string;
    observations?: string;
    returnDate?: Date | null;
    issuePaymentOrder: boolean;
}