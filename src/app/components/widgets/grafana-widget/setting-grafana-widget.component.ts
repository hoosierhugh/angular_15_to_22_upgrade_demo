import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import {
    GrafanaDashboardOption,
    GrafanaFolder,
    GrafanaPanelOption,
    GrafanaProxyErrorResponse,
    ProxyService
} from '../../../services/proxy.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core'
import { environment } from '@environments/environment';
import { lastValueFrom } from 'rxjs';
import type { IframeConfig } from './grafana-widget.component';

interface GroupedGrafanaDashboards {
    group: string;
    list: GrafanaDashboardOption[];
}

function isGrafanaProxyError<T extends object>(response: T | GrafanaProxyErrorResponse): response is GrafanaProxyErrorResponse {
    return 'errorcode' in response && typeof response.errorcode === 'number';
}

function hasDashboardUid(dashboard: GrafanaFolder): dashboard is GrafanaFolder & { uid: string } {
    return typeof dashboard.uid === 'string';
}
@Component({
    selector: 'app-grafana-rsearch-widget-component',
    templateUrl: 'setting-grafana-widget.component.html',
    styleUrls: ['./setting-grafana-widget.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class SettingIframeWidgetComponent implements OnInit {
    dialogRef = inject<MatDialogRef<SettingIframeWidgetComponent>>(MatDialogRef);
    private _ps = inject(ProxyService);
    translateService = inject(TranslateService);
    private cdr = inject(ChangeDetectorRef);
    data = inject<IframeConfig>(MAT_DIALOG_DATA);


    private envUrl = `${environment.apiUrl.replace('/api/v3', '')}`;
    dashboardList: GroupedGrafanaDashboards[] = [];
    panelList: GrafanaPanelOption[] = [];
    folderList: GroupedGrafanaDashboards[] = [];
    unGroupedDashboardList: GrafanaDashboardOption[] = [];
    dashboardSource: GrafanaDashboardOption | undefined;
    panelListValue: GrafanaPanelOption | undefined;
    isInvalid: boolean;
    isLoggedIn = true;
    errorMessage: string;
    errorCode: number;
    isSameOrigin = false;
    constructor() {
        const translateService = this.translateService;

        translateService.addLangs(['en'])
        translateService.setFallbackLang('en')
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    ngOnInit() {
        /* need get URL for grafana and orgID before we start edit */
        this.onGetGrafanaUrl();
        this.isSameOrigin = this.envUrl === `${window.location.protocol}//${window.location.host}`;
    }

    async onGetGrafanaUrl() {
        const res = await lastValueFrom(this._ps.getProxyGrafanaUrl());
        if (isGrafanaProxyError(res)) {
            this.errorCode = res.errorcode || 123;
            this.isLoggedIn = false;
            this.errorMessage = res?.data?.message || '';
        } else {
            if (this.data.serverUrl === 'none' || this.data.url === 'none') {
                this.data.serverUrl = res?.data;
                this.data.url = res?.data;
            } else {
                this.data.serverUrl = res?.data;
            }
            this.onGetGrafanaOrg();
        }
        this.cdr.detectChanges();
    }

    async onGetGrafanaOrg() {
        const res = await lastValueFrom(this._ps.getProxyGrafanaOrg());
        if (isGrafanaProxyError(res)) {
            this.errorCode = res.errorcode;
            this.isLoggedIn = false;
            this.errorMessage = res?.data?.message;
        } else {
            this.data.params.orgId = res.id;
            this.onSyncDashboard();
        }
        this.cdr.detectChanges();
    }

    async onSyncDashboard() {
        const res = await lastValueFrom(this._ps.getProxyGrafanaFolders());
        if (!Array.isArray(res)) {
            this.errorCode = res.errorcode;
            this.isLoggedIn = false;
            this.errorMessage = res?.data?.message;
        } else {
            this.isLoggedIn = true;
            const localDashboardList: GrafanaDashboardOption[] = [];
            res.forEach(unit => {
                if (unit.type === 'dash-db') {
                    if (hasDashboardUid(unit)) {
                        this.unGroupedDashboardList.push(unit);
                        localDashboardList.push(unit);
                    }
                } else {
                    this.getFolderContent(unit.title, unit.id);
                }
            });
            this.dashboardList.push({
                group: 'General',
                list: localDashboardList
            });
            this.dashboardSource = this.unGroupedDashboardList.find(dashboard => dashboard.uid === this.data.dashboardSource);
        }
        if (this.dashboardSource) {
            this.onDashboardChange();
        }
        this.cdr.detectChanges();
    }
    async getFolderContent(title: string, uid: string | number) {
        const res = await lastValueFrom(this._ps.getProxyGrafanaSearch(String(uid)));

        const folder = {
            group: title,
            list: res
        };
        res.forEach(unit => {
            this.unGroupedDashboardList.push(unit);
        });
        this.dashboardList.push(folder);
        this.dashboardSource = this.unGroupedDashboardList.find(dashboard => dashboard.uid === this.data.dashboardSource);
        if (this.dashboardSource) {
            this.onDashboardChange();
        }
        this.cdr.detectChanges();
    }
    async onDashboardChange() {
        this.data.dashboardSource = this.dashboardSource.uid;
        const res = await lastValueFrom(this._ps.getProxyGrafanaDashboards(this.data.dashboardSource));
        const localPanelList: GrafanaPanelOption[] = [];
        res.dashboard.panels.forEach(panelId => {
            localPanelList.push({ title: panelId.title, pid: panelId.id, uid: res.dashboard.uid });
        });
        this.panelListValue = localPanelList.find(i => i.title === this.data.panelListValue);
        this.panelList = localPanelList;
        this.cdr.detectChanges();
    }

    onPanelSelect() {
        this.data.panelListValue = this.panelListValue.title;
        this.data.url = (this.panelListValue.uid || '...') + '/' + (encodeURIComponent(this.panelListValue.title) || '...');
        this.data.params.panelId = this.panelListValue.pid;
        this.data.params.viewPanel = this.panelListValue.pid;
        this.cdr.detectChanges();
    }

    compareDashboard(a: GrafanaDashboardOption | null | undefined, b: GrafanaDashboardOption | null | undefined) {
        // data.dashboardSource
        // this.data.panelListValue
        return a?.uid === b?.uid && a?.id === b?.id;
    }

    comparePanel(a: GrafanaPanelOption | null | undefined, b: GrafanaPanelOption | null | undefined) {
        // data.panelListValue
        return a?.title === b?.title;
    }
    validate(event) {
        event = event.trim();
        if (event === '' || event === ' ') {
            this.isInvalid = true;
        } else {
            this.isInvalid = false;
        }
    }
}
