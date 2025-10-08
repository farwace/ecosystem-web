export type TUserProfile = {
    id: number;
    name: string;
    popularity: number;
    popularityLevel: number;
    sex: number;
    avatar: string;
    avatarBig: string;
    experience: number;
    lvl: number;
    nextLevelExperience: number;
    nextLevelPopularity: number;
    vip: boolean;
    premium: boolean;
    isAnonymous: boolean;
    online: boolean;
    topFans: any[] | null;
    topGifts: any[] | null;
    recentAchievements: any[] | null;
    giftsCount: number | null;
    animal?:string
}