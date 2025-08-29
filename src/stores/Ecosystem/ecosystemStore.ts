import {defineStore} from "pinia";
import type {IEcosystemStore} from "@/stores/Ecosystem/IEcosystemStore";
import {AgeGroup} from "@/stores/Ecosystem/IEcosystemStore";

export const ecosystemStore = defineStore('ecosystem', {
    state:():IEcosystemStore => ({

        authString: '',
        connectionId: '',

        /* USER INFO */
        id: 0,
        firstName: '',
        lastName: '',
        balance: 0,
        socialId: 0,
        experience: 0,
        nextLevelExperience: 60,
        nextLevelPopularity: 1000,
        lvl: 0,
        popularity: 0,
        popularityLevel: 0,
        sex: 2,
        avatar: '',
        ageGroup: AgeGroup['zoomer'],
        hasNotifications: false,
        isNew: false,
        vipLevel: 0,
        isBanned: false,
        vip: false,

        currentDay: 'monday',
        dailyEnter: undefined,
        consecutiveDays: undefined,
        isAnonymous: undefined,
        balanceGift: undefined,
        // topGifts: undefined,
        // topFans: undefined,
        visitors: undefined,
        subscription: undefined,
        canUseTrialSubscription: false,

        /*  COMMON INFO */
        // recentGifts: [],
        // recentAchievements: [],
        // recentFans: [],
        // recentLiked: [],
        //topRatingPerson: 'https://vk.com/images/camera_200.png',

        giftList: [],
        achievementsList: [],

        animal: 'tiger',
        animals: [],
        authAccess: {
            scope: [],
            requestedScope: [],
        }
    })
})