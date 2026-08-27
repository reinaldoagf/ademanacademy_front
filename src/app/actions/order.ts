"use server";

import axios from "axios";
import { OrderFormData, FetchOrdersParams } from "@/types/order";
import { getAuthHeaders } from "@/helpers/auth-headers";

const BACKEND_URL = process.env.NEST_BACKEND_URL || "http://localhost:3000";

export async function createOrderAction(formData: OrderFormData) {
    try {
        const { userId, items, status } = formData;

        if (!userId) {
            return { success: false, error: "Debe seleccionar un cliente." };
        }

        if (!items || items.length === 0) {
            return { success: false, error: "El carrito está vacío." };
        }

        // 🧹 SANITIZACIÓN: Limpiamos los ítems AQUÍ dentro de la Server Action
        // antes de enviarlos al backend o la base de datos.
        const cleanItems = items.map((item) => ({
            elementId: item.elementId,
            concept: item.concept,
            conceptLabel: item.conceptLabel,
            description: item.description,
            price: Number(item.price) || 0,
            quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
            ...(item.studentId ? { studentId: item.studentId } : {}),
        }));

        const body = {
            userId,
            ...(status ? { status } : {}),
            items: cleanItems, // Payload limpio hacia la API
        }

        // Enviar a Axios / Backend
        const response = await axios.post(
            `${BACKEND_URL}/orders`,
            body,
            { headers: await getAuthHeaders() }
        );

        return { success: true, data: response.data };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.message || "Error al registrar el pedido.",
        };
    }
}

export async function getAllOrdersAction(params: FetchOrdersParams) {
    try {
        const headers = await getAuthHeaders();
        // Axios limpiará automáticamente las propiedades undefined
        const response = await axios.get(`${BACKEND_URL}/orders`, {
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



export async function deleteOrderAction(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const headers = await getAuthHeaders(); // Inyectamos cabeceras para validar permisos en el backend si es necesario

        await axios.delete(`${BACKEND_URL}/orders/${id}`, { headers });

        return { success: true };

    } catch (error: any) {
        if (error.response) {
            return {
                success: false,
                error: error.response.data?.message || "No se pudo eliminar el empleado."
            };
        }
        return { success: false, error: "Error al comunicar la baja al servidor." };
    }
}