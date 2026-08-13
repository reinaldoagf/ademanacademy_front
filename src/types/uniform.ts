// /types/uniform.ts
import {
    LucideIcon
} from "lucide-react";
// Enums del esquema (puedes importarlos de @prisma/client si los usas en Node.js,
// o mantenerlos aquí si es para el Frontend)
export type UniformCategory = 'baby' | string; // Ajusta con tus valores del Enum real
export type UniformStatus = 'payment_pending' | string; // Ajusta con tus valores del Enum real
export type AssignmentStatus = 'assigned' | 'returned' | 'damaged' | 'lost' | string;

// Interface para el modelo StudentUniform
export interface StudentUniform {
    id: string;
    studentId: string;
    student?: any; // Reemplaza 'any' por tu interfaz 'Student' si la tienes
    uniformId: string;
    uniform?: Uniform;
    assignedSize: string;
    status: AssignmentStatus;
    observations?: string | null;
    assignedAt: Date | string;
    returnedAt?: Date | string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
    costumeId?: string | null;
}

export interface StatusCardConfig {
    title: string;
    subtitle: string;
    icon: LucideIcon;
    iconBgClass: string;
    iconTextClass: string;
    unitLabel: string;
}

// Interface principal para el modelo Uniform
export interface Uniform {
    id: string;
    name: string;
    category: UniformCategory;
    status: UniformStatus;
    price: number; // Decimal se serializa a number/string en la API
    images: string[]; // Representación del campo Json ("[]") en la app
    assignments?: StudentUniform[];
    availableSizes: any[];
    createdAt: Date | string;
    updatedAt: Date | string;
}

// DTO/Payloads útiles para formularios e interacción con la API
export type CreateUniformDto = Omit<Uniform, 'id' | 'createdAt' | 'updatedAt' | 'assignments'>;
export type UpdateUniformDto = Partial<CreateUniformDto>;

// 🔍 Parámetros para filtros de búsqueda (Fetch)
export interface FetchUniformsParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
}

export interface SizeStock {
    size: string;
    quantity: number;
}

// 🎯 Definimos una interfaz limpia para los datos serializables
export interface SaveUniformPayload {
    name: string;
    beat?: string;
    category: string;
    status: string;
    price: number;
    availableSizes: any[];
    images: { name: string; type: string; base64: string }[]; // 🚀 'type' agregado aquí
    existingImages: string[]; // 🚀 'type' agregado aquí
}