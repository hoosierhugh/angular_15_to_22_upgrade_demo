import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { AlertService } from '@app/services';
import { TranslateService } from '@ngx-translate/core'

@Component({
    selector: 'app-settings-ace-editor-widget-component',
    templateUrl: 'settings-ace-editor-widget.component.html',
    styleUrls: ['./settings-ace-editor-widget.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsAceEditorWidgetComponent {
    readOnly = false;
    themeList: { [key: string]: string } = {
        'Light - Dawn': 'dawn',
        'Dark - Monokai': 'monokai'
    };

    isInvalid: boolean;
    constructor(
        public dialogRef: MatDialogRef<SettingsAceEditorWidgetComponent>,
        public dialogAlarm: MatDialog,
        public translateService: TranslateService,
        private alertService: AlertService,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        translateService.addLangs(['en'])
        translateService.setDefaultLang('en')
    }

    scriptValidate() {
        if(this.data.text.length > 20000 && !this.readOnly) {
            this.readOnly = true;
            
            this.alertService.warning({isTranslation: true, message:'notifications.warning.textTooLong'});
        };
    }
    onNoClick(): void {
        this.dialogRef.close();
    }
    validate(event) {
        event = event.trim();
        if (event === '' || event === ' ') {
            this.isInvalid = true;
        } else {
            this.isInvalid = false;
        }
    }
}
