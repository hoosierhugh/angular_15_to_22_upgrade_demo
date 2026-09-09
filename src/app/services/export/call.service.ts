import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@environments/environment';

export type FileType = 'Pcap' | 'SIPP' | 'Text' | 'Report';

export interface ShareLinkResponse {
    data: {
        url: string;
        uuid: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class ExportCallService {
    private http = inject(HttpClient);


    private url = `${environment.apiUrl}/export/call`;

    postMessagesFile(data: unknown, type: FileType): Promise<Blob | undefined> {
        const folder = type === 'Report' ? '/transaction/' : '/messages/';
        return this.http.post(this.url + folder + type.toLowerCase(), data, {
            responseType: 'blob',
            headers: new HttpHeaders().append('Content-Type', 'application/json')
        }).toPromise();
    }

    getPCAPSuleFile(data: unknown): Promise<Blob | undefined> {
        const folder = '/stenographer';
        return this.http.post(this.url + folder , data, {
            responseType: 'blob',
            headers: new HttpHeaders().append('Content-Type', 'application/json')
        }).toPromise();
    }

    // Return export call message
    getMessage(): Observable<unknown> {
        return this.http.get<unknown>(`${this.url}/message`);
    }

    // Return export call transaction html
    getTransactionHTML(): Observable<string> {
        return this.http.get(`${this.url}/transaction/html`, { responseType: 'text' });
    }
    postShareLink(data: unknown): Observable<ShareLinkResponse> {
        return this.http.post<ShareLinkResponse>(`${this.url}/transaction/link`, data, {
            headers: new HttpHeaders().append('Content-Type', 'application/json')
        });

    }

}
