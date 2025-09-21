export interface IThemeStore {
    theme: 'dark' | 'light';
    customSwipeSettings: boolean;
    animateRoute: boolean;
    musicVolume: string,
    soundVolume: string,
    voiceVolume: string,
    clientInfo: {
        platform: string,
        version: string,
        app: string
    }
}