import { WeeklySchedule } from "@/types/schedule";
export interface Group {
    id: string;
    name: string;
    style: string | null;
    instructor: string;
    schedules: WeeklySchedule;
    classroom: string | null;
    usedSlots: number;
    totalNumberOfSlots: number;
    category: "Baby" | "Infantil" | "Juvenil" | "Adulto";
}