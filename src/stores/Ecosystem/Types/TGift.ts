import type {TUser} from "@/stores/Ecosystem/Types/TUser.ts";

export type TGift = {
    id: number,
    code: string,
    // coinsMax: number,
    // coinsMin: number,
    name: string,
    description: string
    price: number,
    exclusive: boolean,
    oldPrice: number,
    personalPrice: number,
    // popularityMin: number,
    // popularityMax: number,
    sort: number,

    topSenderQuantity?: number,
    totalQuantity?:number,
    sender?:TUser
}