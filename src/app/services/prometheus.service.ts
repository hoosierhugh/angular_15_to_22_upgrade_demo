import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PrometheusService {
    private http = inject(HttpClient);


    private url = `${environment.apiUrl}/prometheus`;

    getLabel(): Observable<string[]> {
        return this.http.get<string[]>(`${this.url}/labels`);
    }

    getLabels(id: string): Observable<Record<string, string>[]> {
        return this.http.get<Record<string, string>[]>(`${this.url}/label/${id}`);
    }

    getValue(data: unknown): Observable<PrometheusQueryResult[]> {
        return this.http.post<PrometheusQueryResult[]>(`${this.url}/value`, data);
    }
}

export interface PrometheusQueryResult {
    data: {
        result: {
            metric: Record<string, string> & { __name__?: string };
            values: [number, string][];
        }[];
    };
}
// /api/v3/prometheus/label/net_contntrack_dialer_conn_failed_total
