import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatColumnDef, MatTable } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core'
@Component({
    selector: 'app-data-cell',
    templateUrl: './data-cell.component.html',
    styleUrls: ['./data-cell.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DataCellComponent implements OnInit {
    table = inject<MatTable<unknown>>(MatTable);
    private cdr = inject(ChangeDetectorRef);
    translateService = inject(TranslateService);

    @Output() settingDialog = new EventEmitter<{ item: unknown; type: 'data-preview' }>();
    @Input() column;
    @ViewChild(MatColumnDef) columnDef: MatColumnDef;

    constructor() {
         const translateService = this.translateService;

         translateService.addLangs(['en'])
        translateService.setFallbackLang('en')
       }

    ngOnInit() {
        if (this.table) {
          this.cdr.detectChanges();
          this.table.addColumnDef(this.columnDef);
        }
      }

}
