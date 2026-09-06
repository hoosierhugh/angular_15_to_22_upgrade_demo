import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AlertService } from '@app/services';
import { TranslateService } from '@ngx-translate/core'

interface DeleteAlertDialogData {
    data: {
        message: string;
        page: string;
        isToken?: boolean;
    };
}

@Component({
    selector: 'app-dialog-delete-alert',
    templateUrl: './dialog-delete-alert.component.html',
    styleUrls: ['./dialog-delete-alert.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogDeleteAlertComponent {
    message: string;
    page: string;
    isToken: boolean;
    constructor(
        public dialogRef: MatDialogRef<DialogDeleteAlertComponent>,
        public translateService: TranslateService,
        public alertService: AlertService,
        @Inject(MAT_DIALOG_DATA) public data: DeleteAlertDialogData) {
        translateService.addLangs(['en'])
        translateService.setDefaultLang('en')
        this.message = data.data.message;
        this.page = data.data.page;
        this.isToken = data.data.isToken;
    }
    onAlert() {
        this.alertService.success(`${this.page} ${this.message} successful`);
    }
    onNoClick(): void {

        this.dialogRef.close();
    }
}

