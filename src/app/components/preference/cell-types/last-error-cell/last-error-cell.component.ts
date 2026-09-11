
import { ChangeDetectorRef, Component, Input, OnInit, ViewChild, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatColumnDef, MatTable } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core'
@Component({
    selector: 'app-last-error-cell',
    templateUrl: './last-error-cell.component.html',
    styleUrls: ['./last-error-cell.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class LastErrorCellComponent implements OnInit {
  table = inject<MatTable<unknown>>(MatTable);
  private cdr = inject(ChangeDetectorRef);
  translateService = inject(TranslateService);

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
