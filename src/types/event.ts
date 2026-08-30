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
    location: string;
    ticketsSold: number;
    totalTickets: number;
    ticketPrice: number;
    productionStatus: string;
    description: string; // 👈 Agrega '?' para hacerla opcional
}