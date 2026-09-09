import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core'
@Component({
    selector: 'app-setting-result-widget-component',
    templateUrl: 'setting-result-widget.component.html',
    styleUrls: ['./setting-result-widget.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class SettingResultWidgetComponent {
    dialogRef = inject<MatDialogRef<SettingResultWidgetComponent>>(MatDialogRef);
    translateService = inject(TranslateService);
    data = inject<{
    title: string;
    isAutoRefrasher: boolean;
}>(MAT_DIALOG_DATA);

    constructor() {
        const translateService = this.translateService;

        translateService.addLangs(['en'])
        translateService.setDefaultLang('en')
    }
    isInvalid: boolean;
    validate(event) {
        event = event.trim();
        if (event === '' || event === ' ') {
            this.isInvalid = true;
        } else {
            this.isInvalid = false;
        }
    }
    onNoClick(): void {
        this.dialogRef.close();
    }
}
