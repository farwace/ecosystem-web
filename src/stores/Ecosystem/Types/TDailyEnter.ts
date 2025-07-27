export type TDailyEnter = {
    monday: TDailyEnterInfo
    tuesday: TDailyEnterInfo
    wednesday: TDailyEnterInfo
    thursday: TDailyEnterInfo
    friday: TDailyEnterInfo
    saturday: TDailyEnterInfo
    sunday: TDailyEnterInfo
}

export type TDailyEnterInfo = {
    box3: boolean,
    box5: boolean,
    box7: boolean,
    enter: boolean,
}