"use server";

import axios from "axios";
import { FetchInstructorsParams } from "@/types/instructor";
import { getAuthHeaders } from "@/helpers/auth-headers";

const BACKEND_URL = process.env.NEST_BACKEND_URL || "http://localhost:3000";
export async function getAllInstructorsAction(params: FetchInstructorsParams) {
    try {
        const headers = await getAuthHeaders();
        // Axios limpiará automáticamente las propiedades undefined
        const response = await axios.get(`${BACKEND_URL}/instructors`, {
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