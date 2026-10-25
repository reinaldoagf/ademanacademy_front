
import { Student } from "@/types/student";
import { Client } from "./client";
import { S3Image } from "./s3-image";
export interface User {
    id: string;
    IDNumberPrefix: string;
    dni: string;
    firstName: string;
    lastName: string;
    email: string;
    birthDate: string;
    countryCode: string;
    phone: string;
    password?: string;
    isAdmin: boolean;
    isEmployee: boolean;
    profileType: "Representante" | "Estudiante";
    students?: Student[]
    client: Client;
    profileOnboarding: boolean;
    clients?: Client[];
    createdAt?: string;
    updatedAt?: string;
}

export interface CompleteOnboardingPayload {
    profileType: string;
    isEnrolled: boolean;
    studentId: string;
    representativeOccupation: string;
    representedStudents: Student[];
    payment: { bankName?: string; referenceNumber?: string; amount?: number; isEnrolled?: boolean; studentId?: string } | null;
    imageOfPaymentReceipt: S3Image | null;
}

export interface FetchUsersParams {
    page?: number;
    limit?: number;
    search?: string;
}