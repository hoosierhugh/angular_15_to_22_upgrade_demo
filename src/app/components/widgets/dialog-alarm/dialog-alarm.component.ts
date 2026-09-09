import { Component, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Functions } from '@app/helpers/functions';
import { PreferenceAdvancedService } from '@app/services';
import { TranslateService } from '@ngx-translate/core'

interface ProtocolIdentity {
    name: string;
    value: number;
}

interface AlarmSearchConfig {
    profile: string;
    protocol_id: ProtocolIdentity;
}

interface AlarmPreset {
    active?: boolean;
    data: { config: AlarmSearchConfig };
}

interface AlarmDialogData {
    config: AlarmSearchConfig | AlarmPreset;
}
@Component({
    selector: 'app-dialog-alarm',
    templateUrl: './dialog-alarm.component.html',
    styleUrls: ['./dialog-alarm.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class DialogAlarmComponent implements OnInit {
    private _pas = inject(PreferenceAdvancedService);
    translateService = inject(TranslateService);
    dialogRef = inject<MatDialogRef<DialogAlarmComponent>>(MatDialogRef);
    data = inject<AlarmDialogData>(MAT_DIALOG_DATA);

    presetList: AlarmPreset[] = [];
    selectedPreset: AlarmPreset;
    isSearch = false;
    constructor() {
        const translateService = this.translateService;
        const data = this.data;

        translateService.addLangs(['en'])
        translateService.setDefaultLang('en')
        this.isSearch = data ? true : false;
    }
    async ngOnInit() {

        const advanced = await this._pas.getAll().toPromise();
        if (this.isSearch) {
            const [custom] = advanced.data
                .filter((f) => f.category === 'custom-widget')
                .map((d) => (Object.values(d.data) as AlarmPreset[]))
                .map(m => m.filter(f => !!f.active));
            this.presetList = Functions.cloneObject(custom);
            const currentConfig = this.data.config as AlarmSearchConfig;
            const profile = currentConfig.profile;
            const protocol_id = currentConfig.protocol_id;
            this.selectedPreset = this.presetList.find(preset => preset.data.config.profile === profile &&
                preset.data.config.protocol_id.value === protocol_id.value &&
                preset.data.config.protocol_id.name === protocol_id.name
            );
            this.changePreset()
        }

    }
    changePreset() {
        this.data.config = this.selectedPreset;
    }
    onNoClick(): void {
        this.dialogRef.close();
    }
}
