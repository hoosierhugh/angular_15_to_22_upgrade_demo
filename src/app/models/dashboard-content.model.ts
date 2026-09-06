import { Type } from '@angular/core';

export interface DashboardWidgetConfig {
    title?: string;
    config?: {
        protocol_id?: { value?: number | string };
        protocol_profile?: { value?: string };
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

export interface DashboardContentModel {
    id?: string;
    cols: number;
    rows: number;
    y: number;
    x: number;
    component?: Type<unknown>;
    name: string;
    title?: string;
    config?: DashboardWidgetConfig;
    output?: Record<string, (...args: unknown[]) => unknown>;
    strongIndex?: string;
    minItemCols?: number;
    minItemRows?: number;
    minHeight?: number;
    minWidth?: number;
    isWarning?: boolean;
    isDismissed?: boolean;
    tabGroup?: string;
    activeTab?: boolean;
    layerIndex?: number;
}
