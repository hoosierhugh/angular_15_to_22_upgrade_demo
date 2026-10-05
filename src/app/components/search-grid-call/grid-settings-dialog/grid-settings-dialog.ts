import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Functions, setStorage } from '@app/helpers/functions';
import { UserConstValue } from '../../../models/const-value.model';
import { TranslateService } from '@ngx-translate/core';
import type { ColDef, ColumnState, GridApi } from 'ag-grid-community';
import type { DragDropItem, DragDropOrderEvent } from '@app/components/controls/custom-ag-grid/drag-drop-list/drag-drop-list.component';
import type { GridSizeSettings } from '../grid-controller';

type GridSettingsSizeOption = 'sizeToFit' | 'sizeToFitContinuos' | 'sizeColumnsToFit';

interface GridSettingsColumn {
    name: string;
    field: string;
    selected: boolean;
    idx: number;
}

export interface DialogData {
    apicol: GridApi<unknown>;
    apipoint: GridApi<unknown>;
    columns: ColDef<unknown>[];
    idParent?: string;
    agGridSizeControl: GridSizeSettings;
    protocol_id?: string;
}

@Component({
    selector: 'app-grid-setting-dialog',
    templateUrl: 'grid-settings-dialog.html',
    styleUrls: ['./grid-settings-dialog.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class DialogSettingsGridDialog {
    dialogRef = inject<MatDialogRef<DialogSettingsGridDialog>>(MatDialogRef);
    translateService = inject(TranslateService);
    data = inject<DialogData>(MAT_DIALOG_DATA);

    public apiColumn: GridApi<unknown>;
    apiPoint: GridApi<unknown>;
    id: string;
    protocol_id;
    public radioSizeType = [
        {
            type: 'sizeToFit',
            title: 'Size To Fit Columns on Load',
        },
        {
            type: 'sizeToFitContinuos',
            title: 'Size To Fit Columns',
        },
        {
            type: 'sizeColumnsToFit',
            title: 'Size To Fit Content',
        },
        {
            type: 'none',
            title: 'Manual sizing',
        }
    ];
    selectedType: string;
    agGridSizeControl: GridSizeSettings;
    allColumnIds: GridSettingsColumn[] = [];
    _bufferData: GridSettingsColumn[] = [];
    constructor() {
        const translateService = this.translateService;
        const data = this.data;

        translateService.addLangs(['en'])
        translateService.setFallbackLang('en')
        this.apiColumn = data.apicol;
        this.apiPoint = data.apipoint;
        this.protocol_id = data.protocol_id;
        this.id = data.idParent;
        this.agGridSizeControl = data.agGridSizeControl;
        this.allColumnIds = this.apiColumn.getAllGridColumns()
            .flatMap((column, index): GridSettingsColumn[] => {
                const field = column.getColDef().field;
                if (typeof field !== 'string' || field === '' || field === 'id') {
                    return [];
                }
                return [{
                    name: column.getColDef().headerName ?? field,
                    field,
                    selected: column.isVisible(),
                    idx: index
                }];
            });
        this._bufferData = Functions.cloneObject(this.allColumnIds);
    }
    get hasColumns(): boolean {
        return this.apiColumn.getAllGridColumns().length > 0;
    }

    onUpdateProto({ event: { container } }: DragDropOrderEvent): void {
        if (this.hasColumns) {
            const activeListView = container.id === 'activeListView' ? container : null;
            const inactiveListView = container.id === 'inactiveListView' ? container : null;
            const columnState: ColumnState[] = this.apiColumn.getColumnState();
            const setVisible = (fName: string | undefined, visible: boolean | undefined): void => {
                if (!fName || visible === undefined) {
                    return;
                }
                if (columnState.find(({ colId }) => colId === fName)?.hide === visible) {
                    this.apiColumn.setColumnsVisible([fName], visible);
                }
            };
            inactiveListView?.data.forEach(({ field, selected }: DragDropItem) => setVisible(field, selected));
            activeListView?.data.forEach(({ field, selected }: DragDropItem, key: number) => {
                setVisible(field, selected);
                if (field) {
                    this.apiColumn.moveColumns([field], key + 1);
                }
            });

            const id = (this.id ? `-${this.id}` : '') + `-${this.protocol_id}`;
            const lsIndexUser = UserConstValue.RESULT_STATE + id;
            setStorage(lsIndexUser, this.apiColumn.getColumnState());

            setTimeout(() => Functions.emitWindowResize(), 100);
        }
    }

    onChangeSizeToFit(event: boolean, type: GridSettingsSizeOption): void {
        this.agGridSizeControl[type] = event;
        if (this.agGridSizeControl[type] && type === 'sizeToFit') {
            this.apiPoint.sizeColumnsToFit();
        }
        if (this.agGridSizeControl[type] && type === 'sizeColumnsToFit') {
            this.autoSizeAll(true);
        }
    }
    private autoSizeAll(skipHeader: boolean): void {
        const allColumnIds = this.apiColumn.getAllGridColumns().map(column => column.getColId());
        this.apiColumn.autoSizeColumns(allColumnIds, skipHeader);
    }
    onNoClick(): void {
        this.dialogRef.close();
    }
}
