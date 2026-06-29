"use server";

import axios from "axios";
import { Schedule } from "@/types/schedule";
import { getAuthHeaders } from "@/helpers/auth-headers";

const BACKEND_URL = process.env.NEST_BACKEND_URL || "http://localhost:3000";

export async function saveScheduleAction(formData: {
    classroomId: string,
    groupId: string,
    day: string,
    newBlock: {
        id: string,
        startTime: string,
        endTime: string,
        label: string | undefined,
    },
}, id?: string | null) {
    try {
        const url = id ? `${BACKEND_URL}/schedules/${id}` : `${BACKEND_URL}/schedules`;
        const headers = await getAuthHeaders();

        // 🎯 Ejecutamos la petición de Axios dinámicamente según la existencia del ID
        const response = id
            ? await axios.patch(url, formData, { headers })
            : await axios.post(url, formData, { headers });

        // 💡 Axios parsea automáticamente a JSON y lo guarda en la propiedad '.data'
        return { success: true, data: response.data };

    } catch (error: any) {
        // 🔍 Capturamos los errores devueltos estructuradamente por NestJS (400, 401, 409, 500, etc.)
        if (error.response) {
            return {
                success: false,
                error: error.response.data?.message || "Error al procesar el horario."
            };
        }

        // Error en caso de que el servidor de NestJS esté apagado o no haya internet
        return { success: false, error: "Error crítico de red en el servidor." };
    }
}