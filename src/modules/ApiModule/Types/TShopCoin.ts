export type TShopCoin = {
    code: string,
    description: string,
    id: number,
    imageUrl?: string | null,
    name: string,
    oldPrice?: number | null,
    price: number,
    sort: number
}