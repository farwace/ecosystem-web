export type TAchievement = {
    id: number,
    code: string,
    title: string,
    description: string,
    progress?:number,
    needToGet: number,
    progressPercent: number,
}