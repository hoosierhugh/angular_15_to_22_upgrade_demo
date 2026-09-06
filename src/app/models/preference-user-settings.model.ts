export interface PreferenceUsersSettings {
    category: string;
    data: {
        id?: string;
        isTab?: boolean;
        name?: string;
        param?: string;
        [key: string]: unknown;
    };
    setting: unknown;
    guid: string;
    id: number;
    param: string;
    partid: number;
    username: string;
    type?: string;
}
