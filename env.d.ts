/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_ENDPOINT: string
    readonly VITE_VK_APP_ID: number
    readonly VITE_API_VERSION:string
    readonly VITE_ENVELOP: "development" | string
    readonly VITE_VK_USER_ID: string
    readonly VITE_VK_AUTH_STRING: string
}