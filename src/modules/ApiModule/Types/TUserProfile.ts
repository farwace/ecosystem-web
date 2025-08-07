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
    topFans: any[];//todo: описать тип
    topGifts: any[];//todo: описать тип
    lastAchievements: any[];//todo: описать тип
}