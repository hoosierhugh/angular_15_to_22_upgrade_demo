import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
    selector: 'app-url-warning-dialog',
    templateUrl: './url-warning-dialog.component.html',
    styleUrls: ['./url-warning-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class UrlWarningDialog {
    dialogRef = inject<MatDialogRef<UrlWarningDialog>>(MatDialogRef);
    data = inject(MAT_DIALOG_DATA);


    onNoClick(): void {
        this.dialogRef.close();
    }
}

