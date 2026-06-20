// src/app/actions/user.ts
"use server";

import axios from "axios";
import { FetchUsersParams } from "@/types/user";
import { getAuthHeaders, getAuthHeadersForMultipart } from "@/helpers/auth-headers";
import FormDataNode from "form-data";

const BACKEND_URL = process.env.NEST_BACKEND_URL || "http://localhost:3000";

interface OnboardingPayload {
    profileType: "student" | "representative";
    representativeOccupation: undefined | string;
    // Si es representante, enviamos el arreglo de alumnos iniciales
    representedStudents?: {
        firstName: string;
        lastName: string;
        dni: string | null;
        birthDate: string;
        kinship: string;
        address: string;
        phone: string | null;
        shirtSize: string;
        hasExperience: boolean;
        medicalObservations: string;
        group: string;
    }[];
    // ✨ Cambiamos las propiedades internas a opcionales para admitir solo el monto
    payment?: {
        bankName?: string;
        reference?: string;
        amount: number
    };
    receiptFile?: File | null;
}


export async function completeOnboardingAction(formData: FormData) {
    try {
        const headers = await getAuthHeadersForMultipart();

        // 🚀 Creamos una instancia de FormData limpia del lado del servidor de Node.js
        const backendForm = new FormDataNode();

        // 1. Traspasamos los valores stringificados comunes
        backendForm.append("profileType", formData.get("profileType"));

        if (formData.get("profileType") === "representative") {
            backendForm.append("representativeOccupation", formData.get("representativeOccupation"));
            backendForm.append("representedStudents", formData.get("representedStudents"));
            backendForm.append("payment", formData.get("payment"));

            // 2. Extraemos el archivo binario real que Next.js recibió temporalmente
            const file = formData.get("receiptFile") as File | null;
            if (file && file.size > 0) {
                const buffer = Buffer.from(await file.arrayBuffer()); // Convertimos el archivo a un Buffer binario de Node
                backendForm.append("receiptFile", buffer, {
                    filename: file.name,
                    contentType: file.type,
                });
            }
        } else {
            backendForm.append("payment", formData.get("payment"));
        }

        // 3. Enviamos a NestJS combinando los headers dinámicos del Multipart
        const response = await axios.post(
            `${BACKEND_URL}/users/complete-onboarding`,
            backendForm,
            {
                headers: {
                    ...headers,
                    ...backendForm.getHeaders() // 🔥 Esto inyecta el multipart/form-data con su boundary correcto
                }
            }
        );

        return { success: true, data: response.data };
    } catch (error: any) {
        console.error("Error en Server Action:", error.response?.data || error.message);
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
