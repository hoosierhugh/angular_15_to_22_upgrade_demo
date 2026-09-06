import { ICellRendererParams } from 'ag-grid-community';

export interface AliasDisplay {
    name: string;
    value: string;
    isShorten: boolean;
}

export interface SearchGridRow {
    aliasSrc?: string;
    aliasDst?: string;
    [key: string]: unknown;
}

export interface SearchGridRendererParent {
    searchQueryLoki: { rxText?: string };
    copy(value: unknown): void;
    detectChanges(): void;
    getAliasFromIp(ip: unknown): Promise<AliasDisplay>;
    openMethodForSelectedRow(...args: unknown[]): void;
    openTransactionByProfile(...args: unknown[]): void;
    openTransactionForSelectedRows(...args: unknown[]): void;
}

export type SearchGridCellParams = ICellRendererParams<
    SearchGridRow,
    unknown,
    { componentParent: SearchGridRendererParent }
>;
