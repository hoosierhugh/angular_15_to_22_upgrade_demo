import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';

import { AlertService } from './../../../services';
import { TranslateService } from '@ngx-translate/core'
import { AlertOverlayService } from './alert-overlay.service';
import { AlertOverlayRef } from './alert-ref';
import { AlertSubject } from '@app/models/alert.model';



@Component({
    selector: 'alert',
    template: ``,
    styleUrls: ['./alert.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})

export class AlertSourceComponent implements OnInit, OnDestroy {
    private subscription: Subscription;
    message: AlertSubject;
    timeoutId: ReturnType<typeof setTimeout>;
    isOpen = false;
    dialogRef: AlertOverlayRef;
    constructor(
        private alertService: AlertService,
        private cdr: ChangeDetectorRef,
        public translateService: TranslateService,
        private alertOverlay: AlertOverlayService
    ) {
        translateService.addLangs(['en'])
        translateService.setDefaultLang('en')
    }
    ngOnInit() {
        this.subscription = this.alertService.getMessage().subscribe((message: AlertSubject | null) => {
            if (!message || message?.text === '') {
                return;
            }
            this.dialogRef = this.alertOverlay.open({
                message: {
                    text: message.text,
                    object: message.object,
                    type: message.type
                }
            });
            this.isOpen = false;
            this.message = message;
            this.cdr.detectChanges();
        });
    }
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
