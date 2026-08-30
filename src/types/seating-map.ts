export interface SeatingMapElement {
    itemID: string;
    tipo: "tarima_pista" | "silla_vip" | string; // expandible a otros tipos
    nombre: string;
    numeroSilla?: string;
    grupoId?: string;
    rotacion: number;
    precio: number;
    xMetros: number;
    yMetros: number;
    anchoMetros: number;
    altoMetros: number;
}

export interface PayloadMap {
    anchoTotalSalón: number;
    altoTotalSalón: number;
    elementos: SeatingMapElement[];
}