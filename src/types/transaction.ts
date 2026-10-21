import { User } from "@/types/user";
import { Client } from "@/types/client";
import { PaymentOrder } from "@/types/payment-order";
import { S3Image } from "./s3-image";
export interface Transaction {
    id: string;
    concept: "Clase" | "Mensualidad" | "Inscripción" | "Vestuario" | "Entradas_Gala" | "Producto" | "Otro";
    method: "Transferencia" | "Tarjeta" | "Efectivo" | "Pago_Movil" | "Cheque" | "Otro";
    status: "Aprobado" | "Pendiente" | "Rechazado";
    bankName: string;
    referenceNumber: string;
    amount: number;
    imageOfPaymentReceipt?: S3Image;
    registeringUserId?: string;
    registeringUser?: User;
    clientId?: string;
    client?: Client;
    paymentOrderId?: string;
    paymentOrder?: PaymentOrder;
    createdAt: string;
    updatedAt: string;
}
export interface FetchTransactionsParams {
    page?: number;
    limit?: number;
    search?: string;
    concept?: string;
    userId?: string;
}