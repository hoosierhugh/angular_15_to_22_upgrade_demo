import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@environments/environment';

export type StreamType = 'rtpagent' | 'picserver' | 'homerapp';

interface AdminActionResponse {
  data?: {
    message?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);


  private url = `${environment.apiUrl}/export/action/`;

  public getFile() {
    return this.http.get(`${this.url}logs`, {
      responseType: 'blob',
      observe: 'response',
      headers: new HttpHeaders().append('Content-Type', 'application/octect-stream')
    }).toPromise();
  }

  // /export/action/active
  dumpRequest(type: StreamType): Promise<AdminActionResponse | undefined> {
    return this.http.get<AdminActionResponse>(`${this.url}${type}`).toPromise();
  }

  checkIsActive() {
    return this.http.get(`${this.url}active`).toPromise();
  }
}
