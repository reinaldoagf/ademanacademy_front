import { Group } from "./group";
import { Student } from "./student";
import { User } from "./user";

export interface Client {
    id: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    address: string;
    phone: string;
    type?: "student" | "representative";
    studentId?: string;
    student?: Student;
    userId?: string;
    user?: User;
    groupId?: string;
    group?: Group;
    createdAt?: string;
    updatedAt?: string;
}
