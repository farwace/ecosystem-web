/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_ENDPOINT: string
    readonly VITE_VK_APP_ID: number
    readonly VITE_API_VERSION:string
    readonly VITE_ENVELOP: "development" | 'preprod' | string
    readonly VITE_VK_USER_ID: string
    readonly VITE_VK_AUTH_STRING: string
    readonly VITE_REVERB_APP_KEY:string
    readonly VITE_REVERB_HOST:string
    readonly VITE_REVERB_PORT:number
    readonly VITE_REVERB_TLS:string
    readonly VITE_REVERB_APP_AUTH_ENDPOINT:string
}