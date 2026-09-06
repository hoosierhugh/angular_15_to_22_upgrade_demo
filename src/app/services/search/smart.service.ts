import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';

export interface SmartLabelResponse {
    data: {
        data: Array<{ value: string }>;
    };
}

@Injectable({
  providedIn: 'root'
})
export class SmartService {
    constructor(private http: HttpClient) { }

    getLabelByUrl(url: string, text: string = ''): Observable<SmartLabelResponse> {
        return this.http.get<SmartLabelResponse>(`${environment.apiUrl}${url}?query=${encodeURIComponent(JSON.stringify({data: text}))}`);
    }
}
