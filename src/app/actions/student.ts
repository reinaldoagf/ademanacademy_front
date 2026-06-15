"use server";

import axios from "axios";
import { Student, FetchStudentsParams } from "@/types/student";
import { getAuthHeaders } from "@/helpers/auth-headers";

const BACKEND_URL = process.env.NEST_BACKEND_URL || "http://localhost:3000";

// 1. Obtener Estudiantes (Query)
export async function getStudentsAction(searchTerm?: string): Promise<{ success: boolean; data?: Student[]; error?: string }> {
    try {
        // En Axios, es mejor pasar los parámetros en el objeto 'params' en lugar de concatenar strings manualmente
        const response = await axios.get(`${BACKEND_URL}/students`, {
            params: searchTerm ? { search: searchTerm } : {},
            headers: { "Content-Type": "application/json" }
        });

        // Axios guarda la respuesta del servidor en '.data'. 
        // Si tu NestJS envuelve el resultado en un objeto { data: [...] }, usamos response.data.data
        const result = response.data;
        return { success: true, data: result.data || result };

    } catch (error: any) {
        if (error.response) {
            return {
                success: false,
                error: error.response.data?.message || "Error al obtener los estudiantes."
            };
        }
        return { success: false, error: "No se pudo conectar con el servidor." };
    }
}

// 2. Obtener Mis representados (Query)
export async function getMyRepresentedAction(searchTerm?: string): Promise<{ success: boolean; data?: Student[]; error?: string }> {
    try {
        // OBTENEMOS LOS HEADERS AUTOMÁTICAMENTE
        const headers = await getAuthHeaders();
        const queryParam = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : "";
        const { data } = await axios.get(`${BACKEND_URL}/students/my-represented${queryParam}`, { headers });

        return { success: true, data: data.data || data };
    } catch (error) {
        console.log({ error })
        return { success: false, error: "No se pudo conectar con el servidor." };
    }
}

// 4. Guardar o Actualizar Estudiante (Mutación)
export async function getAllStudentsAction(params: FetchStudentsParams) {
    try {
        const headers = await getAuthHeaders();
        // Axios limpiará automáticamente las propiedades undefined
        const response = await axios.get(`${BACKEND_URL}/students`, {
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

// 5. Guardar o Actualizar Estudiante (Mutación)
export async function saveStudentAction(formData: Omit<Student, 'id'>, id?: string | null) {
    try {
        const url = id ? `${BACKEND_URL}/students/${id}` : `${BACKEND_URL}/students`;
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
                error: error.response.data?.message || "Error al procesar el estudiante."
            };
        }

        // Error en caso de que el servidor de NestJS esté apagado o no haya internet
        return { success: false, error: "Error crítico de red en el servidor." };
    }
}

// 6. Eliminar Estudiante (Mutación)
export async function deleteStudentAction(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const headers = await getAuthHeaders(); // Inyectamos cabeceras para validar permisos en el backend si es necesario

        await axios.delete(`${BACKEND_URL}/students/${id}`, { headers });

        return { success: true };

    } catch (error: any) {
        if (error.response) {
            return {
                success: false,
                error: error.response.data?.message || "No se pudo eliminar el estudiante."
            };
        }
        return { success: false, error: "Error al comunicar la baja al servidor." };
    }
}
