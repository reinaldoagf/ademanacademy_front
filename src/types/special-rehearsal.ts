import { Student } from "./student";

export interface SpecialRehearsalFormData {
    title: string;
    description?: string;
    date: string;        // ISO String (e.g., "2024-12-25")
    startTime: string;   // "08:00"
    endTime: string;     // "09:30"
    classroomId?: string | null; // Puede ser null si es externo
    location?: string;   // "Teatro Municipal"
    studentIds: string[] | undefined; // IDs de los estudiantes
}

export interface SpecialRehearsal {
    id: string;
    title: string;
    description?: string;
    date: string;        // ISO String (e.g., "2024-12-25")
    startTime: string;   // "08:00"
    endTime: string;     // "09:30"
    classroomId?: string | null; // Puede ser null si es externo
    location?: string;   // "Teatro Municipal"
    students: Student[]; // IDs de los estudiantes
}

export interface FetchSpecialRehearsalParams {
    page?: number;
    limit?: number;
    search?: string;
}