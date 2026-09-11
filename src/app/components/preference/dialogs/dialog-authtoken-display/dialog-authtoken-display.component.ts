import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthenticationService } from '@app/services';
import { TranslateService } from '@ngx-translate/core'

@Component({
    selector: 'app-dialog-authtoken-display',
    templateUrl: './dialog-authtoken-display.component.html',
    styleUrls: ['./dialog-authtoken-display.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})

export class DialogAuthTokenDisplayComponent {
    private authService = inject(AuthenticationService);
    translateService = inject(TranslateService);
    dialogRef = inject<MatDialogRef<DialogAuthTokenDisplayComponent>>(MatDialogRef);
    data = inject<{
    data: {
        token: string;
    };
}>(MAT_DIALOG_DATA);

    token: string;
    isAdmin = false;
    constructor() {
        const translateService = this.translateService;
        const data = this.data;

        translateService.addLangs(['en'])
        translateService.setFallbackLang('en')
        this.token = data.data.token;
        const userData = this.authService.currentUserValue;
        this.isAdmin = !!userData?.user?.admin;
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}

