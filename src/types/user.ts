
import { Student } from "@/types/student";
export interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    isAdmin: boolean;
    students: Student[]
}
