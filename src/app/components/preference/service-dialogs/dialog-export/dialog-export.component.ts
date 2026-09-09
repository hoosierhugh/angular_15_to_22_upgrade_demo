import { Component, ChangeDetectionStrategy, ViewChild, inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthenticationService } from '@app/services';

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
