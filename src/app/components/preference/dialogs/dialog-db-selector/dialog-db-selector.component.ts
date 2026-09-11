import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthenticationService } from '@app/services';
import { TranslateService } from '@ngx-translate/core'

interface DatabaseSelectionDialogData {
    data: {
        db_list: string[];
        table_list: string[];
        db_src: string;
        node_dst: string;
        tables: string[];
        [key: string]: string | string[];
    };
}
@Component({
    selector: 'app-dialog-db-selector',
    templateUrl: './dialog-db-selector.component.html',
    styleUrls: ['./dialog-db-selector.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class DialogDBSelectorComponent {
    private authService = inject(AuthenticationService);
    translateService = inject(TranslateService);
    dialogRef = inject<MatDialogRef<DialogDBSelectorComponent>>(MatDialogRef);
    data = inject<DatabaseSelectionDialogData>(MAT_DIALOG_DATA);

    isValidForm = false;
    isAdmin = false;
    canSave = false;
    node_src = new FormControl('');
    node_dst = new FormControl('');
    tables = new FormControl<string[]>([]);
    tableSelection: string[] = [];
    nodeSelection: string[] = [];
    dialogData;
    constructor() {
        const translateService = this.translateService;
        const data = this.data;

        translateService.addLangs(['en'])
        translateService.setFallbackLang('en')

        this.nodeSelection = data.data.db_list;
        this.tableSelection = data.data.table_list;
        const userData = this.authService.currentUserValue;
        this.isAdmin = !!userData?.user?.admin;

        (d => {
            this.node_src.setValue(d.db_src);
            this.node_dst.setValue(d.node_dst);
            this.tables.setValue(d.tables);

        })(data.data);
        this.isValidForm = true;
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
    onSubmit() {
        if (!this.node_src?.invalid &&
            !this.node_dst?.invalid &&
            !this.tables?.invalid
        ) {
            (d => {
                d.node_src = this.node_src?.value;
                d.node_dst = this.node_dst?.value;
                d.tables = this.tables?.value;

            })(this.data.data);
            this.dialogRef.close(this.data);
        } else {
            this.node_src.markAsTouched();
            this.node_dst.markAsTouched();
            this.tables.markAsTouched();

        }
    }
    isSrc(opt) {
        return opt === this.node_src.value;
    }
    isDst(opt) {
        return opt === this.node_dst.value;
    }
    disableClose(e) {
        this.dialogRef.disableClose = e;
    }

    onSelectionChange($event) {


        const selectionId = $event?.source?._id;
        (d => {
            d[selectionId] = this[selectionId]?.value;
        })(this.data.data);

        if (this.tables.value.length > 0 && this.node_dst.value !== '' && this.node_src.value !== '') {
            this.canSave = true;
        }
    }
}
