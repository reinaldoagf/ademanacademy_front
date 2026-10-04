import { SeatingMap } from "./seating-map";

export interface EventSeat {
    id: string;
    eventId: string;
    seatingMapElementId: string;
    status: string;
    reservedAt: string;
    expiresAt: string;
    userId: string;
    studentId: string;
    createdAt: string;
    updatedAt: string;
}
export interface EventImage {
    id?: string;
    url: string;
    altText?: string;
    type?: "cover" | "banner" | "gallery";
    order?: number;
}

export interface EventData {
    id?: string;
    isActive?: boolean;
    description?: string;
    name: string;
    type: string;
    startDate: string; // Formato YYYY-MM-DD
    endDate: string;   // Formato YYYY-MM-DD
    location?: string;
    ticketsSold?: number;
    totalTickets?: number;
    ticketPrice?: number;
    publishToHome: boolean;
    productionStatus: string;
    seatingMapId?: string;
    seatingMap?: SeatingMap;
    eventSeats?: EventSeat[];
    // 🎯 Campos Nuevos
    isPresaleActive?: boolean;
    presaleStartDate?: string | null;
    presaleEndDate?: string | null;
    images?: EventImage[];
    sponsors?: SponsorInput[];
}

// 🔍 Parámetros de Búsqueda y Paginación
export interface FetchEventsParams {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
}
export interface SponsorInput {
    name: string;
    logoUrl: string;
    tier: "main" | "gold" | "silver" | "bronze";
    websiteUrl?: string;
    socialLinks?: {
        instagram?: string;
        twitter?: string;
        facebook?: string;
    };
}
// Interfaz para el estado del formulario
export interface EventFormData {
    name: string;
    type: string;
    productionStatus: string;
    startDate: string;
    endDate: string;
    description: string;
    seatingMapId: string;
    // 🎯 Campos Nuevos
    publishToHome: boolean;
    isPresaleActive: boolean;
    presaleStartDate: string;
    presaleEndDate: string;
    images?: { name: string; type: string; base64: string }[];
    existingImages: EventImagePayload[];
    sponsors: SponsorInput[]; // Lista dinámica de patrocinadores
}

export interface EventImagePayload {
    url: string;
    key: string;
    altText?: string;
    type?: string;
    order?: number;
}

export interface SaveEventPayload {
    name: string;
    type: string;
    productionStatus: string;
    startDate: string;
    endDate: string;
    description?: string;
    seatingMapId?: string;
    isPresaleActive: boolean;
    presaleStartDate?: string;
    presaleEndDate?: string;
    sponsors?: any[];
    images: EventImagePayload[];
}