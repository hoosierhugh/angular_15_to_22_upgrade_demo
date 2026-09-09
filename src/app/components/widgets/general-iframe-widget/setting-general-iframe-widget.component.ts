import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SelectList } from '../influxdbchart-widget/setting-influxdbchart-widget.component';
import { TranslateService } from '@ngx-translate/core'

interface GeneralIframeSettingsData {
    title: string;
    url: string;
    desc: string;
    refresh: boolean;
}
@Component({
    selector: 'app-iframe-rsearch-widget-component',
    templateUrl: 'setting-general-iframe-widget.component.html',
    styleUrls: ['./setting-general-iframe-widget.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})

export class SettingGeneralIframeWidgetComponent {
    dialogRef = inject<MatDialogRef<SettingGeneralIframeWidgetComponent>>(MatDialogRef);
    translateService = inject(TranslateService);
    data = inject<GeneralIframeSettingsData>(MAT_DIALOG_DATA);


    dashboardList: SelectList[] = [];
    panelList: SelectList[] = [];
    dashboardSource: string | null;
    panelListValue: string | null;

    isInvalid: boolean;
    constructor() {
        const translateService = this.translateService;

        translateService.addLangs(['en'])
        translateService.setDefaultLang('en')
    }

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
