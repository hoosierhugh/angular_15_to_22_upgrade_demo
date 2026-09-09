import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { map } from 'rxjs/operators';
import { PreferenceIpAliasService } from '../preferences';
import { WorkerService } from '../worker.service';
import { WorkerCommands } from '@app/models/worker-commands.module';

@Injectable({
    providedIn: 'root'
})
export class CallTransactionService {
    private http = inject(HttpClient);
    private _ipalias = inject(PreferenceIpAliasService);

    private url = `${environment.apiUrl}/call`;

    getTransaction(data: any): Observable<any> {
        return this.http.post<any>(`${this.url}/transaction`, data).pipe(map(async transactionData => {
            const ipAliasesData: any = null;
            // try {
            //     ipAliasesData = await this._ipalias.getAll().toPromise();
            // } catch (err) { }

            return await WorkerService.doOnce(WorkerCommands.TRANSACTION_SERVICE_TRNS, {
                transactionData, ipaliases: ipAliasesData?.data?.map(d => d.ipobject)
            });
        }));
    }
}
