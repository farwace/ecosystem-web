import {detectLaunchContext} from './detect-launch';

export const launchContext = detectLaunchContext(window.location.search, import.meta.env.DEV);
export const isWeb = launchContext === 'web';
export const capabilities = Object.freeze({
    vkSocial: !isWeb,
    payments: !isWeb,
    rewardedAds: !isWeb,
    stories: !isWeb,
});
