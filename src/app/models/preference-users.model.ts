export interface PreferenceUsers {
    username: string;
    partid: number;
    email: string;
    password?: string;
    firstname: string;
    lastname: string;
    department: string;
    usergroup: string;
    guid: string;
    version?: number;
    setting?: string | Record<string, unknown>;
    params?: {
        last_login?: string;
        last_loogin?: string;
        timestamp_change_password?: string;
    };
}
