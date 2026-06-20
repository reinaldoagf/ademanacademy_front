import { cookies } from "next/headers"; // 💡 Helper nativo de Next.js
/**
 * Helper centralizado para empaquetar los Headers de forma segura
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    return {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    };
}

export async function getAuthHeadersForMultipart(): Promise<Record<string, string>> {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    return {
        // ⚠️ IMPORTANTE: No definas "Content-Type" aquí. 
        // Dejaremos que la librería form-data genere los boundaries correctos.
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    };
}