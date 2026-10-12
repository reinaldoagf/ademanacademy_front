// src/app/actions/user.ts
"use server";

import axios from "axios";
import { FetchUsersParams } from "@/types/user";
import { getAuthHeaders, getAuthHeadersForMultipart } from "@/helpers/auth-headers";
import FormDataNode from "form-data";

const BACKEND_URL = process.env.NEST_BACKEND_URL || "http://localhost:3000";

export async function completeOnboardingAction(formData: FormData) {
    try {
        const headers = await getAuthHeadersForMultipart();

        // 🚀 Creamos una instancia de FormData limpia del lado del servidor de Node.js
        const backendForm = new FormDataNode();

        const profileType = formData.get("profileType") as string;
        const isEnrolled = formData.get("isEnrolled") === "true";
        const studentId = formData.get("studentId") as string;

        // Añadimos campos básicos de forma segura
        backendForm.append("profileType", profileType);
        backendForm.append("isEnrolled", String(isEnrolled));

        if (studentId) {
            backendForm.append("studentId", studentId);
        }

        if (profileType === "Representante") {
            const occupation = formData.get("representativeOccupation");
            const students = formData.get("representedStudents");
            const payment = formData.get("payment");

            if (occupation) backendForm.append("representativeOccupation", occupation);
            if (students) backendForm.append("representedStudents", students);
            if (payment) backendForm.append("payment", payment);

            const file = formData.get("receiptFile") as File | null;
            if (file && file.size > 0) {
                const buffer = Buffer.from(await file.arrayBuffer());
                backendForm.append("receiptFile", buffer, {
                    filename: file.name,
                    contentType: file.type,
                });
            }
        } else {
            // Si es student y NO está matriculado, procesamos pago y archivo
            if (!isEnrolled) {
                const payment = formData.get("payment");
                if (payment) backendForm.append("payment", payment);

                const file = formData.get("receiptFile") as File | null;
                if (file && file.size > 0) {
                    const buffer = Buffer.from(await file.arrayBuffer());
                    backendForm.append("receiptFile", buffer, {
                        filename: file.name,
                        contentType: file.type,
                    });
                }
            }
        }

        // 3. Enviamos a NestJS combinando los headers dinámicos del Multipart
        const response = await axios.post(
            `${BACKEND_URL}/users/complete-onboarding`,
            backendForm,
            {
                headers: {
                    ...headers,
                    ...backendForm.getHeaders() // Inyecta el multipart/form-data con su boundary correcto
                }
            }
        );

        return { success: true, data: response.data };
    } catch (error: any) {
        console.log("Error en completeOnboardingAction:", error.response?.data || error);
        return {
            success: false,
            error: error.response?.data?.message || "Ocurrió un error al guardar tu perfil."
        };
    }
}

export async function getAllUsersAction(params: FetchUsersParams) {
    try {
        const headers = await getAuthHeaders();
        // Axios limpiará automáticamente las propiedades undefined
        const response = await axios.get(`${BACKEND_URL}/users`, {
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

export async function requestAccountLinkingAction(email: string) {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.post(
            `${BACKEND_URL}/users/request-account-linking`,
            { email },
            { headers }
        );
        return { success: true, data: response.data };
    } catch (error: any) {
        console.error("Error al solicitar vinculación:", error.response?.data || error);

        // 🔥 Esto extrae exactamente el BadRequestException o InternalServerErrorException de NestJS
        const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Error de conexión al solicitar el código.";

        return {
            success: false,
            error: Array.isArray(errorMessage) ? errorMessage[0] : errorMessage
        };
    }
}

export async function confirmAccountLinkingAction(email: string, otpCode: string) {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.post(
            `${BACKEND_URL}/users/confirm-account-linking`,
            { email, otpCode },
            { headers }
        );
        return { success: true, data: response.data };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.message || "Error al confirmar la vinculación de cuenta."
        };
    }
}
