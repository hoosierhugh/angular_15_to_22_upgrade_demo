import { Component, ChangeDetectionStrategy } from '@angular/core';
import { IHeaderParams } from 'ag-grid-community';
import { MatDialog } from '@angular/material/dialog';
import { DialogSettingsGridDialog } from '../grid-settings-dialog/grid-settings-dialog';


@Component({
    template: `
        <div class="user-actions">
            <a (click)="onCheckAllClick()" class="material-icons md-18">done_outline</a>
        </div>`,
    styles: [
        `.btn { line-height: 0.5 }`
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})

export class HeaderActionRenderer {
    public params: IHeaderParams;
    constructor(public dialog: MatDialog) {
        console.groupEnd();
    }

    agInit(headerParams: IHeaderParams): void {
        this.params = headerParams;
    }

    public onCheckAllClick() {
        let allSelected = true;
        this.params.api.forEachNode(node => {
            allSelected = allSelected && node.isSelected() === true;
        });

        if (!allSelected) {
            this.params.api.selectAll();
        } else {
            this.params.api.deselectAll();
        }
    }
}
