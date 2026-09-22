export type LaunchContext = 'vk' | 'web';

export function detectLaunchContext(search: string, development = false): LaunchContext {
    const params = new URLSearchParams(search);
    if (development && params.get('launch') === 'vk-stub') return 'vk';
    // A malformed VK launch must not silently fall back to browser authentication.
    return [...params.keys()].some(key => key.startsWith('vk_') || key === 'sign') ? 'vk' : 'web';
}
