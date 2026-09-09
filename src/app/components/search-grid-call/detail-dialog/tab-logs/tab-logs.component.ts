import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef, EventEmitter, Output, AfterViewInit, inject } from '@angular/core';
import { Functions } from '@app/helpers/functions';

@Component({
    selector: 'app-tab-logs',
    templateUrl: './tab-logs.component.html',
    styleUrls: ['./tab-logs.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class TabLogsComponent implements OnInit, AfterViewInit {
    private cdr = inject(ChangeDetectorRef);

    _data: LogEntry[] = [];

    get data() {
        return this._data;
    }
    @Input() set data(val: LogEntry[]) {
        if (!val) {
            return;
        }
        this._data = Functions.cloneObject(val);

        // Compact Objects
        this._data.forEach(i => {
            try {
                i.payload.raw = Functions.JSON_parse(String(i.payload.raw));
            } catch (e) { }

            try {
                const originalPayload = i.payload;
                i.payload = {
                    message: originalPayload.raw,
                    timestamp: new Date(originalPayload.create_date),
                    raw: originalPayload
                };
                if (isRecord(i.payload.raw)) {
                    delete i.payload.raw.raw;
                }
            } catch (e) { }
        });
        this.cdr.detectChanges();
    }
    @Output() ready = new EventEmitter<void>();

    ngOnInit() {
    }
    ngAfterViewInit() {

        setTimeout(() => {
            this.ready.emit();
        }, 100)
    }


}

interface LogPayload {
    raw: unknown;
    create_date?: string | number | Date;
    message?: unknown;
    timestamp?: Date;
}

interface LogEntry {
    payload: LogPayload;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}
