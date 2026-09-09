import { ChangeDetectorRef, Component, Input, OnInit, ViewChild, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatColumnDef, MatTable } from '@angular/material/table';

@Component({
    selector: 'app-generic-cell',
    templateUrl: './generic-cell.component.html',
    styleUrls: ['./generic-cell.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class GenericCellComponent implements OnInit {
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
