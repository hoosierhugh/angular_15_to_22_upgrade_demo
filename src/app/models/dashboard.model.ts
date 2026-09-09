import { DashboardContentModel } from './dashboard-content.model';
import { GridType } from 'angular-gridster2';

export interface DashboardGridConfig {
    columns?: number;
    maxrows?: number;
    pushing?: boolean;
    grafanaTimestamp?: boolean;
    grafanaProxy?: boolean;
    hasVariables?: boolean;
    ignoreMinSize?: string;
    gridType?: GridType;
}

export interface DashboardData {
    id?: string;
    dashboardId?: string;
    name?: string;
    param?: string;
    type?: number;
    shared?: boolean | number;
    isLocked?: boolean;
    isTab?: boolean;
    config?: DashboardGridConfig;
    widgets?: DashboardContentModel[];
}

export interface DashboardModel {
    // id: number;
    // username: string;
    dashboard: DashboardContentModel[];

    category: string;
    create_date: string;
    data: DashboardData;
    id: number;
    param: string;
    partid: number;
    username: string;
    owner: string;
    widgets?: DashboardContentModel[];
}
