"use server";

import axios from "axios";
import { Setting } from "@/types/setting";
import { getAuthHeaders } from "@/helpers/auth-headers";


const BACKEND_URL = process.env.NEST_BACKEND_URL || "http://localhost:3000";

export async function getSettingByKeyAction(key: string) {
    try {
        const url = `${BACKEND_URL}/settings/${key}`;
        const headers = await getAuthHeaders();

        // 🎯 Ejecutamos la petición de Axios dinámicamente según la existencia del ID
        const response = await axios.get(url, { headers })

        // 💡 Axios parsea automáticamente a JSON y lo guarda en la propiedad '.data'
        return { success: true, data: response.data };

    } catch (error: any) {
        // 🔍 Capturamos los errores devueltos estructuradamente por NestJS (400, 401, 409, 500, etc.)
        if (error.response) {
            return {
                success: false,
                error: error.response.data?.message || "Error al obtener."
            };
        }

        // Error en caso de que el servidor de NestJS esté apagado o no haya internet
        return { success: false, error: "Error crítico de red en el servidor." };
    }
}
export async function saveSettingAction(formData: Omit<Setting, 'id'>, id?: string | null) {
    try {
        const url = `${BACKEND_URL}/settings/${id}`;
        const headers = await getAuthHeaders();

        // 🎯 Ejecutamos la petición de Axios dinámicamente según la existencia del ID
        const response = await axios.patch(url, formData, { headers })

        // 💡 Axios parsea automáticamente a JSON y lo guarda en la propiedad '.data'
        return { success: true, data: response.data };

    } catch (error: any) {
        // 🔍 Capturamos los errores devueltos estructuradamente por NestJS (400, 401, 409, 500, etc.)
        if (error.response) {
            return {
                success: false,
                error: error.response.data?.message || "Error al procesar la configuración."
            };
        }

        // Error en caso de que el servidor de NestJS esté apagado o no haya internet
        return { success: false, error: "Error crítico de red en el servidor." };
    }
}