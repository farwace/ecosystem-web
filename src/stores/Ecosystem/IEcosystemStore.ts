import type {TGift} from "@/stores/Ecosystem/Types/TGift";
import type {TAchievement} from "@/stores/Ecosystem/Types/TAchievement";
import type {TUser} from "@/stores/Ecosystem/Types/TUser";
import type {TMission} from "@/stores/Ecosystem/Types/TMission";
import type {GetLaunchParamsResponse} from "@vkontakte/vk-bridge";

export interface IEcosystemStore {
    authString: string,
    launchParams?:GetLaunchParamsResponse
    id: TUser['id'],
    avatar: TUser['avatar'],
    name: TUser['name'],
    lastName: TUser['name'],
    sex: TUser['sex'],
    lvl: TUser['lvl'],
    popularity: TUser['popularity'],
    popularityLevel: TUser['popularityLevel'],
    experience: TUser['experience'],
    isNew:boolean,
    vipLevel:number,

    socialId: number,
    balance: number,
    age: TAgeGroup,
    hasNotifications: boolean,

    recentGifts: TGift[],
    recentAchievements: TAchievement[],
    recentFans: TUser[],
    recentLiked: TUser[],
    topRatingPerson: string,
    missionList: TMission[],

    giftList: TGift[],
    achievementsList: TAchievement[],
}

export enum AgeGroup {
    'zoomer' = '1',
    'millenial'= '2',
    'doomer'= '4',
    'boomer'= '8',
}
export type TAgeGroup = `${AgeGroup}`;