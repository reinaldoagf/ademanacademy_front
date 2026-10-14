import { User } from "./user";
import { Student } from "./student";
import { Group } from "./group";
import { Client } from "./client";

export interface Registration {
    id: string;
    status: string;
    userId?: string;
    user?: User;
    clientId?: string;
    client?: Client;
    student?: Student;
    groupId?: string;
    group?: Group;
    createdAt: string;
    updatedAt: string;
}

export interface FetchRegistrationsParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    type?: string;
}


export interface RegistrationPayload {
    profileType: string;
    representedStudents?: any[];
    payment?: {
        bankName: string;
        referenceNumber: string;
        amount: number;
        receiptPath: string; // 👈 URL de S3 generada previamente en el cliente
        isEnrolled?: boolean;
        studentId?: string;
    };
}