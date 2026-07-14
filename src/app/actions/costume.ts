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
}

export async function saveCustomeAction(payload: SaveCostumePayload, id?: string | null) {
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

        // 3. Re-construimos los archivos binarios
        if (payload.images && payload.images.length > 0) {
            for (const img of payload.images) {
                // Removemos el prefijo data:image/...;base64 del string de datos
                const cleanBase64 = img.base64.replace(/^data:image\/\w+;base64,/, "");
                const buffer = Buffer.from(cleanBase64, 'base64');

                // 🚀 SOLUCIÓN: Usamos "File" en lugar de un "Blob" plano e inyectamos el 'type' original.
                // Esto garantiza que al enviarlo a NestJS, Multer lo reciba como una imagen real.
                const fileFromBuffer = new File([buffer], img.name, {
                    type: img.type || 'image/jpeg' // Si no viene tipo, ponemos fallback común
                });

                // Añadimos a la clave 'images' esperando por Multer en NestJS
                apiFormData.append('images', fileFromBuffer);
            }
        }

        // En Next.js Server Actions, al usar Axios para pasar un FormData nativo de Node,
        // necesitamos eliminar de las cabeceras manuales cualquier Content-Type forzado
        // para dejar que Axios configure automáticamente el boundary correcto.
        const requestHeaders = { ...headers };
        if (requestHeaders['Content-Type']) {
            delete requestHeaders['Content-Type'];
        }

        const response = id
            ? await axios.patch(url, apiFormData, { headers: requestHeaders })
            : await axios.post(url, apiFormData, { headers: requestHeaders });

        return { success: true, data: response.data };

    } catch (error: any) {
        console.error("Error en saveCustomeAction:", error?.response?.data || error);
        if (error.response) {
            // Capturamos el mensaje que viene desde el servidor NestJS
            const backendMessage = error.response.data?.message;

            // 🎯 DETECCIÓN DEL UNIQUE CONSTRAINT DE PRISMA
            if (
                typeof backendMessage === 'string' &&
                backendMessage.includes('Unique constraint failed on the constraint: `costumes_name_key`')
            ) {
                return {
                    success: false,
                    error: "El nombre de este vestuario ya está registrado. Por favor, elige otro."
                };
            }

            // Si el backend envía los errores en un array (ej: validaciones de class-validator)
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