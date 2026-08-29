// src/app/actions/event.ts
"use server";

import axios from "axios";
import { FetchEventsParams } from "@/types/event";
import { getAuthHeaders } from "@/helpers/auth-headers";

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