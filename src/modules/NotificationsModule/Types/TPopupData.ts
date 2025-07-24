export type TPopupData = {
    title?:string,
    noTitle?:boolean,
    subtitle?:string,
    noClose?:boolean,
    noCloseButton?:boolean,
    noPaddings?:boolean,
    class?:string,
    backgroundBlur?: boolean,
    backdropBlur?:boolean,
    darkBg?:boolean,
} | {[key:string]:any}
