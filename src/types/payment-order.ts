import { Client } from "@/types/client";
import { Order } from "@/types/order";
import { SeatingMapElement } from "@/types/seating-map";
import { User } from "@/types/user";
import { EventData } from "@/types/event";
import { Transaction } from "@/types/transaction";
export interface PaymentOrder {
    id: string;
    concept: string;
    amount: number | string;
    dueDate?: string | Date | null;
    status: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    user?: User | null;
    client?: Client | null;
    order?: Order | null;
    transactions?: Array<Transaction>;
    eventSeats?: Array<{
        id: string;
        status: string;
        event?: EventData;
        seatingMapElement?: SeatingMapElement;
    }>;
}
export interface FetchPaymentOrdersParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    concept?: string;
}