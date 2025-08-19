export type TShopSubscription = {
    additionalBonus?: number | null,
    code: string,
    dailyCoinsBonus: number,
    description: string,
    name: string,
    oldPrice: string,
    personalAccess: boolean,
    price: number,
    sort: number,
    trialDuration?: number | null,
    imageUrl?: string | null,
}