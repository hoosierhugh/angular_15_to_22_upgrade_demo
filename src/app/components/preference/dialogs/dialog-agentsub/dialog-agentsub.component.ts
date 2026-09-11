import { Component, ChangeDetectionStrategy, ViewChild, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core'
import { CrudDialogData } from '@app/models';

interface AgentSubscriptionDialogRecord {
    hep_alias?: string;
    hepid?: number | string;
    profile?: string;
    data?: unknown;
    mapping?: string;
}
@Component({
    selector: 'app-dialog-agentsub',
    templateUrl: './dialog-agentsub.component.html',
    styleUrls: ['./dialog-agentsub.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})

export class DialogAgentsubComponent {
    dialogRef = inject<MatDialogRef<DialogAgentsubComponent>>(MatDialogRef);
    translateService = inject(TranslateService);
    data = inject<CrudDialogData<AgentSubscriptionDialogRecord>>(MAT_DIALOG_DATA);

    @ViewChild('data_view', { static: false }) editor;
    isDisabled = false;


    constructor() {
        const translateService = this.translateService;
        const data = this.data;

        translateService.addLangs(['en'])
        translateService.setFallbackLang('en')
        if (data.isnew) {
            data.data = {};
        }
        data.data.mapping = data.isnew ?
            '' :
            (typeof data.data.mapping === 'string' ?
                data.data.mapping :
                JSON.stringify(data.data.mapping, null, 4)
            );
    }

    validate() {
        if (this.editor.getEditor().getSession().getAnnotations().length > 0) {
            this.isDisabled = true;
        } else {
            this.isDisabled = false;
        }
    }
    disableClose(e) {
        this.dialogRef.disableClose = e;
    }
    onNoClick(): void {
        this.dialogRef.close();
    }
}
