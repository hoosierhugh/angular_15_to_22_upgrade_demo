import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
// import 'brace';
// import 'brace/mode/text';
// import 'brace/theme/github';
import { TranslateService } from '@ngx-translate/core'
import { CrudDialogData } from '@app/models';

interface ScriptDialogRecord {
    data: unknown;
    profile: string;
    hepid: number | string;
    hep_alias: string;
    partid: number | string;
    type: string;
    status: boolean;
}
@Component({
    selector: 'app-dialog-scripts',
    templateUrl: './dialog-scripts.component.html',
    styleUrls: ['./dialog-scripts.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})

export class DialogScriptsComponent {
    dialogRef = inject<MatDialogRef<DialogScriptsComponent>>(MatDialogRef);
    translateService = inject(TranslateService);
    data = inject<CrudDialogData<ScriptDialogRecord>>(MAT_DIALOG_DATA);

    isValidForm = false;
    isAdmin = false;
    regNum = /^[0-9]+$/;
    regString = /^[a-zA-Z0-9\-_]+$/;

    partid = new FormControl<string | number>('', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(3),
        Validators.min(1),
        Validators.max(100),
        Validators.pattern(this.regNum)
    ]);

    hep_alias = new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
        Validators.pattern(this.regString),
    ]);
    profile = new FormControl('', [
        Validators.required,
        Validators.minLength(3)
    ]);
    hepid = new FormControl<string | number>('', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(4),
        Validators.min(1),
        Validators.max(10000),
        Validators.pattern(this.regNum)
    ]);
    type = new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
        Validators.pattern(this.regString),
    ]);

    constructor() {
        const translateService = this.translateService;
        const data = this.data;

        translateService.addLangs(['en'])
        translateService.setFallbackLang('en')
        if (data.isnew) {
            data.data = {
                data: {},
                profile: '',
                hepid: 10,
                hep_alias: '',
                partid: 10,
                type: '',
                status: true
            };
        }

        data.data.data = data.isnew ?
            '{}' :
            (typeof data.data.data === 'string' ?
                data.data.data :
                JSON.stringify(data.data.data, null, 4)
            );
        (d => {
            this.partid.setValue(d.partid)
            this.hep_alias.setValue(d.hep_alias);
            this.hepid.setValue(d.hepid);
            this.profile.setValue(d.profile);
            this.type.setValue(d.type);
        })(data.data);

        if (!this.isAdmin) {
            this.partid.disable({ emitEvent: false });
            this.hep_alias.disable({ emitEvent: false });
            this.hepid.disable({ emitEvent: false });
            this.profile.disable({ emitEvent: false });
            this.type.disable({ emitEvent: false });
        }
        this.isValidForm = true;
    }
    disableClose(e) {
        this.dialogRef.disableClose = e;
    }
    onNoClick(): void {
        this.dialogRef.close();
    }
    onSubmit() {
        if (!this.partid?.invalid &&
            !this.hep_alias?.invalid &&
            !this.hepid?.invalid &&
            !this.profile?.invalid &&
            !this.type?.invalid
        ) {
            (d => {
                d.partid = this.partid?.value;
                d.hep_alias = this.hep_alias?.value;
                d.hepid = this.hepid?.value;
                d.profile = this.profile?.value;
                d.type = this.type?.value;

            })(this.data.data);
            this.dialogRef.close(this.data);
        } else {
            this.partid.markAsTouched();
            this.hep_alias.markAsTouched();
            this.hepid.markAsTouched();
            this.profile.markAsTouched();
            this.type.markAsTouched();

        }
    }
    import(text) {
        this.data.data.data = text;
    }
}
