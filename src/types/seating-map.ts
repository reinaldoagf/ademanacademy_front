export interface SeatingMapElement {
    id?: string;
    itemID: string;
    x: number;
    y: number;
    type: "chair" | "platform" | string; // expandible a otros tipos
    itemType: "stage_floor" | "vip_chair" | "general_chair" | "sponsor_chair" | "preferred_seating" | string; // expandible a otros tipos
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
    heightMeters: number;
    limitPerRepresentative?: number;
    width: number;
    height: number;
}

export interface SeatingMap {
    id?: string;
    location?: string;
    totalWidth: number;
    totalHeight: number;
    elements: SeatingMapElement[];
    createdAt?: string;
    updatedAt?: string;
}

// 🔍 Parámetros para filtros de búsqueda y paginación
export interface FetchSeatingMapsParams {
    page?: number;
    limit?: number;
    search?: string;
}