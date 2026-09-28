"use server";

import axios from "axios";
import { FetchPaymentOrdersParams } from "@/types/payment-order";
import { getAuthHeaders } from "@/helpers/auth-headers";
import FormDataNode from "form-data";

const BACKEND_URL = process.env.NEST_BACKEND_URL || "http://localhost:3000";

export async function getPaymentOrderByIdAction(id: string) {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.get(`${BACKEND_URL}/payment-orders/${id}`, {
            headers: headers
        });
        return { success: true, data: response.data };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.message || "Error al conectar con la academia."
        };
    }
}

export async function getMyPaymentOrderRecordsAction(params: FetchPaymentOrdersParams) {
    try {
        const headers = await getAuthHeaders();
        // Axios limpiará automáticamente las propiedades undefined
        const response = await axios.get(`${BACKEND_URL}/payment-orders/my-orders/records`, {
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
export async function getMyPaymentOrdersAction(params: FetchPaymentOrdersParams) {
    try {
        const headers = await getAuthHeaders();
        // Axios limpiará automáticamente las propiedades undefined
        const response = await axios.get(`${BACKEND_URL}/payment-orders/my-orders`, {
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

export async function getAllPaymentOrdersAction(params: FetchPaymentOrdersParams) {
    try {
        const headers = await getAuthHeaders();
        // Axios limpiará automáticamente las propiedades undefined
        const response = await axios.get(`${BACKEND_URL}/payment-orders`, {
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

export async function recordPaymentOrderAction(formData: FormData, orderId: string) {
    try {
        const headers = await getAuthHeaders();
        // 🚀 Creamos una instancia de FormData limpia del lado del servidor de Node.js
        const backendForm = new FormDataNode();

        backendForm.append("referenceNumber", formData.get("referenceNumber"));
        backendForm.append("bankName", formData.get("bankName"));
        backendForm.append("amount", formData.get("amount"));
        const file = formData.get("receiptFile") as File | null;
        if (file && file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer()); // Convertimos el archivo a un Buffer binario de Node
            backendForm.append("receiptFile", buffer, {
                filename: file.name,
                contentType: file.type,
            });
        }
        // 3. Enviamos a NestJS combinando los headers dinámicos del Multipart
        const response = await axios.post(
            `${BACKEND_URL}/payment-orders/${orderId}/record`,
            backendForm,
            {
                headers: {
                    ...headers,
                    ...backendForm.getHeaders() // 🔥 Esto inyecta el multipart/form-data con su boundary correcto
                }
            }
        );
        return { success: true, data: response.data };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.message || "Error al conectar con la academia."
        };
    }
}