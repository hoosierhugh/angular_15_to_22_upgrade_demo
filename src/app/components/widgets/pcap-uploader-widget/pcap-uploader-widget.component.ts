import { AlertService } from '@it-app/services/alert.service';
import { PcapUploaderService } from './pcap-uploader.service';
import { Component, Input, Output, EventEmitter, AfterViewInit, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { Widget } from '@app/helpers/widget';
import { IWidget } from '../IWidget';
import { TranslateService } from '@ngx-translate/core'

@Component({
    selector: 'app-pcap-uploader-widget',
    templateUrl: './pcap-uploader-widget.component.html',
    styleUrls: ['./pcap-uploader-widget.component.scss'],
    standalone: false
})
@Widget({
    title: 'PCAP Uploader',
    description: 'Display date and time',
    category: 'Utils',
    indexName: 'pcapUpload',
    className: 'PcapUploaderWidgetComponent',
    settingWindow: false,
    minHeight: 300,
    minWidth: 300
})
export class PcapUploaderWidgetComponent implements IWidget, AfterViewInit {
    idDrugOver = false;
    data: unknown;
    filename: string;
    filesize: string;
    fileToUpload: File | null = null;
    inProgress = false;
    isDataTimeNow = false;
    @Input() config: unknown;
    @Input() index: string;
    @Input() id: string;

    @Output() changeSettings = new EventEmitter<unknown>();

    @ViewChild('fileSelect', { static: true }) fileSelect: ElementRef<HTMLInputElement>;

    constructor(
        private pcapUploaderService: PcapUploaderService,
        private cdr: ChangeDetectorRef,
        public alertService: AlertService,
       public translateService: TranslateService
    ) { 
        translateService.addLangs(['en'])
        translateService.setDefaultLang('en')
    }

    ngAfterViewInit() {
        const hsp = (event: Event) => {
            this.idDrugOver = event.type === 'dragover';
            event.preventDefault();
            event.stopPropagation();
        };
        const handlerDrop = (event: DragEvent) => {
            hsp(event);
            Array.from(event.dataTransfer?.files || []).forEach(file => this.handlerUpload(file));
        };
        const element = this.fileSelect.nativeElement;
        ['submit', 'drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave']
            .forEach(eventName => element.addEventListener(eventName, hsp));
        element.addEventListener('drop', handlerDrop);
        element.addEventListener('change', () => {
            const file = element.files?.[0];
            if (file) {
                this.handlerUpload(file);
            }
        });
    }

    private handlerUpload(file: File) {
        this.filename = file.name;
        this.filesize = (file.size / 1024).toFixed(2);
        this.fileToUpload = file;
        this.cdr.detectChanges();
    }
    onSubmit() {
        if (!this.fileToUpload) {
            return;
        }
        this.inProgress = true;
        this.pcapUploaderService.postFile(this.fileToUpload, this.isDataTimeNow).subscribe(data => {
            this.inProgress = false;
            this.alertService.success({
                isTranslation: true, 
                message: 'notifications.success.fileUpload'
            });
            this.filename = '';
            this.cdr.detectChanges();
        }, error => {
            this.filename = '';
            this.inProgress = false;
            console.log(error);
        });
    }
    openDialog(): void { }

    ngOnInit() { }

    ngOnDestroy() { }
}
