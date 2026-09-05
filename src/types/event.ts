import { SeatingMap } from "./seating-map";

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