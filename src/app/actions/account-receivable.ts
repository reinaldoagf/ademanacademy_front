// /src/app/actions/account-receivable.ts

"use server";

import axios from "axios";
import {
    AccountReceivable,
    CreateAccountReceivableDto,
    CreateReceivablePaymentDto,
    FetchAccountReceivablesParams,
} from "@/types/account-receivable";
import { getAuthHeaders } from "@/helpers/auth-headers";

const BACKEND_URL = process.env.NEST_BACKEND_URL || "http://localhost:3000";

/**
 * Obtener todas las Cuentas por Cobrar (PaymentOrders) con filtros
 */
export async function getAllAccountReceivablesAction(params?: FetchAccountReceivablesParams) {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.get(`${BACKEND_URL}/payment-orders`, {
            params,
            headers,
        });

        return {
            success: true,
            data: (response.data.data || response.data) as AccountReceivable[],
            meta: response.data.meta,
        };
    } catch (error: any) {
        if (error.response) {
            return {
                success: false,
                error: error.response.data?.message || "Error al obtener las cuentas por cobrar.",
            };
        }
        return { success: false, error: "Error crítico de red en el servidor." };
    }
}

/**
 * Obtener detalle de una Cuenta por Cobrar por ID (incluyendo transacciones/abonos)
 */
export async function getAccountReceivableByIdAction(id: string) {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.get(`${BACKEND_URL}/payment-orders/${id}`, {
            headers,
        });

        return { success: true, data: response.data as AccountReceivable };
    } catch (error: any) {
        if (error.response) {
            return {
                success: false,
                error: error.response.data?.message || "Error al obtener la cuenta por cobrar.",
            };
        }
        return { success: false, error: "Error crítico de red en el servidor." };
    }
}

/**
 * Crear una nueva Orden de Pago (Cuenta por Cobrar)
 */
export async function saveAccountReceivableAction(
    formData: CreateAccountReceivableDto,
    id?: string | null
) {
    try {
        const url = id
            ? `${BACKEND_URL}/payment-orders/${id}`
            : `${BACKEND_URL}/payment-orders`;
        const headers = await getAuthHeaders();

        const response = id
            ? await axios.patch(url, formData, { headers })
            : await axios.post(url, formData, { headers });

        return { success: true, data: response.data };
    } catch (error: any) {
        if (error.response) {
            return {
                success: false,
                error: error.response.data?.message || "Error al registrar la orden de pago.",
            };
        }
        return { success: false, error: "Error crítico de red en el servidor." };
    }
}

/**
 * Registrar una Transacción (Abono / Pago) para una Orden de Pago existente
 */
export async function addReceivablePaymentAction(
    paymentOrderId: string,
    paymentData: CreateReceivablePaymentDto
) {
    try {
        const url = `${BACKEND_URL}/payment-orders/${paymentOrderId}/transactions`;
        const headers = await getAuthHeaders();

        const response = await axios.post(url, paymentData, { headers });

        return { success: true, data: response.data };
    } catch (error: any) {
        if (error.response) {
            return {
                success: false,
                error: error.response.data?.message || "Error al registrar la transacción.",
            };
        }
        return { success: false, error: "Error crítico de red en el servidor." };
    }
}

/**
 * Anular o Eliminar una Orden de Pago
 */
export async function deleteAccountReceivableAction(
    id: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const headers = await getAuthHeaders();

        await axios.delete(`${BACKEND_URL}/payment-orders/${id}`, { headers });

        return { success: true };
    } catch (error: any) {
        if (error.response) {
            return {
                success: false,
                error: error.response.data?.message || "No se pudo anular la orden de pago.",
            };
        }
        return { success: false, error: "Error al comunicar la anulación al servidor." };
    }
}