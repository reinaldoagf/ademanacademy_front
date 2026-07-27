"use server";

import axios from "axios";
import { SaveGroupCategoryPayload, FetchGroupCategoriesParams } from "@/types/group-category";
import { getAuthHeaders } from "@/helpers/auth-headers";

const BACKEND_URL = process.env.NEST_BACKEND_URL || "http://localhost:3000";
export async function getAllGroupCategoriesAction(params: FetchGroupCategoriesParams) {
    try {
        const headers = await getAuthHeaders();
        // Axios limpiará automáticamente las propiedades undefined
        const response = await axios.get(`${BACKEND_URL}/group-categories`, {
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


export async function saveGroupCategoryAction(payload: SaveGroupCategoryPayload, id?: string | null) {
    try {
        const url = id ? `${BACKEND_URL}/group-categories/${id}` : `${BACKEND_URL}/group-categories`;
        const headers = await getAuthHeaders();

        const response = id
            ? await axios.patch(url, payload, { headers })
            : await axios.post(url, payload, { headers });

        return { success: true, data: response.data };

    } catch (error: any) {
        console.error("Error en saveGroupCategoryAction:", error?.response?.data || error);
        if (error.response) {
            const backendMessage = error.response.data?.message;

            if (
                typeof backendMessage === 'string' &&
                backendMessage.includes('Unique constraint failed on the constraint: `GroupCategorys_name_key`')
            ) {
                return {
                    success: false,
                    error: "El nombre de esta categoría ya está registrado. Por favor, elige otro."
                };
            }

            if (Array.isArray(backendMessage)) {
                return {
                    success: false,
                    error: backendMessage.join(', ')
                };
            }

            return {
                success: false,
                error: backendMessage || "Error al procesar el elemento."
            };
        }

        return { success: false, error: "Error crítico de red en el servidor." };
    }

}


export async function deleteGroupCategoryAction(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const headers = await getAuthHeaders(); // Inyectamos cabeceras para validar permisos en el backend si es necesario

        await axios.delete(`${BACKEND_URL}/group-categories/${id}`, { headers });

        return { success: true };

    } catch (error: any) {
        if (error.response) {
            return {
                success: false,
                error: error.response.data?.message || "No se pudo eliminar la categoría."
            };
        }
        return { success: false, error: "Error al comunicar la baja al servidor." };
    }
}