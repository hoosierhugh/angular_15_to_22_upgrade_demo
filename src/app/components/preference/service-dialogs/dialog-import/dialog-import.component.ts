import { HttpEvent, HttpEventType, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, ChangeDetectionStrategy, ViewChild, ElementRef, AfterViewInit, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileUploadModel } from '@app/components';
import { AuthenticationService } from '@app/services';
import { UploadService } from '@app/services/upload.service';
import { of } from 'rxjs';
import { map, tap, last, catchError } from 'rxjs/operators';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { TranslateService } from '@ngx-translate/core'
import { ApiResponse } from '@app/models';

interface ImportDialogData {
    data: { pageId: string };
}

interface UploadFile {
    data: File;
    inProgress: boolean;
    progress: number;
    canRetry: boolean;
    canCancel: boolean;
}
@Component({
    selector: 'app-dialog-import',
    templateUrl: './dialog-import.component.html',
    styleUrls: ['./dialog-import.component.scss'],
    animations: [
        trigger('fadeInOut', [
            state('in', style({ opacity: 100 })),
            transition('* => void', [
                animate(300, style({ opacity: 0 }))
            ])
        ])
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class DialogImportComponent implements AfterViewInit, OnInit {
    uploadService = inject(UploadService);
    translateService = inject(TranslateService);
    dialogRef = inject<MatDialogRef<DialogImportComponent>>(MatDialogRef);
    private cdr = inject(ChangeDetectorRef);
    data = inject<ImportDialogData>(MAT_DIALOG_DATA);

    @ViewChild('fileUpload', { static: false }) fileUpload: ElementRef<HTMLInputElement>;
    pageId: string;
    isReplace = false;
    isUploading = false;
    isDragOver = false;
    isUploaded = false;
    isHomer2 = false;
    uploadInfo = '';
    file: FileUploadModel;
    files: UploadFile[] = [];
    constructor() {
        const translateService = this.translateService;
        const data = this.data;

        translateService.addLangs(['en'])
        translateService.setDefaultLang('en')
        this.pageId = data.data.pageId;
    }
    ngOnInit() {
    }
    ngAfterViewInit() {
        const hsp = e => {
            this.isDragOver = e.type === 'dragover';
            e.preventDefault();
            e.stopPropagation();
        };
        const handlerDrop = e => {
            hsp(e);
            this.onImport(e.dataTransfer.files)
        };
        const objEvents = {
            submit: hsp, drag: hsp, dragstart: hsp, dragend: hsp,
            dragover: hsp, dragenter: hsp, dragleave: hsp,
            drop: handlerDrop, change: e => this.onImport(e.target.files)
        };
        Object.keys(objEvents).forEach(eventName => {
            this.fileUpload.nativeElement.addEventListener(eventName, objEvents[eventName]);
        });
    }
    onNoClick(): void {
        this.dialogRef.close({
            isUploaded: this.isUploaded
        });
    }
    onImport(files: FileList) {
        Array.from(files).forEach(file => {
            this.files.push({ data: file, inProgress: false, progress: 0, canRetry: false, canCancel: true });
        });
        this.uploadFiles();
    }
    private removeFileFromArray(file: UploadFile) {
        const index = this.files.indexOf(file);
        if (index > -1) {
            this.files.splice(index, 1);
        }
    }
    private uploadFiles() {
        this.fileUpload.nativeElement.value = '';
        this.files.forEach((file) => {
            this.uploadFile(file);
        });
    }
    uploadFile(file: UploadFile) {
        const formData = new FormData();
        formData.append('file', file.data);
        file.inProgress = true;
        this.isUploading = true;
        this.cdr.detectChanges();
        const type = this.pageId === 'users' ? 'users' : 'ipalias';
        this.uploadService
            .upload(formData, type, this.isReplace, this.isHomer2)
            .pipe(
                map((event) => {
                    switch (event.type) {
                        case HttpEventType.UploadProgress:
                            file.progress = Math.round(
                                (event.loaded * 100) / event.total
                            );
                            this.cdr.detectChanges();
                            break;
                        case HttpEventType.Response:
                          return event;
                  }
                  return event;
                }),
                tap(message => { }),
                last(),
                catchError((error: HttpErrorResponse) => {
                    file.inProgress = false;
                    file.canRetry = true;
                    this.isUploading = false;
                    return of(`Upload failed: ${file.data.name}`);
                })
            )
            .subscribe((event: HttpEvent<ApiResponse<unknown>> | string) => {
                if (event instanceof HttpResponse) {
                    if (event.body?.data) {
                        this.isUploaded = true;
                        this.removeFileFromArray(file);
                        this.uploadInfo = 'Response: info: ' + JSON.stringify(event.body);

                        setTimeout(() => {
                            this.isUploading = false;
                            this.cdr.detectChanges();
                        }, 5000);
                    }
                }
            });
    }
    cancelFile(file: FileUploadModel) {
        file.sub.unsubscribe();
        this.removeFileFromArray(file);
    }

    retryFile(file: FileUploadModel) {
        this.uploadFile(file);
        file.canRetry = false;
    }
}
