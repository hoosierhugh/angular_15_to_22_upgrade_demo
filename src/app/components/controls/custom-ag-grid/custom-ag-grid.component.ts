import { ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnInit, Output, ChangeDetectionStrategy, inject } from '@angular/core';
import { Functions } from '@app/helpers/functions';
import { DateFormat } from '@app/services/time-formatting.service';
import { CellClickedEvent, ColDef, GridApi, GridOptions, GridReadyEvent, RowClassParams } from 'ag-grid-community';
import { SettingButtonComponent } from './setting-button';

type GridRow = Record<string, unknown>;

@Component({
    selector: 'app-custom-ag-grid',
    templateUrl: './custom-ag-grid.component.html',
    styleUrls: ['./custom-ag-grid.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CustomAgGridComponent implements OnInit {
    private cdr = inject(ChangeDetectorRef);

    agGridSizeControl = {
        selectedType: 'sizeToFit',
        // pageSize: 100
    };
    agColumnDefs: ColDef<GridRow>[] = [];
    _details: GridRow[] = [];
    frameworkComponents: Record<string, unknown>;
    gridOptions: GridOptions<GridRow> = {
        defaultColDef: {
            sortable: true,
            resizable: true,
        },
        rowHeight: 38,
        rowSelection: 'multiple',
        suppressRowClickSelection: true,
        suppressPaginationPanel: true
    };
    _columns: ColDef<GridRow>[] = [];
    gridApi: GridApi<GridRow>;
    @Input() dateFormat: DateFormat;
    @Input() customTimeParser: (columnType: string, value: string) => string;
    @Input() set details(val) {
        this._details = Functions.cloneObject(val);
        this.re_new();
    }
    get details() {
        return this._details;
    }
    @Input() set columns(val: string[] | ColDef<GridRow>[]) {
        if (!val) {
            return;
        }
        const visibleColumns = val.filter((column): column is string => typeof column === 'string');
        const isDetailsReady = () => {
            if (this.details?.length) {
                const [firstItemOfDetails] = this.details;

                this._columns = Object.entries(firstItemOfDetails)
                    .filter(([, value]: [string, unknown]) => typeof value !== 'object' || value instanceof Array)
                    .map(([column]: [string, unknown]) => {

                        const aliasFromKey: Record<string, string> = {
                            'srcAlias_srcPort': 'SRC IP with Port',
                            'dstAlias_dstPort': 'DST IP with Port',
                            'diff': 'Delta',
                            'id': 'ID',
                            'create_date': 'Date',
                            'timeSeconds': 'Timestamp',
                            'ip_tos': 'IP TOS',
                            'Msg_Size': 'Msg. Size',
                        }
                        const dateTimeField = {
                            create_date: 'date',
                            timeSeconds: 'time'
                        }
                        //({ value }) =>
                        // value && moment(value).format(this.dateFormat.dateTimeResults)
                        return {
                            field: column,
                            headerName: aliasFromKey[column] || column,
                            hide: !visibleColumns.includes(column),
                            valueFormatter: !!dateTimeField[column] && this.customTimeParser ? ({value}) => this.customTimeParser(dateTimeField[column], value) : null
                        }
                    });

                this._columns.push({
                    field: '',
                    headerName: '',
                    headerComponent: 'settings',
                    hide: false,
                    pinned: 'left',
                    lockPinned: true,
                    resizable: false,
                    minWidth: 40,
                    maxWidth: 40
                });
                this.re_new();
            } else {
                setTimeout(() => {
                    isDetailsReady();
                });
            }
        };
        isDetailsReady();
    }
    get columns(): ColDef<GridRow>[] {
        return this._columns;
    }
    @Output() rowClick = new EventEmitter<CellClickedEvent<GridRow>>();

    @HostListener('dblclick')
    onDblClick() {
        requestAnimationFrame(() => {
            this.gridApi?.sizeColumnsToFit();
        });
    }

    // @HostListener('window:resize')
    onResize() {
        if (!this.gridApi || this.agGridSizeControl.selectedType !== 'sizeToFit') {
            return;
        }

        requestAnimationFrame(() => {
            if (this.agGridSizeControl.selectedType === 'sizeToFit') {
                this.gridApi?.sizeColumnsToFit();
            }
        });
    }
    onGridReady(params: GridReadyEvent<GridRow>) {
        this.gridApi = params.api;
    }
    constructor() {
        this.frameworkComponents = {
            settings: SettingButtonComponent
        };
    }

    ngOnInit() {
        this.re_new();
    }
    private re_new() {
        this.sizeToFit();
        this.cdr.detectChanges();
    }
    private sizeToFit() {
        setTimeout(() => {
            this.gridApi?.sizeColumnsToFit();
            this.cdr.detectChanges();
        }, 100);
    }

    public getRowStyle(params: RowClassParams<GridRow>): Record<string, string> {
        const _style: Record<string, string> = {
            'border-bottom': '1px solid rgba(0,0,0,0.1)',
            'cursor': 'pointer'
        }
        if (params.node.rowIndex % 2 === 0) {
            _style.background = '#e4f0ec';
        }
        return _style;
    }
    sortChanged(event) {
        this.cdr.detectChanges();
    }
    cellClicked(event: CellClickedEvent<GridRow>) {
        this.rowClick.emit(event);
    }
    doOpenFilter() {
        // Hook for the filter button; this grid has no custom filter panel.
    }
}
