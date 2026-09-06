import { HttpGetBuffer } from '@app/helpers/http-get-buffer';
import { ConstValue } from './../../models/const-value.model';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { ApiResponse, UserSettings } from '@app/models';
import { Functions } from '@app/helpers/functions';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class PreferenceUserSettingsService {
    private url = `${environment.apiUrl}/user/settings`;

    constructor(
        private http: HttpClient,
        private httpGetBuffer: HttpGetBuffer
    ) { }

    getUserDashboardWidgets(): Promise<unknown> {
        return this.http.get<unknown>(`${environment.apiUrl}/user/dashboard/widgets`).toPromise();
    }

    getAll<T = UserSettings>(delayBuffer = 1000 * 30): Observable<ApiResponse<T[]>> {
        return this.httpGetBuffer.get<ApiResponse<T[]>>(this.url, delayBuffer)
            .pipe(map((response) => {
                const localdata = localStorage.getItem(ConstValue.CURRENT_USER);
                const { user } = Functions.JSON_parse(localdata);
                /**
                 * TODO: admin || shred === true
                 */
                const isAdmin = user?.admin || false;
                if (isAdmin) {
                    return response;
                }
                
                const { data } = response;
                const username = Functions.JSON_parse(localStorage.getItem(ConstValue.CURRENT_USER)).user.username;
                const outData = data?.filter((item) =>
                    typeof item === 'object' && item !== null &&
                    'username' in item && item.username === username
                ) || [];
                return {
                    count: outData.length,
                    data: outData
                };
            }));
    }

    getCategory(category: string): Observable<ApiResponse<UserSettings[]>> {
        return this.http.get<ApiResponse<UserSettings[]>>(`${this.url}/${category}`);
    }

    add(userSetting: UserSettings): Observable<unknown> {
        userSetting.guid = Functions.newGuid();
        userSetting.uuid = Functions.newGuid();
        return this.http.post(`${this.url}`, userSetting);
    }

    update(userSetting: UserSettings): Observable<unknown> {
        const { guid, uuid } = userSetting;
        return this.http.put(`${this.url}/${uuid || guid}`, userSetting);
    }

    delete(guid: string): Observable<unknown> {
        return this.http.delete<unknown>(`${this.url}/${guid}`);
    }

}
