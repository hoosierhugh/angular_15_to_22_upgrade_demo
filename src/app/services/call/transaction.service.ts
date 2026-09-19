import { Injectable, inject } from '@angular/core';
import { from, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { mergeMap } from 'rxjs/operators';
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

    getTransaction<T>(data: T): Observable<T> {
        return this.http.post<T>(`${this.url}/transaction`, data).pipe(mergeMap(transactionData => {
            const ipAliasesData: { data?: { ipobject: unknown }[] } = {};
            // try {
            //     ipAliasesData = await this._ipalias.getAll().toPromise();
            // } catch (err) { }

            return from(WorkerService.doOnce<T>(WorkerCommands.TRANSACTION_SERVICE_TRNS, {
                transactionData, ipaliases: ipAliasesData?.data?.map(d => d.ipobject)
            }));
        }));
    }
}
