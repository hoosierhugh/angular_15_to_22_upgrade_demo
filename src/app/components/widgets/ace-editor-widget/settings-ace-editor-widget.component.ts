import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { AlertService } from '@app/services';
import { TranslateService } from '@ngx-translate/core'
import { AceEditorConfig } from './ace-editor-widget.component';

@Component({
    selector: 'app-settings-ace-editor-widget-component',
    templateUrl: 'settings-ace-editor-widget.component.html',
    styleUrls: ['./settings-ace-editor-widget.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class SettingsAceEditorWidgetComponent {
    dialogRef = inject<MatDialogRef<SettingsAceEditorWidgetComponent>>(MatDialogRef);
    dialogAlarm = inject(MatDialog);
    translateService = inject(TranslateService);
    private alertService = inject(AlertService);
    data = inject<AceEditorConfig>(MAT_DIALOG_DATA);

    readOnly = false;
    themeList: Record<string, string> = {
        'Light - Dawn': 'dawn',
        'Dark - Monokai': 'monokai'
    };

    isInvalid: boolean;
    constructor() {
        const translateService = this.translateService;

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
