export interface SearchCallOne {
    name: string;
    value: number;
    type: string;
    hepid: number;
    profile: string;
}

export interface SearchCallModel {
    param: {
        transaction: Record<string, unknown>;
        limit: number;
        orlogic: boolean;
        archive: boolean;
        search?: Record<string, unknown>,
        location: Record<string, unknown>;
        timezone: {
            value: number;
            name: string;
        }
    };
    timestamp: {
        from: number;
        to: number;
    };
}
