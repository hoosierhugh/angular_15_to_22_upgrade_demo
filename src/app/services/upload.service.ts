import { HttpClient, HttpEvent, HttpHeaders, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environments/environment';
import { ApiResponse } from '@app/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class UploadService {
    private http = inject(HttpClient);

    url = environment.apiUrl;
    endopoint = `${this.url}`;
    public upload(formData: FormData, type: string, isReplace: boolean, isHomer2: boolean): Observable<HttpEvent<ApiResponse<unknown>>> {
        return this.http.post<ApiResponse<unknown>>(`${this.endopoint}/${type}/import${isHomer2 ? '/h2' : ''}${isReplace ? '/replace' : ''}`, formData, {
            responseType: 'json',
            headers: new HttpHeaders()
            .append('enctype', 'multipart/form-data')
            .append('Accept', 'application/json'),
        reportProgress: true,
        observe: 'events',
        });
    }
}
