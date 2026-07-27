import { Schedule } from "@/types/schedule";
import { Student } from "@/types/student";
import { Classroom } from "@/types/classroom";
import { GroupCategory } from "@/types/group-category";

export interface Group {
    id: string;
    name: string;
    style: string | null;
    categoryId: string | null;  // Guardamos la referencia por ID para los selects
    category?: GroupCategory;
    instructorId: string | null; // Guardamos la referencia por ID para los selects
    instructor?: {
        id: string;
        name: string;
        email: string;
    };
    classroomId: string | null;  // Guardamos la referencia por ID para los selects
    classroom?: Classroom;
    schedules?: Schedule[];
    students?: Student[];
    totalNumberOfSlots: number;
}

export interface FetchGroupsParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
}