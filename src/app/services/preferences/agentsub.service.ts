import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@environments/environment';
import { PreferenceAgentsub } from '@app/models';
import { AuthenticationService } from '@app/services';
import { Observable } from 'rxjs';

interface AgentLookupRequest {
  uuid: string;
  type: string;
  data: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class PreferenceAgentsubService {
  private http = inject(HttpClient);
  private authService = inject(AuthenticationService);


  private url = `${environment.apiUrl}/agent`;

  // get user token
  getToken() {
    return this.authService.currentUserValue.token;
  }

  // perform lookup against an agent session
  getHepsubElements({uuid, type, data}: AgentLookupRequest): Observable<unknown> {
    return this.http.post<unknown>(`${this.url}/search/${uuid}/${type}`, data);
  }

  // retrieve all active agent sessions
  getAll() {
    return this.http.get<PreferenceAgentsub[]>(`${this.url}/subscribe`);
  }

  // get agent types
  getTypes() {
    return this.http.get(`${this.url}/type`);
  }

  /* getAll and get types has same response */

  // get Agents by type
  getType(type) {
    return this.http.get<PreferenceAgentsub>(`${this.url}/${type}`);
  }

  // get agent by UUID
  getByID(uuid) {
    return this.http.get(`${this.url}/subscribe/${uuid}`);
  }

  add(ph: PreferenceAgentsub) {
    return;
  }

  update(ph: PreferenceAgentsub) {
    return;
  }

  delete(uuid) {
    return this.http.delete(`${this.url}/subscribe/${uuid}`);
  }
}
