// src/app/actions/user.ts
"use server";

import axios from "axios";
import { FetchUsersParams } from "@/types/user";
import { cookies } from "next/headers"; // 💡 Helper nativo de Next.js
// import { revalidatePath } from "next/cache";

const BACKEND_URL = process.env.NEST_BACKEND_URL || "http://localhost:3000";

interface OnboardingPayload {
    profileType: "student" | "representative";
    // Si es representante, enviamos el arreglo de alumnos iniciales
    representedStudents?: {
        firstName: string;
        lastName: string;
        dni: string;
        birthDate: string;
        kinship: string;
    }[];
}

async function getAuthHeaders(): Promise<Record<string, string>> {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    return {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    };
}
export async function completeOnboardingAction(payload: OnboardingPayload) {
    try {
        // getAuthHeaders() obtiene el token Bearer JWT del usuario logueado
        const headers = await getAuthHeaders();

        const response = await axios.post(`${BACKEND_URL}/users/complete-onboarding`, payload, { headers });

        // Forzamos a Next.js a refrescar el Layout para que detecte profileOnboarding: true
        // revalidatePath("/", "layout");
        return { success: true, data: response.data };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.message || "Ocurrió un error al guardar tu perfil."
        };
    }
}

export async function getAllUsersAction(params: FetchUsersParams) {
    try {
        const headers = await getAuthHeaders();
        // Axios limpiará automáticamente las propiedades undefined
        const response = await axios.get(`${BACKEND_URL}/users`, {
            params,
            headers: headers
        });

        return { success: true, data: response.data.data, meta: response.data.meta };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.message || "Error al conectar con la academia."
        };
    }
}
