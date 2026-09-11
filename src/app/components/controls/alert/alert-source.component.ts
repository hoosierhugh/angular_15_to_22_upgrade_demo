import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { Subscription } from 'rxjs';

import { AlertService } from './../../../services';
import { TranslateService } from '@ngx-translate/core'
import { AlertOverlayService } from './alert-overlay.service';
import { AlertOverlayRef } from './alert-ref';
import { AlertSubject } from '@app/models/alert.model';



@Component({
    selector: 'app-alert',
    template: ``,
    styleUrls: ['./alert.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})

export class AlertSourceComponent implements OnInit, OnDestroy {
    private alertService = inject(AlertService);
    private cdr = inject(ChangeDetectorRef);
    translateService = inject(TranslateService);
    private alertOverlay = inject(AlertOverlayService);

    private subscription: Subscription;
    message: AlertSubject;
    timeoutId: ReturnType<typeof setTimeout>;
    isOpen = false;
    dialogRef: AlertOverlayRef;
    constructor() {
        const translateService = this.translateService;

        translateService.addLangs(['en'])
        translateService.setFallbackLang('en')
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
