import { S3Image } from "./s3-image";

export interface ClientPurchaseSeatsPayload {
    eventId: string;
    seatingMapElementIds: string[];
    totalAmount: number;
    bankName: string;
    referenceNumber: string;
    imageOfPaymentReceipt: S3Image | null;
}