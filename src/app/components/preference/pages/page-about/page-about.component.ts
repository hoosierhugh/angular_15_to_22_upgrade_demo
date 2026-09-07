import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { PreferenceVersionService } from '@app/services/preferences/version.service';
import { VERSION } from 'src/VERSION';

@Component({
    selector: 'app-page-about',
    templateUrl: './page-about.component.html',
    styleUrls: ['./page-about.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class PageAboutComponent implements OnInit {
    uiVersion = VERSION;
    apiVersion: Promise<string | undefined>;
    constructor(private _pvs: PreferenceVersionService) { }

    async ngOnInit() {
        this.apiVersion = this._pvs.getApiVersion();
    }

}
