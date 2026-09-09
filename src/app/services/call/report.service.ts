import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { map } from 'rxjs/operators';
import { WorkerService } from '../worker.service';
import { WorkerCommands } from '../../models/worker-commands.module';
import { ApiResponse } from '@app/models';

@Injectable({
  providedIn: 'root'
})
export class CallReportService {
    private http = inject(HttpClient);

    private url = `${environment.apiUrl}/call/report`;

    // Return call report qos
    postQOS(postData: unknown): Observable<unknown> {
        return this.http.post<ApiResponse<unknown>>(`${this.url}/qos`, postData).pipe(map(
            async qosData => qosData?.data ? await WorkerService.doOnce(WorkerCommands.TRANSACTION_SERVICE_QOS, qosData) : qosData
        ));
    }
}
