
import { ChangeDetectorRef, Component, Input, OnInit, ViewChild, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatColumnDef, MatTable } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core'
@Component({
    selector: 'app-active-cell',
    templateUrl: './active-cell.component.html',
    styleUrls: ['./active-cell.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ActiveCellComponent implements OnInit {
    table = inject<MatTable<unknown>>(MatTable);
    private cdr = inject(ChangeDetectorRef);
    translateService = inject(TranslateService);

    @Input() column;
    @Input() columnName = 'Status';

    @Input() options: {
        option1: string;
        option2: string;
    };
    @ViewChild(MatColumnDef) columnDef: MatColumnDef;

    constructor() {
            const translateService = this.translateService;

            translateService.addLangs(['en'])
            translateService.setDefaultLang('en')
    }

    ngOnInit() {
        if (this.table) {
            this.cdr.detectChanges();
            this.table.addColumnDef(this.columnDef);
        }
      }
}
