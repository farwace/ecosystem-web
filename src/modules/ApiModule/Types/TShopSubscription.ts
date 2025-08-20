export type TShopSubscription = {
    additionalBonus?: number | null,
    code: string,
    dailyCoinsBonus: number,
    description: string,
    subtitle: string,
    name: string,
    oldPrice: number,
    personalAccess: boolean,
    price: number,
    sort: number,
    trialDuration?: number | null,
    imageUrl?: string | null,
}