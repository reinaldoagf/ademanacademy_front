"use server";

import axios from "axios";
import { getAuthHeaders } from "@/helpers/auth-headers";

const BACKEND_URL = process.env.NEST_BACKEND_URL || "http://localhost:3000";
export async function getRevenueByCategoryMetrics() {
    try {
        const headers = await getAuthHeaders();
        // Axios limpiará automáticamente las propiedades undefined
        const response = await axios.get(`${BACKEND_URL}/metrics/revenue-by-category`, {
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
export async function getActivePreInscriptions() {
    try {
        const headers = await getAuthHeaders();
        // Axios limpiará automáticamente las propiedades undefined
        const response = await axios.get(`${BACKEND_URL}/metrics/active-pre-inscriptions`, {
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
export async function getBorrowedCostumes() {
    try {
        const headers = await getAuthHeaders();
        // Axios limpiará automáticamente las propiedades undefined
        const response = await axios.get(`${BACKEND_URL}/metrics/borrowed-costumes`, {
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
export async function getBalanceMetrics(params?: { startDate?: string; endDate?: string }) {
    try {
        const headers = await getAuthHeaders();
        // Axios limpiará automáticamente las propiedades undefined
        const response = await axios.get(`${BACKEND_URL}/metrics/balance-chart`, {
            headers: headers,
            params: {
                startDate: params?.startDate,
                endDate: params?.endDate,
            },
        });

        return { success: true, data: response.data.data, meta: response.data.meta };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.message || "Error al conectar con la academia."
        };
    }
}

export async function getAcademicCalendarEvents(yearParam?: number, monthParam?: number) {
    try {
        const headers = await getAuthHeaders();
        // Axios limpiará automáticamente las propiedades undefined
        const response = await axios.get(`${BACKEND_URL}/metrics/academic-calendar-events`, {
            headers: headers,
            params: {
                yearParam: yearParam,
                monthParam: monthParam,
            },
        });

        return { success: true, data: response.data.data, meta: response.data.meta };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.message || "Error al conectar con la academia."
        };
    }
}

export async function getCostumeInventoryMetrics() {
    try {
        const headers = await getAuthHeaders();
        // Axios limpiará automáticamente las propiedades undefined
        const response = await axios.get(`${BACKEND_URL}/metrics/costume-inventory`, {
            headers: headers,
        });

        return { success: true, data: response.data.data, meta: response.data.meta };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.message || "Error al conectar con la academia."
        };
    }
}
