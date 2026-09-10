import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthenticationService } from '@app/services';
import { TranslateService } from '@ngx-translate/core'
import { CrudDialogData } from '@app/models';

interface AuthKeyDialogRecord {
    name: string;
    expire_date: Date | string;
    active: boolean;
}
@Component({
    selector: 'app-dialog-authkey',
    templateUrl: './dialog-authkey.component.html',
    styleUrls: ['./dialog-authkey.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class DialogAuthKeyComponent {
    private authService = inject(AuthenticationService);
    dialogRef = inject<MatDialogRef<DialogAuthKeyComponent>>(MatDialogRef);
    translateService = inject(TranslateService);
    data = inject<CrudDialogData<AuthKeyDialogRecord>>(MAT_DIALOG_DATA);

    isValidForm = false;
    isAdmin = false;
    regString = /^[a-zA-Z0-9\-_\s]+$/;
    name = new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
        Validators.pattern(this.regString)
    ]);
    constructor() {
        const translateService = this.translateService;
        const data = this.data;

        translateService.addLangs(['en'])
        translateService.setDefaultLang('en')
        if (data.isnew) {
            data.data = {
                name: '',
                expire_date: new Date((new Date().getTime() + (7 * 86400 * 1000))),
                active: true
            };
        }
        (d => {
            this.name.setValue(d.name);
        })(data.data);
        const userData = this.authService.currentUserValue;
        this.isAdmin = !!userData?.user?.admin;
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
    onSubmit() {
        if (!this.name.invalid) {
            (d => {
                d.name = this.name?.value;
            })(this.data.data);
            this.dialogRef.close(this.data)
        } else {
            this.name.markAsTouched();
        }
    }
}
