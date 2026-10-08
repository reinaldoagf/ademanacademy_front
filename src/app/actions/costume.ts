// src/app/actions/costume.ts
"use server";

import axios from "axios";
import { SaveCostumePayload, FetchCostumesParams } from "@/types/costume";
import { getAuthHeaders } from "@/helpers/auth-headers";

const BACKEND_URL = process.env.NEST_BACKEND_URL || "http://localhost:3000";

export interface StudentAssignmentPayload {
    studentId: string;
    observations?: string;
}

export interface AssignCostumeActionParams {
    costumeId: string;
    assignments: StudentAssignmentPayload[];
}

export async function getCostumeCountByStatus() {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.get(`${BACKEND_URL}/costumes/count-by-status`, {
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

export async function saveCostumeAction(payload: SaveCostumePayload, id?: string | null) {
    try {
        const url = id ? `${BACKEND_URL}/costumes/${id}` : `${BACKEND_URL}/costumes`;
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
        console.error("Error en saveCostumeAction:", error?.response?.data || error);
        if (error.response) {
            const backendMessage = error.response.data?.message;

            if (
                typeof backendMessage === 'string' &&
                backendMessage.includes('Unique constraint failed on the constraint: `costumes_name_key`')
            ) {
                return {
                    success: false,
                    error: "El nombre de este uniforme ya está registrado. Por favor, elige otro."
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

export async function assignCostumeAction(
    data: AssignCostumeActionParams,
): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.post(`${BACKEND_URL}/costumes/assign`, data, { headers });

        return { success: true, data: response.data };

    } catch (error: any) {
        if (error.response) {
            return {
                success: false,
                error: error.response.data?.message || "No se pudo asignar el uniforme."
            };
        }
        return { success: false, error: "Error al comunicar la asignación al servidor." };
    }
}