import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface GrafanaProxyErrorResponse {
    errorcode: number;
    data?: { message?: string };
}

export interface GrafanaDashboardOption {
    title: string;
    uid: string;
    id?: number | string;
    type?: string;
}

export interface GrafanaFolder {
    id: number | string;
    title: string;
    type: string;
    uid?: string;
}

export interface GrafanaDashboardDetail {
    dashboard: {
        uid: string;
        panels: { title: string; id: number }[];
    };
}

export interface GrafanaPanelOption {
    title: string;
    pid: number;
    uid: string;
}

export interface GrafanaStatusResponse {
    data: { enable: boolean };
}

@Injectable({ providedIn: 'root' })

export class ProxyService {
    private _http = inject(HttpClient);

    private url = `${environment.apiUrl}/proxy`;

    // Get Folders list
    getProxyGrafanaFolders(): Observable<GrafanaFolder[] | GrafanaProxyErrorResponse> {
        return this._http.get<GrafanaFolder[] | GrafanaProxyErrorResponse>(`${this.url}/grafana/folders`);
    }
    getProxyGrafanaSearch(uid: string): Observable<GrafanaDashboardOption[]> {
        return this._http.get<GrafanaDashboardOption[]>(`${this.url}/grafana/search/` + uid);
    }
    // Get Dashboard list
    getProxyGrafanaDashboards(folder: string): Observable<GrafanaDashboardDetail> {
        return this._http.get<GrafanaDashboardDetail>(`${this.url}/grafana/dashboards/uid/` + folder);
    }

    // Get Grafana URL
    getProxyGrafanaUrl(): Observable<{ data: string } | GrafanaProxyErrorResponse> {
        return this._http.get<{ data: string } | GrafanaProxyErrorResponse>(`${this.url}/grafana/url`);
    }
    getProxyGrafanaPath(): Observable<{ data: string }> {
        return this._http.get<{ data: string }>(`${this.url}/grafana/path`);
    }
    // Get Grafana OrgID
    getProxyGrafanaOrg(): Observable<{ id: number } | GrafanaProxyErrorResponse> {
        return this._http.get<{ id: number } | GrafanaProxyErrorResponse>(`${this.url}/grafana/org`);
    }
    getProxyGrafanaStatus(): Observable<GrafanaStatusResponse> {
        return this._http.get<GrafanaStatusResponse>(`${this.url}/grafana/status`).pipe(catchError(this.handleError));
    }
    handleError(error: HttpErrorResponse): Observable<never> {

        return throwError(() => error);
    }
}
