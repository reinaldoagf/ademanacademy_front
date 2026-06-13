import { WeeklyScheduleJSON } from "@/types/schedule";
export interface Group {
    id: string;
    name: string;
    style: string | null;
    instructor: string;
    schedules: {
        classroomId: string,
        groupId: string,
        id: string,
        schedule: WeeklyScheduleJSON,
        createdAt: string,
        updatedAt: string,
    }[];
    classroom: string | null;
    usedSlots: number;
    totalNumberOfSlots: number;
    category: "Baby" | "Infantil" | "Juvenil" | "Adulto";
}