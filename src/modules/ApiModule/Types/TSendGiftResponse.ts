import type {TGift} from "@/stores/Ecosystem/Types/TGift.ts";

export type TSendGiftResponse = {
    giftsCount: number;
    recentGifts: TGift[];
    receiverId: number;
}