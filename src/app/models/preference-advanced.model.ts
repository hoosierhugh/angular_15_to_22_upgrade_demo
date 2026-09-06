export interface AdvancedSettingData {
    data?: unknown;
    format?: string;
    host?: string;
    openwindow?: boolean;
    rtcp_mos_lost?: string;
    searchAllNode?: boolean;
    src?: string;
    tabpositon?: string;
    [key: string]: unknown;
}

export interface PreferenceAdvanced {
    category: string;
    data: AdvancedSettingData;
    guid: string;
    param: string;
    partid: number;
    type?: string;
}
