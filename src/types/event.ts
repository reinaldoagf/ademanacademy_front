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
export interface EventData {
    id?: string;
    code?: string;
    name: string;
    type: string;
    startDate: string; // Formato YYYY-MM-DD
    endDate: string;   // Formato YYYY-MM-DD
    location: string;
    ticketsSold: number;
    totalTickets: number;
    ticketPrice: number;
    productionStatus: string;
    seatingMapId: string;
    seatingMap: SeatingMap;
    eventSeats?: EventSeat[];
}

// 🔍 Parámetros de Búsqueda y Paginación
export interface FetchEventsParams {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
}

// Interfaz para el estado del formulario
export interface EventFormData {
    code?: string;
    name: string;
    type: string;
    startDate: string;
    endDate: string;
    productionStatus: string;
    description: string;
    seatingMapId: string;
}