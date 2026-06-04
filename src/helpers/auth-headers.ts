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