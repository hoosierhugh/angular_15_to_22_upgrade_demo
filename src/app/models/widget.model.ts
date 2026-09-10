export interface WidgetModel {
    name: string;
    identifier: string;
    reload?: boolean;
    frameless?: boolean;
    title?: string;
    group?: string;
    description?: string;
    templateUrl?: string;
    controller?: string;
    controllerAs?: string;
    sizeX?: number;
    sizeY?: number;
    config?: Record<string, unknown>;
    edit?: Record<string, unknown>;
    row?: number;
    col?: number;
    api?: Record<string, unknown>;
    uuid?:  string;
}
