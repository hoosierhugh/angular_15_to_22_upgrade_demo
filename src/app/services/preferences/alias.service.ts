import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { PreferenceAlias } from '@app/models';
import { Functions } from '@app/helpers/functions';

@Injectable({
  providedIn: 'root'
})
export class PreferenceAliasService {
    private http = inject(HttpClient);


    private url = `${environment.apiUrl}/alias`;

    getAll() {
        return this.http.get<PreferenceAlias[]>(`${this.url}`);
    }

    add(pa: PreferenceAlias) {
        pa.guid = Functions.newGuid();
        pa.version = Date.now();
        pa.captureID = String(pa.captureID);
        return this.http.post(`${this.url}`, pa);
    }

    update(pa: PreferenceAlias) {
        pa.captureID = String(pa.captureID);
        pa.version = Date.now();
        const guid = pa.guid;
        // delete pa.guid;
        return this.http.put(`${this.url}/${guid}`, pa);
    }

    delete(guid: string) {
        return this.http.delete(`${this.url}/${guid}`);
    }

}
