import { Schedule } from "@/types/schedule";
import { Classroom } from "@/types/classroom";

export interface Group {
    id: string;
    name: string;
    style: string | null;
    instructorId: string | null; // Guardamos la referencia por ID para los selects
    instructor?: {
        id: string;
        name: string;
        email: string;
    };
    classroomId: string | null;  // Guardamos la referencia por ID para los selects
    classroom?: Classroom;
    schedules?: Schedule[];
    usedSlots: number;
    totalNumberOfSlots: number;
    category: "baby" | "childrens" | "youth" | "adult";
}

export interface FetchGroupsParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
}