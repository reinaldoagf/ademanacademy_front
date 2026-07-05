import { Group } from "@/types/group";
// 🎯 Esta es la estructura exacta que valida la lógica de tu asignación en la interfaz
export interface BlockData {
    id: string;
    startTime: string;
    endTime: string;
    label?: string; // Opcional para soportar "Ensayo intensivo"
    group?: Group; // Opcional para soportar "Ensayo intensivo"
}

/* export interface ScheduleBlock {
    block: BlockData; // 👈 Aquí se define el objeto anidado que TypeScript extrañaba
    group: any;       // Aquí va el objeto 'currentGroup' que recuperas de la base de datos
} */

export interface WeeklyScheduleJSON {
    lunes: BlockData[];
    martes: BlockData[];
    miércoles: BlockData[];
    jueves: BlockData[];
    viernes: BlockData[];
    sábado: BlockData[];
    domingo: BlockData[];
}

export interface Schedule {
    classroomId: string,
    groupId: string,
    id: string,
    schedule: WeeklyScheduleJSON,
    createdAt: string,
    updatedAt: string,
}

export type WeekDay = 'lunes' | 'martes' | 'miércoles' | 'jueves' | 'viernes' | 'sábado' | 'domingo';