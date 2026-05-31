"use server";

import { cookies } from "next/headers"; // 💡 Helper nativo de Next.js
import { Student } from "@/types/student";

const BACKEND_URL = process.env.NEST_BACKEND_URL || "http://localhost:3000";
/**
 * Helper centralizado para empaquetar los Headers de forma segura
 */
async function getAuthHeaders(): Promise<HeadersInit> {
    const cookieStore = await cookies();
    // 🔐 Extraemos el Token JWT que guardaste al hacer Login
    const token = cookieStore.get("auth_token")?.value;
    console.log({ token })
    console.log(cookieStore.get("auth_token"))
    return {
        "Content-Type": "application/json",
        // 🎯 Inyectamos el token en el formato estándar Bearer
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    };
}
// 1. Obtener Estudiantes (Query)
export async function getStudentsAction(searchTerm?: string): Promise<{ success: boolean; data?: Student[]; error?: string }> {
    try {
        const queryParam = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : "";
        const response = await fetch(`${BACKEND_URL}/students${queryParam}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            next: { revalidate: 0 } // Desactiva caché para datos en tiempo real
        });

        if (!response.ok) throw new Error();
        const result = await response.json();

        return { success: true, data: result.data || result };
    } catch {
        return { success: false, error: "No se pudo conectar con el servidor." };
    }
}

// 2. Obtener Mis representados (Query)
export async function getMyRepresentedAction(searchTerm?: string): Promise<{ success: boolean; data?: Student[]; error?: string }> {
    try {
        // OBTENEMOS LOS HEADERS AUTOMÁTICAMENTE
        const headers = await getAuthHeaders();
        const queryParam = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : "";
        console.log({ headers })
        console.log(`${BACKEND_URL}/students/my-represented${queryParam}`)
        const response = await fetch(`${BACKEND_URL}/students/my-represented${queryParam}`, {
            method: "GET",
            headers: headers,
            next: { revalidate: 0 } // Desactiva caché para datos en tiempo real
        });

        if (!response.ok) {
            // Intentamos leer el mensaje de error estructurado de NestJS
            const errorBody = await response.json().catch(() => ({}));

            console.error("❌ ERROR EN NESTJS:", {
                status: response.status,          // Ej: 401, 404, 500
                statusText: response.statusText,
                message: errorBody.message || "Error desconocido sin cuerpo"
            });

            return {
                success: false,
                error: errorBody.message || `Error del servidor (Código ${response.status})`
            };
        }
        const result = await response.json();

        return { success: true, data: result.data || result };
    } catch (error) {
        console.log({ error })
        return { success: false, error: "No se pudo conectar con el servidor." };
    }
}

// 3. Guardar o Actualizar Estudiante (Mutación)
export async function saveStudentAction(formData: Omit<Student, 'id'>, id?: string | null) {
    try {
        const url = id ? `${BACKEND_URL}/students/${id}` : `${BACKEND_URL}/students`;
        const method = id ? "PATCH" : "POST";

        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, error: data.message || "Error al procesar el estudiante." };
        }

        return { success: true, data };
    } catch {
        return { success: false, error: "Error crítico de red en el servidor." };
    }
}

// 4. Eliminar Estudiante (Mutación)
export async function deleteStudentAction(id: string) {
    try {
        const response = await fetch(`${BACKEND_URL}/students/${id}`, { method: "DELETE" });
        if (!response.ok) return { success: false, error: "No se pudo eliminar." };
        return { success: true };
    } catch {
        return { success: false, error: "Error al comunicar la baja al servidor." };
    }
}