import { User } from "./user";
export interface Notification {
    id: string;
    title: string;
    message: string;
    link?: string;
    channel: "En_la_App" | "Whatsapp" | "Ambos";
    status: "Pendiente" | "Enviado" | "Leido" | "Fallido";
    recipientPhone?: string;
    metadata?: any;
    // Relación opcional con el Usuario destinatario
    userId: String; // Opcional, pero para el FK debe existir
    user?: User; // Opcional
    createdAt: string;
    updatedAt: string;
}

export interface FetchNotificationsParams {
    page?: number;
    limit?: number;
    search?: string;
    ownerFilter?: Boolean;
}