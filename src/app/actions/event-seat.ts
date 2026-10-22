// @/app/actions/event-seat.ts
"use server";

import axios from "axios";
import { ClientPurchaseSeatsPayload } from "@/types/event-seat";
import { getAuthHeaders, getAuthHeadersForMultipart } from "@/helpers/auth-headers";

export interface ReserveSeatsPayload {
    eventId: string;
    seatingMapElementIds: string[];
    status: "Reservado" | "Pagado";
    clientId: string;
    totalAmount: number;
    reservationDurationMinutes?: number;
}

const BACKEND_URL = process.env.NEST_BACKEND_URL || "http://localhost:3000";


export async function clientPurchaseSeatsAction(payload: ClientPurchaseSeatsPayload) {
    try {
        const headers = await getAuthHeadersForMultipart();
        const requestHeaders = { ...headers };
        if (requestHeaders['Content-Type']) {
            delete requestHeaders['Content-Type'];
        }

        // 3. Enviamos a NestJS combinando los headers de autorización con los boundaries del Multipart
        const response = await axios.post(
            `${BACKEND_URL}/event-seats/client-purchase`,
            payload,
            {
                headers: requestHeaders
            }
        );

        return { success: true, data: response.data };
    } catch (error: any) {
        console.error("Error en clientPurchaseSeatsAction:", error.response?.data || error.message);
        if (axios.isAxiosError(error)) {
            return {
                success: false,
                message: error.response?.data?.message || "Error al procesar la compra del asiento.",
            };
        }
        return { success: false, message: "Error interno del servidor." };
    }
}

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
