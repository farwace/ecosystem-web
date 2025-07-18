import {defineStore} from "pinia";
import type {IEcosystemStore} from "@/stores/Ecosystem/IEcosystemStore";
import {AgeGroup} from "@/stores/Ecosystem/IEcosystemStore";

export const ecosystemStore = defineStore('ecosystem', {
    state:():IEcosystemStore => ({

        authString: '',

        /* USER INFO */
        id: 0,
        name: '',
        lastName: '',
        balance: 0,
        socialId: 0,
        experience: 0,
        lvl: 0,
        popularity: 0,
        popularityLevel: 0,
        sex: 'male',
        avatar: '',
        age: AgeGroup['zoomer'],
        hasNotifications: false,
        isNew: false,
        vipLevel: 0,

        /*  COMMON INFO */
        recentGifts: [],
        recentAchievements: [],
        recentFans: [],
        recentLiked: [],
        topRatingPerson: 'https://vk.com/images/camera_200.png',

        missionList: [],
        giftList: [],
        achievementsList: []
    })
})