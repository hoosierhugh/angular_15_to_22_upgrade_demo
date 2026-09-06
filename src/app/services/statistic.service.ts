import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '@environments/environment';
import { catchError } from 'rxjs/operators';
import { ApiResponse, StatsDb } from '@app/models';

export interface ResyncData {
    node_src:string;
    node_dst:string;
    tables:Array<string>
}

export interface InfluxSeries {
    columns: string[];
    values: unknown[][];
    name: string;
}

export interface InfluxResponse {
    data: {
        Results: Array<{
            Series: InfluxSeries[];
        }>;
    };
}

@Injectable({ providedIn: 'root' })

export class StatisticService {
    private url = `${environment.apiUrl}/statistic`;
    private dbUrl = `${environment.apiUrl}/configdb`;
    constructor(private _http: HttpClient) {}

    // Statistic data
    getStatisticData(data: unknown): Observable<InfluxResponse> {
        return this._http.post<InfluxResponse>(`${this.url}/data`, data);
    }

    // Statistic db list
    getStatisticDbList(): Observable<InfluxResponse> {
        return this._http.get<InfluxResponse>(`${this.url}/_db`);
    }

    // Statistic Retentions
    getStatisticRetentions(data: unknown): Observable<InfluxResponse> {
        return this._http.post<InfluxResponse>(`${this.url}/_retentions`, data);
    }

    // Statistic Measurements
    getStatisticMeasurements(id: string): Observable<InfluxResponse> {
        return this._http.get<InfluxResponse>(`${this.url}/_measurements/${id}`);
    }

    // Statistic metrics
    getStatisticMetrics(data: unknown): Observable<InfluxResponse> {
        return this._http.post<InfluxResponse>(`${this.url}/_metrics`, data);
    }

    // Statistic tags
    getStatisticTags(data: unknown): Observable<InfluxResponse> {
        return this._http.post<InfluxResponse>(`${this.url}/_tags`, data);
    }
    // database statistic and latency info
    getDbStats() {
        return this._http.get<ApiResponse<Record<string, StatsDb>>>(`${this.url}/database/info`);
    }
    getConfigStats() {
        return this._http.get<ApiResponse<Record<string, StatsDb>>>(`${this.url}/configdb/info`).pipe(catchError(this.errorHandler));
    }
    resync(data: ResyncData): Observable<unknown> {
        return this._http.post<unknown>(`${this.dbUrl}/tables/resync`, data);
    }

    /** error handling method */
    getTableList(): Observable<ApiResponse<string[]>> {

        return this._http.get<ApiResponse<string[]>>(`${this.dbUrl}/tables/list`)
    }

    errorHandler(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            console.log('An error ocurred: ', error.error.message);
        } else {
            console.log(
                `API returned code ${error.status}, body was: ${error.error}`
            );
        }
        return throwError(
            `Something bad happened, please try again later`
        );
    }



}
