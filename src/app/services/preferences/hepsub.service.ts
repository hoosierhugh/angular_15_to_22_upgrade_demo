import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { PreferenceHepsub } from '@app/models';
import { Functions } from '@app/helpers/functions';

@Injectable({
  providedIn: 'root'
})
export class PreferenceHepsubService {
  private http = inject(HttpClient);


  private url = `${environment.apiUrl}/hepsub/protocol`;

  getAll() {
      return this.http.get<PreferenceHepsub[]>(`${this.url}`);
  }

  add(ph: PreferenceHepsub) {
      ph.version = 1;
      ph.guid = Functions.newGuid();
      return this.http.post(`${this.url}`, ph);
  }

  update(ph: PreferenceHepsub) {
      return this.http.put(`${this.url}/${ph.guid}`, ph);
  }

  delete(guid) {
      return this.http.delete(`${this.url}/${guid}`);
  }

}
