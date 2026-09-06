import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class PreferenceVersionService {
    apiUrl = environment.apiUrl;
    constructor(private http: HttpClient) {}
    async getApiVersion(): Promise<string | undefined> {
        try {
            const data = await this.http
                .get<{ data?: { version?: string } }>(`${this.apiUrl}/version/api/info`)
                .toPromise();
            if (data?.data?.version) {
                return data.data?.version;
            }
            return undefined;
        } catch (err) {
            // console.log(err);
            return undefined;
        }
    }
    getUiVersion() {
        return this.http.get(`${this.apiUrl}/version/ui/info`);
    }
}
