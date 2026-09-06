// @/app/actions/event-seat.ts
"use server";

import axios from "axios";
import { getAuthHeaders } from "@/helpers/auth-headers";

export interface ReserveSeatsPayload {
    eventId: string;
    seatingMapElementIds: string[];
    status: "reserved" | "sold";
    userId?: string;
    studentId?: string;
}

const BACKEND_URL = process.env.NEST_BACKEND_URL || "http://localhost:3000";

export async function reserveOrBuySeatsAction(payload: ReserveSeatsPayload) {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.post(
            `${BACKEND_URL}/event-seats/reserve`,
            payload,
            { headers }
        );

        return { success: true, data: response.data };
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            return {
                success: false,
                message: error.response?.data?.message || "Error al procesar la reserva del asiento.",
            };
        }
        return { success: false, message: "Error interno del servidor." };
    }
}