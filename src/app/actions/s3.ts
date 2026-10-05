// src/app/actions/s3.ts
"use server";

import axios from "axios";
import { getAuthHeaders } from "@/helpers/auth-headers";

const BACKEND_URL = process.env.NEST_BACKEND_URL || "http://localhost:3000";
export async function getPresignedUrlAction(fileType: string) {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.post(
            `${BACKEND_URL}/s3/presigned-url`,
            { fileType },
            { headers }
        );
        return { success: true, data: response.data };
    } catch (error: any) {
        return { success: false, error: "No se pudo obtener la URL de subida." };
    }
}
export async function deleteS3Image(
    key: string
): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.post(`${BACKEND_URL}/s3/image`, { key }, { headers });
        return { success: true };
    } catch (error: any) {
        if (error.response) {
            return {
                success: false,
                error: error.response.data?.message || "No se pudo anular la orden de pago.",
            };
        }
        return { success: false, error: "Error al comunicar la anulación al servidor." };
    }
}