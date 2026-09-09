import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
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
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class DialogDeleteAlertComponent {
    dialogRef = inject<MatDialogRef<DialogDeleteAlertComponent>>(MatDialogRef);
    translateService = inject(TranslateService);
    alertService = inject(AlertService);
    data = inject<DeleteAlertDialogData>(MAT_DIALOG_DATA);

    message: string;
    page: string;
    isToken: boolean;
    constructor() {
        const translateService = this.translateService;
        const data = this.data;

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

