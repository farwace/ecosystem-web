export type TResponse<T> = {
    message: string;
    success: boolean;
    data: T;
};