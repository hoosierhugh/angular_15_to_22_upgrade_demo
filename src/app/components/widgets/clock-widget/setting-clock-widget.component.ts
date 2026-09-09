import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { TranslateService } from '@ngx-translate/core'
import { ClockConfig } from './clock-widget.component';

import * as _moment from 'moment-timezone';
const moment = _moment;

interface ClockSettingsData extends Pick<ClockConfig,
    'title' | 'location' | 'showDate' | 'fontSizeClock' | 'fontSizeDate' | 'showAnalog'> {
    name: string;
    desc: string;
    offset?: number;
}
@Component({
    selector: 'app-setting-clock-widget-component',
    templateUrl: 'setting-clock-widget.component.html',
    styleUrls: ['./setting-clock-widget.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})

export class SettingClockWidgetComponent {
    private cdr = inject(ChangeDetectorRef);
    translateService = inject(TranslateService);
    dialogRef = inject<MatDialogRef<SettingClockWidgetComponent>>(MatDialogRef);
    data = inject<ClockSettingsData>(MAT_DIALOG_DATA);

    arrayTimeZones: string[] = [];
    arrayClockType: string[] = ['Digital', 'Analog', 'Both'];
    minSize = 8;
    maxSize = 100;
    constructor() {
        const translateService = this.translateService;

        translateService.addLangs(['en'])
        translateService.setDefaultLang('en')
        this.arrayTimeZones = moment.tz.names();
    }
    onSelectTimeZone(timeZone) {
        this.data.offset = moment.tz(timeZone).utcOffset();
        this.data.name = timeZone;
        this.data.desc = timeZone;
        this.data.location.offset = moment.tz(timeZone).utcOffset();
        this.data.location.name = timeZone;
        this.data.location.desc = timeZone;
        this.cdr.detectChanges();
    }
    validateValue(fontSize) {
        return fontSize > this.maxSize ? this.maxSize : fontSize < this.minSize ? this.minSize : fontSize;
    }
    onChange() {
        this.cdr.detectChanges();
    }
    onNoClick(): void {
        this.dialogRef.close();
    }
}
