export interface Student {
    id: string;
    dni: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    kinship: "Hijo" | "Hija" | "Sobrino" | "Sobrina" | "Tutorado" | "Otro" | undefined;
    medicalObservations?: string;
    userId?: string;
}