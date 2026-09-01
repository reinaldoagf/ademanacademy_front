export interface SeatingMapElement {
    itemID: string;
    type: "tarima_pista" | "silla_vip" | string; // expandible a otros tipos
    name: string;
    chairNumber?: string;
    groupId?: string;
    rotation: number;
    groupRotation: number;
    price: number;
    xMeters: number;
    yMeters: number;
    widthMeters: number;
    tallMeters: number;
}

export interface SeatingMap {
    totalWidth: number;
    totalHigh: number;
    elements: SeatingMapElement[];
}