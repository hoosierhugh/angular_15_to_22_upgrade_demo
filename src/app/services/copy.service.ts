import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { AlertMessage } from '.';

@Injectable({
  providedIn: 'root'
})
export class CopyService {

    private subject = new Subject<CopyEvent>();
    constructor() { }

    copy(data: unknown, notification: AlertMessage) {
        this.subject.next({data:data, notification: notification});
    }

    getData(): Observable<CopyEvent> {
        return this.subject.asObservable();
    }
}

export interface CopyEvent {
    data: unknown;
    notification: AlertMessage;
}
