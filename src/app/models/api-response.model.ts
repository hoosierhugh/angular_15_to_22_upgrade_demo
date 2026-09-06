export interface ApiResponse<T> {
    data: T;
    count?: number;
    message?: string;
    status?: string;
}
