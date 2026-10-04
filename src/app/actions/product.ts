"use server";

import axios from "axios";
import { SaveProductPayload, FetchProductsParams } from "@/types/product";
import { getAuthHeaders } from "@/helpers/auth-headers";

const BACKEND_URL = process.env.NEST_BACKEND_URL || "http://localhost:3000";
export async function saveProductAction(payload: SaveProductPayload, id?: string | null) {
    try {
        const url = id ? `${BACKEND_URL}/products/${id}` : `${BACKEND_URL}/products`;
        const headers = await getAuthHeaders();

        const response = id
            ? await axios.patch(url, payload, { headers })
            : await axios.post(url, payload, { headers });

        return { success: true, data: response.data };
    } catch (error: any) {
        console.error("Error en saveProductAction:", error?.response?.data || error);

        if (error.response) {
            const backendMessage = error.response.data?.message;

            if (
                typeof backendMessage === 'string' &&
                backendMessage.includes('products_name_key')
            ) {
                return {
                    success: false,
                    error: "El nombre de este producto ya está registrado. Por favor, elige otro."
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
                error: backendMessage || "Error al procesar el producto."
            };
        }

        return { success: false, error: "Error crítico de red en el servidor." };
    }
}
export async function getAllProductsAction(params: FetchProductsParams) {
    try {
        const headers = await getAuthHeaders();
        // Axios limpiará automáticamente las propiedades undefined
        const response = await axios.get(`${BACKEND_URL}/products`, {
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
export async function getProductMetrics() {
    try {
        const headers = await getAuthHeaders();
        // Axios limpiará automáticamente las propiedades undefined
        const response = await axios.get(`${BACKEND_URL}/products/metrics`, {
            headers: headers
        });

        return { success: true, data: response.data };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.message || "Error al conectar con la academia."
        };
    }
}

export async function deleteProductAction(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const headers = await getAuthHeaders(); // Inyectamos cabeceras para validar permisos en el backend si es necesario

        await axios.delete(`${BACKEND_URL}/products/${id}`, { headers });

        return { success: true };

    } catch (error: any) {
        if (error.response) {
            return {
                success: false,
                error: error.response.data?.message || "No se pudo eliminar el salón."
            };
        }
        return { success: false, error: "Error al comunicar la baja al servidor." };
    }
}