import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { VERSION } from '../../../../VERSION';

export interface UpdateCheckResponse {
    data?: {
        upgrade?: boolean;
        version?: string;
    };
    message?: string;
}

@Injectable({
    providedIn: 'root'
})
export class UpdateAlertService {
    private http = inject(HttpClient);

    private url = `${environment.apiUrl}/version/ui/check/`;

    check(): Observable<UpdateCheckResponse> {
        // const testVersion = '9.0.1'; // '10.0.1'
        return this.http.get<UpdateCheckResponse>(`${this.url}${VERSION}`);
    }

}
