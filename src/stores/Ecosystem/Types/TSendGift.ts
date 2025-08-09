import type {TGift} from "@/stores/Ecosystem/Types/TGift.ts";

export type TSendGift = {
    gift: TGift;
    quantity: number;
    receiverId: number;
    senderId: number;
    userId: number;
}