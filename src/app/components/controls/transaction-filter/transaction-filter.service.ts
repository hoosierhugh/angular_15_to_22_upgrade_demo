import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import type { FlowFilter } from './transaction-filter.component';

@Injectable({
    providedIn: 'root'
})
export class TransactionFilterService {
    subject = new BehaviorSubject<Partial<FlowFilter>>({});
    get listen(): Observable<Partial<FlowFilter>> {
        return this.subject.asObservable();
    }
    setFilter(filterData: FlowFilter) {
        this.subject.next(filterData);
    }
}
