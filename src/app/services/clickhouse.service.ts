import { Injectable, inject } from '@angular/core';
import { Observable, EMPTY } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';

export interface ClickhouseQuery {
    query: string;
}

export interface ClickhouseRawResponse {
    data?: unknown;
    [key: string]: unknown;
}

export interface ClickhouseListItem {
    name: string;
    title?: string;
    uid?: string;
    type?: string;
    [key: string]: unknown;
}

export interface ClickhouseListResponse {
    data?: Record<string, ClickhouseListItem[]>;
    [key: string]: unknown;
}

@Injectable({
    providedIn: 'root'
})
export class ClickhouseSerivce {
    private http = inject(HttpClient);


    private url = `${environment.apiUrl}/clickhouse`;

    getRawQuery(data: ClickhouseQuery): Observable<ClickhouseRawResponse> {
        if (this.sanitize(data)) {
            return this.http.post<ClickhouseRawResponse>(`${this.url}/query/raw`, data);
        } else {
            return EMPTY;
        }
    }
    getClickhouseDbList(): Observable<ClickhouseListResponse> {
        const data = {
            query: `SELECT name FROM system.databases ORDER BY name`
        };
        if (this.sanitize(data)) {
            return this.http.post<ClickhouseListResponse>(`${this.url}/query/raw`, data);
        } else {
            return EMPTY;
        }
    }
    getClickhouseTableList(database: string): Observable<ClickhouseListResponse> {
        const data = {
            query: `SELECT name FROM system.tables WHERE database = '${database}' ORDER BY name`
        };
        if (this.sanitize(data)) {
            return this.http.post<ClickhouseListResponse>(`${this.url}/query/raw`, data);
        } else {
            return EMPTY;
        }
    }
    getClickhouseColumnList(database: string, table: string): Observable<ClickhouseListResponse> {
        const data = {
            query: `SELECT name, type FROM system.columns WHERE database = '${database}'
            AND table = '${table}' ORDER BY name`
        };
        if (this.sanitize(data)) {
            return this.http.post<ClickhouseListResponse>(`${this.url}/query/raw`, data);
        } else {
            return EMPTY;
        }
    }
    getClickhouseTimeDate(database: string, table: string): Observable<ClickhouseListResponse> {
        const data = {
            query: `SELECT name FROM system.columns WHERE database = '${database}'
            AND table = '${table}' AND type LIKE 'DateTime%' ORDER BY name`
        };
        if (this.sanitize(data)) {
            return this.http.post<ClickhouseListResponse>(`${this.url}/query/raw`, data);
        } else {
            return EMPTY;
        }
    }
    sanitize(data: ClickhouseQuery): boolean {
        const regexp = new RegExp(/\bDROP\b|\bINSERT\b|\bCREATE\b|\bALTER\b|\bGRANT\b|\bREVOKE\b|\bDETACH\b|\bKILL\b|\bOPTIMIZE\b|\bSET\b|\bTRUNCATE\b|\bATTACH\b|\bRENAME\b/, 'mi');
        return !regexp.test(data.query);
    }
}
