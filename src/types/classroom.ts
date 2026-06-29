import { Group } from "@/types/group";
import { WeeklyScheduleJSON } from "@/types/schedule";
export interface Classroom {
    id: string;
    name: string;
    address: string;
    maxCapacity: number;
    type: string;
    status: string;
    description?: string;
    groups: Group[]
    schedules: {
        classroomId: string,
        groupId: string,
        id: string,
        schedule: WeeklyScheduleJSON,
        createdAt: string,
        updatedAt: string,
    }[];
    createdAt?: string,
    updatedAt?: string,
}

export interface FetchClassroomsParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    type?: string;
}