// src/app/actions/event.ts
"use server";

import axios from "axios";
import { getAuthHeaders } from "@/helpers/auth-headers";
import { FetchEventsParams, SaveEventPayload } from "@/types/event";

const BACKEND_URL = process.env.NEST_BACKEND_URL || "http://localhost:3000";
export async function getAllEventsAction(params: FetchEventsParams) {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.get(`${BACKEND_URL}/events`, {
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

export async function saveEventAction(payload: SaveEventPayload, id?: string | null) {
    try {
        const url = id ? `${BACKEND_URL}/events/${id}` : `${BACKEND_URL}/events`;
        const headers = await getAuthHeaders();

        const response = id
            ? await axios.patch(url, payload, { headers })
            : await axios.post(url, payload, { headers });

        return { success: true, data: response.data };
    } catch (error: any) {
        const apiMessage = error?.response?.data?.message;
        return {
            success: false,
            error: Array.isArray(apiMessage) ? apiMessage.join(", ") : apiMessage || "Error al guardar el evento.",
        };
    }
}

export async function deleteEventAction(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const headers = await getAuthHeaders(); // Inyectamos cabeceras para validar permisos en el backend si es necesario

        await axios.delete(`${BACKEND_URL}/events/${id}`, { headers });

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

export async function getHomeEvents() {
    try {
        const response = await axios.get(`${BACKEND_URL}/events/home`);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Error al obtener los eventos:', error);
        return { success: false, data: [] };
    }
}