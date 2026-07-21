// src/app/actions/costume.ts
"use server";

import axios from "axios";
import { Costume, FetchCostumesParams } from "@/types/costume";
import { getAuthHeaders } from "@/helpers/auth-headers";

const BACKEND_URL = process.env.NEST_BACKEND_URL || "http://localhost:3000";

export async function getAllCostumesAction(params: FetchCostumesParams) {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.get(`${BACKEND_URL}/costumes`, {
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

// 🎯 Definimos una interfaz limpia para los datos serializables
interface SaveCostumePayload {
    name: string;
    beat?: string;
    category: string;
    status: string;
    availableSizes: any[];
    images: { name: string; type: string; base64: string }[]; // 🚀 'type' agregado aquí
    existingImages: string[]; // 🚀 'type' agregado aquí
}

export async function saveCostumeAction(payload: SaveCostumePayload, id?: string | null) {
    try {
        const url = id ? `${BACKEND_URL}/costumes/${id}` : `${BACKEND_URL}/costumes`;
        const headers = await getAuthHeaders();

        // 1. Instanciamos el FormData en el Servidor
        const apiFormData = new FormData();

        // 2. Adjuntamos los datos planos
        apiFormData.append('name', payload.name);
        apiFormData.append('beat', payload.beat || '');
        apiFormData.append('category', payload.category);
        apiFormData.append('status', payload.status);
        apiFormData.append('availableSizes', JSON.stringify(payload.availableSizes || []));

        // 3. Procesamos y limpiamos las imágenes existentes si estamos editando
        if (id && payload.existingImages) {
            const cleanBackendUrl = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;

            const relativeExistingImages = payload.existingImages.map((urlStr) => {
                // Si la URL contiene el backend URL, lo removemos para dejar solo la ruta relativa
                if (urlStr.startsWith(cleanBackendUrl)) {
                    return urlStr.replace(cleanBackendUrl, '');
                }
                return urlStr;
            });

            apiFormData.append('existingImages', JSON.stringify(relativeExistingImages));
        }

        // 4. Re-construimos los archivos binarios de las nuevas imágenes
        if (payload.images && payload.images.length > 0) {
            for (const img of payload.images) {
                const cleanBase64 = img.base64.replace(/^data:image\/\w+;base64,/, "");
                const buffer = Buffer.from(cleanBase64, 'base64');

                const fileFromBuffer = new File([buffer], img.name, {
                    type: img.type || 'image/jpeg'
                });

                apiFormData.append('images', fileFromBuffer);
            }
        }

        const requestHeaders = { ...headers };
        if (requestHeaders['Content-Type']) {
            delete requestHeaders['Content-Type'];
        }

        const response = id
            ? await axios.patch(url, apiFormData, { headers: requestHeaders })
            : await axios.post(url, apiFormData, { headers: requestHeaders });

        return { success: true, data: response.data };

    } catch (error: any) {
        console.error("Error en saveCostumeAction:", error?.response?.data || error);
        if (error.response) {
            const backendMessage = error.response.data?.message;

            if (
                typeof backendMessage === 'string' &&
                backendMessage.includes('Unique constraint failed on the constraint: `costumes_name_key`')
            ) {
                return {
                    success: false,
                    error: "El nombre de este vestuario ya está registrado. Por favor, elige otro."
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

export async function deleteCostumeAction(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const headers = await getAuthHeaders(); // Inyectamos cabeceras para validar permisos en el backend si es necesario

        await axios.delete(`${BACKEND_URL}/costumes/${id}`, { headers });

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