// @/app/actions/event-seat.ts
"use server";

import axios from "axios";
import { getAuthHeaders, getAuthHeadersForMultipart } from "@/helpers/auth-headers";
import FormDataNode from "form-data";

export interface ReserveSeatsPayload {
    eventId: string;
    seatingMapElementIds: string[];
    status: "reserved" | "sold";
    clientId: string;
    totalAmount: number;
    reservationDurationMinutes?: number;
}

const BACKEND_URL = process.env.NEST_BACKEND_URL || "http://localhost:3000";


export async function clientPurchaseSeatsAction(formData: FormData) {
    try {
        const headers = await getAuthHeadersForMultipart();

        // 🚀 Creamos la instancia de FormData de Node.js para reconstruir la petición multipart
        const backendForm = new FormDataNode();

        // 1. Traspasamos los campos de texto
        backendForm.append("eventId", formData.get("eventId"));
        backendForm.append("seatingMapElementIds", formData.get("seatingMapElementIds"));
        backendForm.append("totalAmount", formData.get("totalAmount"));
        backendForm.append("bankName", formData.get("bankName"));
        backendForm.append("referenceNumber", formData.get("referenceNumber"));

        // 2. Extraemos y procesamos el archivo de imagen o PDF
        const file = formData.get("receiptFile") as File | null;
        if (file && file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer()); // Convertimos a Buffer binario de Node
            backendForm.append("receiptFile", buffer, {
                filename: file.name,
                contentType: file.type,
            });
        }

        // 3. Enviamos a NestJS combinando los headers de autorización con los boundaries del Multipart
        const response = await axios.post(
            `${BACKEND_URL}/event-seats/client-purchase`,
            backendForm,
            {
                headers: {
                    ...headers,
                    ...backendForm.getHeaders(), // 🔥 Inyecta multipart/form-data con el boundary de form-data
                },
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
