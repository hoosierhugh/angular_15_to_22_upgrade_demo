import { Type } from '@angular/core';
import { IWidgetMetaData, IWidget } from '@app/components/widgets/IWidget';

export const WidgetArray: IWidgetMetaData[] = [];
export const WidgetArrayInstance: Record<string, IWidget> = {};

export function Widget(metaData: IWidgetMetaData): (constructor: Type<unknown>) => void {
    return function ( constructor: Type<unknown> ) {
        metaData.componentClass = constructor;
        metaData.enable = true;
        metaData.strongIndex = metaData.className;
        metaData.settingWindow = metaData.settingWindow === null || metaData.settingWindow === undefined ? true : metaData.settingWindow;
        WidgetArray.push(metaData);
    };
}
