"use server";

import axios from "axios";
import { FetchRegistrationsParams, RegistrationPayload } from "@/types/registration";
import { getAuthHeaders } from "@/helpers/auth-headers";

const BACKEND_URL = process.env.NEST_BACKEND_URL || "http://localhost:3000";

export async function getAllRegistrationsAction(params: FetchRegistrationsParams) {
    try {
        const headers = await getAuthHeaders();
        // Axios limpiará automáticamente las propiedades undefined
        const response = await axios.get(`${BACKEND_URL}/registrations`, {
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

export async function completeRegistrationAction(payload: RegistrationPayload) {
    try {
        const headers = await getAuthHeaders();

        // 🎯 Enviamos el objeto JSON directamente al backend de NestJS
        const response = await axios.post(
            `${BACKEND_URL}/registrations`,
            payload,
            {
                headers: {
                    ...headers,
                    "Content-Type": "application/json", // Aseguramos el tipo de contenido JSON
                }
            }
        );

        return { success: true, data: response.data };
    } catch (error: any) {
        console.error("Error en completeRegistrationAction:", error.response?.data || error);

        const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Error al conectar con la academia.";

        return {
            success: false,
            error: Array.isArray(errorMessage) ? errorMessage[0] : errorMessage
        };
    }
}