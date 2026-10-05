"use server";

import axios from "axios";
import { FetchUniformsParams, SaveUniformPayload } from "@/types/uniform";
import { getAuthHeaders } from "@/helpers/auth-headers";
export interface StudentAssignmentPayload {
    studentId: string;
    assignedSize: string;
    observations?: string;
}

export interface AssignUniformActionParams {
    uniformId: string;
    assignments: StudentAssignmentPayload[];
}
const BACKEND_URL = process.env.NEST_BACKEND_URL || "http://localhost:3000";
export async function getAllUniformsAction(params: FetchUniformsParams) {
    try {
        const headers = await getAuthHeaders();
        // Axios limpiará automáticamente las propiedades undefined
        const response = await axios.get(`${BACKEND_URL}/uniforms`, {
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

export async function saveUniformAction(payload: SaveUniformPayload, id?: string | null) {
    try {
        const url = id ? `${BACKEND_URL}/uniforms/${id}` : `${BACKEND_URL}/uniforms`;
        const headers = await getAuthHeaders();


        const requestHeaders = { ...headers };
        if (requestHeaders['Content-Type']) {
            delete requestHeaders['Content-Type'];
        }

        const response = id
            ? await axios.patch(url, payload, { headers: requestHeaders })
            : await axios.post(url, payload, { headers: requestHeaders });

        return { success: true, data: response.data };

    } catch (error: any) {
        console.error("Error en saveUniformAction:", error?.response?.data || error);
        if (error.response) {
            const backendMessage = error.response.data?.message;

            if (
                typeof backendMessage === 'string' &&
                backendMessage.includes('Unique constraint failed on the constraint: `uniforms_name_key`')
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

export async function getUniformCountByStatus() {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.get(`${BACKEND_URL}/uniforms/count-by-status`, {
            params: {},
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

export async function deleteUniformAction(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const headers = await getAuthHeaders(); // Inyectamos cabeceras para validar permisos en el backend si es necesario

        await axios.delete(`${BACKEND_URL}/uniforms/${id}`, { headers });

        return { success: true };

    } catch (error: any) {
        if (error.response) {
            return {
                success: false,
                error: error.response.data?.message || "No se pudo eliminar el elemento."
            };
        }
        return { success: false, error: "Error al comunicar la baja al servidor." };
    }
}

export async function assignUniformAction(data: AssignUniformActionParams) {
    try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

        const headers = await getAuthHeaders();
        const response = await axios.post(`${API_URL}/uniforms/assign`, data, { headers });


        // revalidatePath('/admin/wardrobe/uniforms');
        return { success: true, data: response.data };


    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Error de comunicación con el servidor.',
        };
    }
}

export async function getMyUniformAssignmentsAction(params: FetchUniformsParams) {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.get(`${BACKEND_URL}/uniforms/my-assignments`, { headers, params });
        return { success: true, data: response.data.data, meta: response.data.meta };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.message || "Error al conectar con la academia."
        };
    }
}