export type TSimpleError = {
    code?:string,
    message:string,
    level?: "fatal" | "error" | "warning" | "log" | "info" | "debug"
}