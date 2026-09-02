export interface SeatingMapElement {
    itemID: string;
    x: number;
    y: number;
    type: "tarima_pista" | "silla_vip" | "silla_general" | "silla_patrocinante" | "silla_preferencial" | string; // expandible a otros tipos
    name: string;
    chairNumber?: string | number;
    groupId?: string;
    macroGroupId?: string;
    rotation: number;
    groupRotation?: number;
    price?: number;
    xMeters: number;
    yMeters: number;
    widthMeters: number;
    tallMeters: number;
    limitPerRepresentative?: number;
    width: number;
    height: number;
}

export interface SeatingMap {
    totalWidth: number;
    totalHigh: number;
    elements: SeatingMapElement[];
}

// 🔍 Parámetros para filtros de búsqueda y paginación
export interface FetchSeatingMapsParams {
    page?: number;
    limit?: number;
    search?: string;
}