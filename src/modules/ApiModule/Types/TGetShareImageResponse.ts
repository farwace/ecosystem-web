export type TGetShareImageResponse = {
    key: string;
    attachment: {
        text: string;
        type: string;
        url: string;
    },
    background_type: string;
    locked: boolean;
    blob: string;
}