import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy, inject } from '@angular/core';
import { Widget, WidgetArrayInstance } from '@app/helpers/widget';
import { SettingAlertWidgetComponent } from './setting-alert-widget.component';
import { SnackBarComponent } from './snack-bar.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IWidget } from '../IWidget';
import { Functions } from '@app/helpers/functions';
import { TranslateService } from '@ngx-translate/core';
import { WidgetSettingsChange } from '@app/models';


export interface AlertConfig {
    id?: string;
    title: string;
    alertState: boolean;
    alertUrl: string;
    audioUrl: string;
    requestType: string;
    keyList: string[];
    postData: string;
    expectedList: string[];
    comparsionTypeList: string[];
    alertMessage: string;
    alertSuccessColor: string;
    alertFailColor: string;
    alertTextColor: string;
    alertDuration: number;
    alertSuccessColorArray: string[];
    alertFailColorArray: string[];
    alertTextColorArray: string[];
    comparsionLogic: string;
    showResponse: boolean;
}


@Component({
    selector: 'app-alert-widget',
    templateUrl: './alert-widget.component.html',
    styleUrls: ['./alert-widget.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
@Widget({
    title: 'Alert',
    description: 'Gives an alert when condition is met',
    category: 'Visualize',
    indexName: 'alert',
    className: 'AlertWidgetComponent',
    minHeight: 300,
    minWidth: 300
})

export class AlertWidgetComponent implements IWidget, OnInit, OnDestroy {
    dialog = inject(MatDialog);
    private http = inject(HttpClient);
    private _snackBar = inject(MatSnackBar);
    private cdr = inject(ChangeDetectorRef);
    translateService = inject(TranslateService);


    @Input() config: AlertConfig;
    @Input() id: string;
    @Output() changeSettings = new EventEmitter<WidgetSettingsChange<AlertConfig>>();

    displayMessage: string;
    private _interval;
    _config: AlertConfig;
    isConfig = false;

    constructor() {
        const translateService = this.translateService;

        translateService.addLangs(['en']);
        translateService.setDefaultLang('en');
    }

    ngOnInit() {
        WidgetArrayInstance[this.id] = this as IWidget;
        this._config = {
            title: 'Alert',
            id: this.id,
            alertState: false,
            alertUrl: '',
            audioUrl: '',
            requestType: 'POST',
            keyList: [''],
            postData: '',
            expectedList: [''],
            comparsionTypeList: ['=='],
            alertMessage: 'Your request was succesfull',
            alertSuccessColor: '#00bb00',
            alertFailColor: '#ff0000',
            alertTextColor: '#000000',
            alertDuration: 2,
            alertSuccessColorArray: ['#00bb00', '#00ff00'],
            alertFailColorArray: ['#ff0000', '#bb0000'],
            alertTextColorArray: ['#000000', '#eeeeff'],
            comparsionLogic: 'AND',
            showResponse: true,
        };
        if (this.config) {
            this.isConfig = true;
            this._config.title = this.config.title || 'Alert Widget';
            this._config.alertUrl = this.config.alertUrl || '';
            this._config.audioUrl = this.config.audioUrl || '';
            this._config.requestType = this.config.requestType || 'POST';
            this._config.keyList = this.config.keyList || ['Test1'];
            this._config.postData = this.config.postData || '{}';
            this._config.expectedList = this.config.expectedList || ['Test3'];
            this._config.comparsionTypeList = this.config.comparsionTypeList || ['=='];
            this._config.alertMessage = this.config.alertMessage;
            this._config.alertSuccessColor = this.config.alertSuccessColor;
            this._config.alertFailColor = this.config.alertFailColor;
            this._config.alertTextColor = this.config.alertTextColor;
            this._config.alertDuration = this.config.alertDuration;
            this._config.alertSuccessColorArray = this.config.alertSuccessColorArray;
            this._config.alertFailColorArray = this.config.alertFailColorArray;
            this._config.alertTextColorArray = this.config.alertTextColorArray;
            this._config.comparsionLogic = this.config.comparsionLogic;
            this._config.showResponse = this.config.showResponse;
        } else {
            this.isConfig = false;
        }
        this.update();
    };
    playAudio() {
        if (this._config.audioUrl) {
            const audio = new Audio();
            audio.src = this._config.audioUrl;
            audio.load();
            audio.play();
        }
    }
    makeRequest() {
        if (this._config.requestType === 'GET') {
            this.http.get<unknown>(this._config.alertUrl).subscribe(data => {
                for (let i = 0; i < this._config.expectedList.length; i++) {
                    if (this._config.expectedList[i] === data) {
                        this._config.alertState = true;
                    }
                }
                this.displayMessage = String(data ?? '');
            })
        } else if (this._config.requestType === 'POST') {
            let body = {};
            const comparsionResult = [];
            const httpOptions = {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            };
            body = Functions.JSON_parse(this._config.postData);
            this.http.post<unknown>(this._config.alertUrl, body, httpOptions).subscribe(data => {
                for (let i = 0; i < this._config.keyList.length; i++) {
                    if (data != null) {
                        this.displayMessage = JSON.stringify(data, null, 4);
                        if (this._config.comparsionLogic == 'AND') {
                            comparsionResult.push(this.compare(i, isRecord(data) ? data : {}));
                        } else {
                            if (this.compare(i, isRecord(data) ? data : {})) {
                                this._config.alertState = true;
                            }
                        }
                    } else {
                        this.displayMessage = null;
                    }

                    if (comparsionResult.every(x => x == true) && comparsionResult.length == this._config.expectedList.length) {
                        this._config.alertState = true;
                    }
                }
            })

        }
    }

    update() {
        if (this._interval) {
            clearInterval(this._interval);
        }
        if (this._config.alertUrl) {
            this._interval = setInterval(() => {
                this.makeRequest();
                if (this._config.alertState) {
                    this.playAudio();
                    this.openSnackBar();
                    clearInterval(this._interval);
                }
                this.cdr.detectChanges();
            }, 1000);
        }
        setTimeout(() => {
            this.cdr.detectChanges();
        });
    }

    compare(i: number, data: Record<string, unknown>) {
        const { keyList, expectedList, comparsionTypeList } = this._config || {};
        const [a, b, type] = [data[keyList[i]], expectedList[i], comparsionTypeList[i]];
        const numericA = Number(a);
        const numericB = Number(b);
        const bothNumeric = Number.isFinite(numericA) && Number.isFinite(numericB);
        const equal = bothNumeric ? numericA === numericB : String(a) === String(b);
        const greater = bothNumeric ? numericA > numericB : String(a) > String(b);
        const less = bothNumeric ? numericA < numericB : String(a) < String(b);
        const out = {
            '>': greater,
            '<': less,
            '>=': greater || equal,
            '<=': less || equal,
            '==': equal,
            '!=': !equal
        };
        this.cdr.detectChanges();
        return out[type];
    }

    async openDialog() {
        const dialogRef = this.dialog.open(SettingAlertWidgetComponent, {
            width: '550px',
            data: Functions.cloneObject(this._config)
        });
        const data = await dialogRef.afterClosed().toPromise();
        if (data) {
            Object.entries(data).forEach(([key, value]) => {
                this._config[key] = value;
            });
            this.changeSettings.emit({
                config: this._config,
                id: this.id,
            });
            this.isConfig = true;
            this.update();
        }
        this.cdr.detectChanges();
    }
    openSnackBar() {
        this._snackBar.openFromComponent(SnackBarComponent, {
            duration: this._config.alertDuration * 1000,
            data: {
                alertMessage: this._config.alertMessage,
                alertSuccessColor: this._config.alertSuccessColor,
                alertTextColor: this._config.alertTextColor,
            }
        });
        this.cdr.detectChanges();
    }
    ngOnDestroy() {
        clearInterval(this._interval);
    }

}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}
