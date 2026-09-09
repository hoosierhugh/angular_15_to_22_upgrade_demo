import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PcapUploaderService {
    private http = inject(HttpClient);

    private url = `${environment.apiUrl}/import/data/pcap`;

    postFile(fileToUpload: File, isDataTimeNow: boolean): Observable<unknown> {
        const formData: FormData = new FormData();
        formData.append('fileKey', fileToUpload, fileToUpload.name);
        const url = isDataTimeNow ? this.url + '/now' : this.url;
        return this.http.post(url, formData);
    }
}
