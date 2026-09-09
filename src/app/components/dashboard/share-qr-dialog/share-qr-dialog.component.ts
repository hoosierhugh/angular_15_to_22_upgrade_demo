import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AlertService, DashboardService, } from '@app/services';
import { TranslateService } from '@ngx-translate/core';
import { DashboardData } from '@app/models';
@Component({
    selector: 'app-share-qr-dialog',
    templateUrl: './share-qr-dialog.component.html',
    styleUrls: ['./share-qr-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ShareQrDialogComponent {
    dialogRef = inject<MatDialogRef<ShareQrDialogComponent>>(MatDialogRef);
    data = inject(MAT_DIALOG_DATA);
    dashboardService = inject(DashboardService);
    cdr = inject(ChangeDetectorRef);
    alertService = inject(AlertService);
    translateService = inject(TranslateService);

    dashboardLink;
    dashboardId;
    elementType;
    correctionLevel;
    value;
    id;
    shared;
    params;
    constructor() {
        const data = this.data;
        const dashboardService = this.dashboardService;


        this.dashboardId = dashboardService.getCurrentDashBoardId();

        dashboardService.getDashboardInfo()
            .toPromise()
            .then((data) => {

                this.dashboardLink = this.getDashboardData(
                    this.dashboardId, data);

            });
        this.shared = data.shared;
        this.id = data.id;
        this.elementType = data.qrElementType;
        this.correctionLevel = data.qrCorrectionLevel;
        this.value = window.location.href;


    }

    getDashboardData(id, arr) {
        return arr.data.filter((f) => f.id === id);
    }
    copyLink(qrlink) {
        qrlink.select();
        document.execCommand('copy');
        qrlink.setSelectionRange(0, 0);
        this.translateService.get('notifications.success.linkCopy').subscribe(res => {
            this.alertService.success(res);
        })
    }
    shareDashboard() {

        let actualDb: DashboardData | undefined;
        this.dashboardService.getDashboardStore(this.id).toPromise().then(dbData => {
            actualDb = dbData?.data;
            if (actualDb) {
                actualDb.shared = true;
                this.dashboardService.updateDashboard(actualDb);
                this.shared = true;
                this.onShareDashboard(this.shared);
                this.translateService.get('notifications.success.dashboardShared').subscribe(res => {
                    this.alertService.success(res);
                })
                this.cdr.detectChanges();
            }
        });
    }
    onShareDashboard(data) {
        this.params.shareDashboard(data);
    }
    onNoClick(): void {
        this.dialogRef.close();
    }
}
