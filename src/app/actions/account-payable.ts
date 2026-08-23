"use server";

import axios from "axios";
import {
    AccountPayable,
    CreateAccountPayableDto,
    CreatePayablePaymentDto,
    FetchAccountPayablesParams,
} from "@/types/account-payable";
import { getAuthHeaders } from "@/helpers/auth-headers";

const BACKEND_URL = process.env.NEST_BACKEND_URL || "http://localhost:3000";

/**
 * Obtener todas las Cuentas por Pagar con filtros y paginación
 */
export async function getAllAccountPayablesAction(params?: FetchAccountPayablesParams) {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.get(`${BACKEND_URL}/accounts-payable`, {
            params,
            headers,
        });

        return {
            success: true,
            data: response.data.data || response.data,
            meta: response.data.meta,
        };
    } catch (error: any) {
        if (error.response) {
            return {
                success: false,
                error: error.response.data?.message || "Error al obtener las cuentas por pagar.",
            };
        }
        return { success: false, error: "Error crítico de red en el servidor." };
    }
}

/**
 * Obtener detalle de una Cuenta por Pagar por ID (incluyendo su historial de pagos)
 */
export async function getAccountPayableByIdAction(id: string) {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.get(`${BACKEND_URL}/accounts-payable/${id}`, {
            headers,
        });

        return { success: true, data: response.data };
    } catch (error: any) {
        if (error.response) {
            return {
                success: false,
                error: error.response.data?.message || "Error al obtener la cuenta por pagar.",
            };
        }
        return { success: false, error: "Error crítico de red en el servidor." };
    }
}

/**
 * Crear o Actualizar una Cuenta por Pagar
 */
export async function saveAccountPayableAction(
    formData: CreateAccountPayableDto,
    id?: string | null
) {
    try {
        const url = id
            ? `${BACKEND_URL}/accounts-payable/${id}`
            : `${BACKEND_URL}/accounts-payable`;
        const headers = await getAuthHeaders();

        const response = id
            ? await axios.patch(url, formData, { headers })
            : await axios.post(url, formData, { headers });

        return { success: true, data: response.data };
    } catch (error: any) {
        if (error.response) {
            return {
                success: false,
                error:
                    error.response.data?.message || "Error al procesar la cuenta por pagar.",
            };
        }
        return { success: false, error: "Error crítico de red en el servidor." };
    }
}

/**
 * Registrar un nuevo Abono / Pago a una Cuenta por Pagar existente
 */
export async function addPayablePaymentAction(
    payableId: string,
    paymentData: CreatePayablePaymentDto
) {
    try {
        const url = `${BACKEND_URL}/accounts-payable/${payableId}/payments`;
        const headers = await getAuthHeaders();

        const response = await axios.post(url, paymentData, { headers });

        return { success: true, data: response.data };
    } catch (error: any) {
        if (error.response) {
            return {
                success: false,
                error: error.response.data?.message || "Error al registrar el abono.",
            };
        }
        return { success: false, error: "Error crítico de red en el servidor." };
    }
}

/**
 * Eliminar o Cancelar una Cuenta por Pagar
 */
export async function deleteAccountPayableAction(
    id: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const headers = await getAuthHeaders();

        await axios.delete(`${BACKEND_URL}/accounts-payable/${id}`, { headers });

        return { success: true };
    } catch (error: any) {
        if (error.response) {
            return {
                success: false,
                error:
                    error.response.data?.message || "No se pudo eliminar la cuenta por pagar.",
            };
        }
        return { success: false, error: "Error al comunicar la baja al servidor." };
    }
}