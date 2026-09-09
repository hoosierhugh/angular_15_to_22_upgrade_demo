import { WidgetModel } from './widget.model';

export interface UserSettings {
    guid?: string;
    uuid?: string;
    username: string;
    partid: number;
    category: string;
    param: string;
    data: {
        id: string;
        name: string;
        alias: string;
        selectedItem: string;
        title: string;
        weight: number;
        widgets: WidgetModel[];
        config: {
            margins: number[];
            columns: string;
            pushing: boolean;
            draggable: {
                handle: string;
            };
            resizable: {
                enabled: boolean;
                handles: string[];
            }
        }
    }
}
