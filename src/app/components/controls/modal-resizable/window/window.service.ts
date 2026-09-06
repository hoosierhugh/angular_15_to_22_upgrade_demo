import { Observable, Subject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class WindowService {
    subject = new Subject<MouseEvent>();
    constructor() { }
    get listen(): Observable<MouseEvent> {
        return this.subject.asObservable();
    }
    setMousePosition(evt: MouseEvent) {
        this.subject.next(evt);
    }
}
