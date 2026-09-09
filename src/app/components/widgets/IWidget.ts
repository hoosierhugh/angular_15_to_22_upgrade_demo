import { EventEmitter, Type } from '@angular/core';

export interface IWidget {
    id: string;
    config?: unknown;
    changeSettings?: EventEmitter<unknown>;
    openDialog(): void;
    setConfig?(config: unknown): void;
    refresh?(): void;
    doSearchResult?(): void;
}

export interface IWidgetMetaData {
    category: string;
    title: string;
    description: string;
    indexName?: string;
    strongIndex?: string;
    advancedName?: string;
    subCategory?: string;
    enable?: boolean;
    componentClass?: Type<unknown>;
    settingWindow?: boolean;
    className?: string;
    submit?: boolean;
    minWidth?: number;
    minHeight?: number;
    deprecated?: boolean;
}
