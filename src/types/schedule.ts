export type WeekDay = 'lunes' | 'martes' | 'miércoles' | 'jueves' | 'viernes' | 'sábado' | 'domingo';

export interface ScheduleBlock {
    id: string;         // Identificador único del bloque (ej: UUID o timestamp)
    startTime: string;  // Formato "HH:MM" (ej: "14:30")
    endTime: string;    // Formato "HH:MM" (ej: "16:00")
    label?: string;     // Opcional: Nombre de la clase o nota (ej: "Salsa Casino")
}

// Representa los bloques activos mapeados por cada día de la semana
export type WeeklySchedule = Record<WeekDay, ScheduleBlock[]>;