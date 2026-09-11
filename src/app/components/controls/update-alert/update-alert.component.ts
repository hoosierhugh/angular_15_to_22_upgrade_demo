import { Component, ViewChild, ChangeDetectionStrategy, inject } from '@angular/core';
import { UpdateAlertService } from './update-alert.service';
import { TranslateService } from '@ngx-translate/core'

@Component({
    selector: 'app-update-alert',
    templateUrl: './update-alert.component.html',
    styleUrls: ['./update-alert.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class UpdateAlertComponent {
    private updateAlertService = inject(UpdateAlertService);
    translateService = inject(TranslateService);

    @ViewChild('refreshForm', { static: true }) refreshForm;
    message = '';
    refreshURL;
    isMessage = false;
    constructor() {
        const translateService = this.translateService;

        translateService.addLangs(['en']);
        translateService.setFallbackLang('en')
    };

    private async checkUpdate() {
        try {
            const { data, message } = await this.updateAlertService.check().toPromise();
            const { upgrade, version } = data || {};
            this.isMessage = upgrade;
            if (upgrade) {
                this.message = `${message} - (latest version: ${version})`;
                this.refreshURL = encodeURIComponent(window.location.href);
            }
        } catch (e) {
            // Ignore update-check failures; the alert is optional.
        }
        const delayReCheck = 1000 * 60 * 30; // 30 min

        setTimeout(this.checkUpdate.bind(this), delayReCheck);
    }
    onClose() {
        this.isMessage = false;
    }
}
