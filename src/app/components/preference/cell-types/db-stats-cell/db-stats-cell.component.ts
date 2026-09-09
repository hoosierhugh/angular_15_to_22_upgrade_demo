import { ChangeDetectorRef, Component, Input, OnInit, ViewChild, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatColumnDef, MatTable } from '@angular/material/table';

@Component({
    selector: 'app-db-stats-cell',
    templateUrl: './db-stats-cell.component.html',
    styleUrls: ['./db-stats-cell.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DbStatsCellComponent implements OnInit {
    table = inject<MatTable<unknown>>(MatTable);
    private cdr = inject(ChangeDetectorRef);

    @Input() column;
    @ViewChild(MatColumnDef) columnDef: MatColumnDef;

    ngOnInit() {
        if (this.table) {
          this.cdr.detectChanges();
          this.table.addColumnDef(this.columnDef);
        }
      }

}
