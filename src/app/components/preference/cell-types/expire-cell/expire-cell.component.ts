import { ChangeDetectorRef, Component, Input, OnInit, ViewChild, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatColumnDef, MatCellDef, MatTable } from '@angular/material/table';
import  moment from 'moment';
@Component({
    selector: 'app-expire-cell',
    templateUrl: './expire-cell.component.html',
    styleUrls: ['./expire-cell.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})

export class ExpireCellComponent implements OnInit {
  table = inject<MatTable<unknown>>(MatTable);
  private cdr = inject(ChangeDetectorRef);

  @Input() column;
  @Input() timeFormat;
  @ViewChild(MatColumnDef) columnDef: MatColumnDef;
  @ViewChild(MatCellDef) cellDef: MatCellDef;
  dateFormat;

  ngOnInit() {

    if (this.table) {
      this.cdr.detectChanges();
      this.table.addColumnDef(this.columnDef);
    }
  }
 expired(t) {
      const now = moment().unix();
      const record =  moment(t).unix();
     if(now && record){
     return now > record
    } else { return false }
  }

  formatDate(item) {
    return moment(item).format(this.timeFormat);
  }
}
