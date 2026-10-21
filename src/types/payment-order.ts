import { Client } from "@/types/client";
import { Order } from "@/types/order";
import { SeatingMapElement } from "@/types/seating-map";
import { User } from "@/types/user";
import { EventData } from "@/types/event";
import { Transaction } from "@/types/transaction";
import { S3Image } from "./s3-image";
export interface PaymentOrder {
    id: string;
    concept: string;
    amount: number;
    dueDate: string | Date;
    status: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    registeringUser?: User | null;
    registeringUserId?: string;
    client?: Client | null;
    clientId?: string;
    order?: Order | null;
    orderId?: string;
    transactions?: Array<Transaction>;
    eventSeats?: Array<{
        id: string;
        status: string;
        event?: EventData;
        seatingMapElement?: SeatingMapElement;
    }>;
}

export interface RecordPaymentOrderPayload {
    referenceNumber: string;
    bankName: string;
    amount: number;
    imageOfPaymentReceipt: S3Image | null;
}
export interface FetchPaymentOrdersParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    concept?: string;
}