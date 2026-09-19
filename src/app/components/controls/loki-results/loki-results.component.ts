import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation, inject } from '@angular/core';
import { Functions } from '@app/helpers/functions';
import { PreferenceAdvancedService, SearchRemoteService, SearchService } from '@app/services';
import { DateTimeRangeService } from '@app/services/data-time-range.service';
import { ModulesService } from '@app/services/modules.service';

interface LokiQuery {
    serverLoki?: string;
    limit?: number;
    text?: string;
    rxText?: string;
    [key: string]: unknown;
}

interface LokiLogRow {
    micro_ts?: string | number;
    custom_1?: string;
    custom_2?: Record<string, unknown>;
    [key: string]: unknown;
}

interface LokiDataItem {
    data: {
        callid?: string[];
        messages?: Record<string, unknown>[];
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

interface LokiTemplate {
    lineFilterOperator: string;
    logStreamSelector: string;
    labelField: string;
}

@Component({
    selector: 'app-loki-results',
    templateUrl: './loki-results.component.html',
    styleUrls: ['./loki-results.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class LokiResultsComponent implements OnInit, AfterViewInit {
    private _pas = inject(PreferenceAdvancedService);
    private _srs = inject(SearchRemoteService);
    private _dtrs = inject(DateTimeRangeService);
    private searchService = inject(SearchService);
    private modules = inject(ModulesService);
    private cdr = inject(ChangeDetectorRef);

    @Input() id;
    @Input() dataItem: LokiDataItem;
    @Input() isDisplayResult = false;
    @Input() isResultPage = false;

    _logQlText = '';
    @Input() set logQlText(val) {
        this._logQlText = val;
        this.getLabels();
        this.isFirstSearch = true;
    }

    get logQlText() {
        return this._logQlText;
    }

    @Input() customTimeRangeQuery: unknown | null = null;

    queryText: string;
    queryObject: LokiQuery;
    rxText: string;
    showTime = true;
    showTags = false;
    showTs = false;
    showLabels = true;
    queryStatsNum = [];
    queryStatsText;
    checked: boolean;
    resultData: LokiLogRow[] = [];
    isFirstSearch = true;
    labels: string[] = [];
    lokiLabels: LokiLogRow[] = [];
    lokiTemplate: LokiTemplate;
    loading = false;
    resultsFound = true;
    dataError = false;
    @Output() ready = new EventEmitter<Record<string, never>>();

    ngOnInit() {
        this.customTimeRangeQuery ||= this._dtrs.getDatesForQuery(true);
        this.getLabels();
    }
    ngAfterViewInit() {
        window.requestAnimationFrame(() => {
            this.ready.emit({});
            this.doSerchResult();
        });
    }

    getLabels() {
        if (this.isDisplayResult) {
            this.queryText = this.logQlText || '{type="call"}';
            return;
        }

        this.lokiTemplate = {
            lineFilterOperator: '|~',
            logStreamSelector: '{job="heplify-server"}',
            labelField: 'callid'
        };
        this.modules.getModules().then(({ data: { loki } }) => {
            let labels: string;
            if (loki.template) {

                const matchOperator = loki.template.match(/\|=|\|~|!=|!~/);
                if (matchOperator && matchOperator[0]) {
                    this.lokiTemplate.lineFilterOperator = matchOperator[0];
                    loki.template = loki.template.replace(matchOperator[0], '')
                }
                const matchLabel = loki.template.match(/\s*"%(.*)%"/)
                if (matchLabel && matchLabel[1]) {
                    this.lokiTemplate.labelField = matchLabel[1];
                    loki.template = loki.template.replace(matchLabel[0], '')
                }
                this.lokiTemplate.logStreamSelector = loki.template;
            }
            if (this.lokiTemplate.labelField === 'callid') {
                labels = this.getCallidLabels();
            } else {
                labels = this.getGenericLabels();
                if (labels === '') {
                    labels = this.getCallidLabels();
                }
            }
            if (typeof this.lokiTemplate !== 'undefined') {
                this.queryText = `${this.lokiTemplate.logStreamSelector} ${this.lokiTemplate.lineFilterOperator} "${labels}"`;
                this.cdr.detectChanges();
            }
        });
        this.cdr.detectChanges();
    }
    getCallidLabels(): string {
        const labels = this.dataItem.data.callid
            .reduce((a, b) => {
                if (a.indexOf(b) === -1) {
                    a.push(b);
                }
                return a;
            }, [])
            .join('|');
        return labels;
    }
    getGenericLabels(): string {
        let labels: string[] = [];
        this.dataItem.data.messages.forEach(message => {
            console.log(message, message?.[this.lokiTemplate.labelField], this.lokiTemplate.labelField)
            const value = message?.[this.lokiTemplate.labelField];
            if (typeof value !== 'undefined') {
                labels.push(String(value));
            }
        });
        labels = Functions.arrayUniques(labels)
        return labels.join('|');
    }
    queryBuilder() {
        /** depricated, need use {SearchService} */

        return {
            param: {
                server: this.queryObject.serverLoki, // 'http://127.0.0.1:3100',
                limit: this.queryObject.limit * 1,
                search: this.queryObject.text,
                timezone: this.searchService.getTimeZoneLocal(),
            },
            timestamp: this._dtrs.getDatesForQuery(true),
        };
    }

    async doSerchResult() {  // here add loading when hit button
        this.queryStatsText = '';
        this.queryStatsNum = [];
        this.rxText = this.queryObject.rxText;
        this.isFirstSearch = false;
        this.loading = true;

        await this._srs.getData(this.queryBuilder()).toPromise().then(res => {

            this.resultData = res && res.data ? (res.data as LokiLogRow[]) : [];

            if (this.resultData.length > 0) {
                this.loading = false;
                this.lokiLabels = this.resultData.map((l) => {
                    l.custom_2 = this.labelsFormatter(l.custom_2 as string | Record<string, unknown>);
                    return l;
                });
                this.resultData = this.resultData.map((i) => {
                    i.custom_1 = this.highlight(i.custom_1);
                    return i;
                });

                this.resultsFound = true;

            } else {
                this.loading = false;
                this.resultsFound = false;
            }

        })
        this.loading = false;
        this.cdr.detectChanges();
    }
    onUpdateData(event: LokiQuery) {
        this.queryObject = event;
        this.queryObject.limit = 100;
        if (this.isDisplayResult && this.isFirstSearch) {
            this.doSerchResult();
        }
        this.cdr.detectChanges();
    }

    private labelsFormatter(rd: string | Record<string, unknown>): Record<string, unknown> {
        if (typeof rd === 'string') {
            return Functions.JSON_parse(rd) as Record<string, unknown>;
        }
        return rd || {};
    }

    identify(index: number, item: LokiLogRow): string | number {
        return item.micro_ts ?? index;
    }

    private highlight(value = '') {
        let data;
        if (this.rxText) {
            const rxText = this.rxText.replace(/\s|(\|=|\|~|!=|!~)|("|`)/g, '')
                .split('|').sort((a, b) => b.length - a.length).join('|');
            const regex = new RegExp('(' + rxText + ')', 'g');
            data = value
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(regex, (g, a) => {
                    return `<span>${a}</span>`;
                });
        } else {
            data = value || '';
        }
        return data;
    }
    showLabel(idx) {
        const tag = document.getElementById('label-' + idx)
        const icon = document.getElementById('icon-' + idx)
        if (tag.style.display === 'none') {
            tag.style.cssText = `
            display:flex;
            flex-direction:column;
            `;
            icon.innerText = 'keyboard_arrow_down'

        } else {
            tag.style.display = 'none'
            icon.innerText = 'navigate_next'
        }
    }
}
