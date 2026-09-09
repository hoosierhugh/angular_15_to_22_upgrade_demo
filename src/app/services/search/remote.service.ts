import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';

export interface SearchRemoteResponse<T = unknown> {
    data?: T;
}

@Injectable({
  providedIn: 'root'
})
export class SearchRemoteService {
    private http = inject(HttpClient);


    private url = `${environment.apiUrl}/search/remote`;

    // Return search remote data
    getData(data: unknown): Observable<SearchRemoteResponse> {
        return this.http.post<SearchRemoteResponse>(`${this.url}/data`, data);
    }

    // Return search remote message
    getMessage(): Observable<unknown> {
        return this.http.get<unknown>(`${this.url}/message`);
    }

    // v3/search/remote/label?
    getLabel(server: string): Observable<string[]> {
        return this.http.get<string[]>(`${this.url}/label?server=${server}`);
    }

    // v3/search/remote/values?label=method&server=http://127.0.0.1:3100
    getValues(label: string, server: string): Observable<string[]> {
        return this.http.get<string[]>(`${this.url}/values?server=${server}&label=${label}`);
    }
}
