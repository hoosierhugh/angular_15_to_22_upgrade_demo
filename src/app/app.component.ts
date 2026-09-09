import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { AlertService, AuthenticationService } from './services';
import { User } from '@app/models';
import { MOCK_MODE } from './runtime-mode';

import { Functions } from './helpers/functions';
import {TranslateService} from '@ngx-translate/core';


@Component({
    selector: 'app-root', templateUrl: 'app.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AppComponent {
    private authenticationService = inject(AuthenticationService);
    translateService = inject(TranslateService);
    alertService = inject(AlertService);

    readonly mockMode = MOCK_MODE;
    currentUser: User;
    title = 'HOMER';
    translateError = false
    constructor() {
        const translateService = this.translateService;


        if (!this.authenticationService?.currentUserValue) {
            this.authenticationService.logout();
        }
        this.authenticationService.currentUser.subscribe(x => {

                this.currentUser = x;

        });
        window['console2file'] = Functions.console2file;
        // this language will be used as a fallback when a translation isn't found in the current language
        translateService.setDefaultLang('en');

         // the lang to use, if the lang isn't available, it will use the current loader to get them
        translateService.use('en').subscribe( data => {
            try{
               if(data) this.translateError = false
            }catch(e){
                this.translateError = true;
                this.alertService.error('Please check JSON translate file')

            }
        });
    }
}
