import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { SearchCallModel } from '../../models/search-call.model';

export interface SearchCallResponse<T = unknown> {
    data?: T;
}

export interface DecodedSearchCallLayer {
    _source?: {
        layers?: Record<string, unknown>;
    };
    [key: string]: unknown;
}

export interface DecodedSearchCallResult {
    decoded?: DecodedSearchCallLayer[];
}

@Injectable({
    providedIn: 'root'
})
export class SearchCallService {
    private http = inject(HttpClient);


    private url = `${environment.apiUrl}/search/call`;

    // Return search call message
    getMessage(data: unknown): Observable<SearchCallResponse> {
        return this.http.post<SearchCallResponse>(`${this.url}/message`, data);
    }

    // Return search call data
    getData(searchConfig: SearchCallModel): Observable<SearchCallResponse> {
        return this.http.post<SearchCallResponse>(`${this.url}/data`, searchConfig);
    }

    // Return search call export data
    getExportData(): Observable<unknown> {
        return this.http.get<unknown>(`${this.url}/export/data`);
    }

    getDecodedData(searchConfig: SearchCallModel): Observable<SearchCallResponse<DecodedSearchCallResult[]>> {
        return this.http.post<SearchCallResponse<DecodedSearchCallResult[]>>(`${this.url}/decode/message`, searchConfig);
    }
}
