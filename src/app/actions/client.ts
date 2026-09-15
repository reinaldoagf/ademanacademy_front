// src/app/actions/client.ts
"use server";

import axios from "axios";
import { Client, FetchClientsParams } from "@/types/client";
import { getAuthHeaders } from "@/helpers/auth-headers";

const BACKEND_URL = process.env.NEST_BACKEND_URL || "http://localhost:3000";
export async function saveClientAction(formData: Omit<Client, 'id'>, id?: string | null) {
    try {
        const url = id ? `${BACKEND_URL}/clients/${id}` : `${BACKEND_URL}/clients`;
        const headers = await getAuthHeaders();

        // 🎯 Ejecutamos la petición de Axios dinámicamente según la existencia del ID
        const response = id
            ? await axios.patch(url, formData, { headers })
            : await axios.post(url, formData, { headers });

        // 💡 Axios parsea automáticamente a JSON y lo guarda en la propiedad '.data'
        return { success: true, data: response.data };

    } catch (error: any) {
        // 🔍 Capturamos los errores devueltos estructuradamente por NestJS (400, 401, 409, 500, etc.)
        if (error.response) {
            return {
                success: false,
                error: error.response.data?.message || "Error al procesar el salón."
            };
        }

        // Error en caso de que el servidor de NestJS esté apagado o no haya internet
        return { success: false, error: "Error crítico de red en el servidor." };
    }
}

export async function getAllClientsAction(params: FetchClientsParams) {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.get(`${BACKEND_URL}/clients`, {
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

export async function deleteClientAction(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const headers = await getAuthHeaders(); // Inyectamos cabeceras para validar permisos en el backend si es necesario

        await axios.delete(`${BACKEND_URL}/clients/${id}`, { headers });

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