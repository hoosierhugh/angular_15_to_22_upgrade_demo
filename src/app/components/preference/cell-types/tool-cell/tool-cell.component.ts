import { ChangeDetectorRef, Component, Input, OnInit, Output, ViewChild, EventEmitter, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatColumnDef, MatTable } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
@Component({
    selector: 'app-tool-cell',
    templateUrl: './tool-cell.component.html',
    styleUrls: ['./tool-cell.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ToolCellComponent implements OnInit {
    table = inject<MatTable<unknown>>(MatTable);
    private cdr = inject(ChangeDetectorRef);
    translateService = inject(TranslateService);

    @Input() column: string;
    @Input() isAccess: Record<string, boolean>;
    @Input() page: string;
    @ViewChild(MatColumnDef) columnDef: MatColumnDef;
    @Output() settingDialog = new EventEmitter<unknown>();
    @Output() resyncDialog = new EventEmitter<unknown>();
    @Output() resetDialog = new EventEmitter<unknown>();
    @Output() deleteDialog = new EventEmitter<unknown>();
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

    childCount(div: Element) {
        return div.childElementCount;
    }
}
