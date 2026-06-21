"use server";

import axios from "axios";
import { FetchTransactionsParams } from "@/types/transaction";
import { getAuthHeaders } from "@/helpers/auth-headers";

const BACKEND_URL = process.env.NEST_BACKEND_URL || "http://localhost:3000";
export async function getAllTransactionsAction(params: FetchTransactionsParams) {
    try {
        const headers = await getAuthHeaders();
        // Axios limpiará automáticamente las propiedades undefined
        const response = await axios.get(`${BACKEND_URL}/transactions`, {
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
export async function approveTransactionAction(transactionId: string, selectedGroupId: string | undefined) {
    try {
        const headers = await getAuthHeaders();

        const response = await axios.patch(
            `${BACKEND_URL}/transactions/${transactionId}/approve`,
            { groupId: selectedGroupId }, // Cuerpo vacío si tu NestJS solo requiere el ID por parámetro
            {
                headers: headers
            }
        );

        return { success: true, data: response.data };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.message || "No se pudo aprobar la transacción."
        };
    }
}