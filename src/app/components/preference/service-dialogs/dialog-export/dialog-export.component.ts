import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-dialog-export',
    templateUrl: './dialog-export.component.html',
    styleUrls: ['./dialog-export.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class DialogExportComponent {
    data = inject<{
    pageId: string;
}>(MAT_DIALOG_DATA);

    pageId = 'users';


    constructor(){
            const data = this.data;

            this.pageId = data.pageId;
    }
}
