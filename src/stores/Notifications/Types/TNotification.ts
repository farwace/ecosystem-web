import type {TSimpleError} from "@/classes/types/TSimpleError";

export type TNotification = {
    message: string,
    key?:string,
    type?: TSimpleError['level'] | 'success',
    timeout?: number | false,
    hasShown?: boolean //чтобы не показывать 2 раза одно и то же
}