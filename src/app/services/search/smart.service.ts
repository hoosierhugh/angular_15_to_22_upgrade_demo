import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';

export interface SmartLabelResponse {
    data: {
        data: { value: string }[];
    };
}

@Injectable({
  providedIn: 'root'
})
export class SmartService {
    private http = inject(HttpClient);


    getLabelByUrl(url: string, text = ''): Observable<SmartLabelResponse> {
        return this.http.get<SmartLabelResponse>(`${environment.apiUrl}${url}?query=${encodeURIComponent(JSON.stringify({data: text}))}`);
    }
}
