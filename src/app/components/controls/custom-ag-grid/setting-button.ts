import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { emitWindowResize } from '@app/helpers/windowFunctions';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

interface GridColumn {
  colDef: {
    field?: string;
    headerName?: string;
  };
  visible: boolean;
}

interface GridColumnState {
  colId: string;
  hide?: boolean;
}

interface GridColumnApi {
  getAllGridColumns(): GridColumn[];
  getAllColumns(): GridColumn[];
  getColumnState(): GridColumnState[];
  setColumnVisible(columnKey: string, visible: boolean): void;
  moveColumn(columnKey: string, toIndex: number): void;
}

interface SettingButtonParams {
  value?: string;
  displayName?: string;
  columnApi: GridColumnApi;
}

interface ColumnListItem {
  name: string;
  field?: string;
  selected: boolean;
  idx: number;
}

interface ColumnListContainer {
  id: string;
  data: Array<Pick<ColumnListItem, 'field' | 'selected'>>;
}

@Component({
    selector: 'app-setting-button',
    templateUrl: 'setting-button.html',
    styleUrls: ['setting-button.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class SettingButtonComponent implements ICellRendererAngularComp {
  public params: SettingButtonParams;
  callid: string;
  isFilterOpened = false;
  allColumnIds: ColumnListItem[] = [];
  apiColumn: GridColumnApi;
  headerName = '';
  @Input() isTab = false;
  constructor(private cdr: ChangeDetectorRef) { }

  agInit(params: ICellRendererParams): void {
    this.params = params as unknown as SettingButtonParams;
    this.callid = this.params.value || null;
    this.headerName = this.params.displayName || '';
    this.apiColumn = this.params.columnApi;
    this.params.columnApi.getAllGridColumns()
      .filter((column) => !['', 'id'].includes(column.colDef.field))
      .forEach((column, index) => this.allColumnIds.push({
        name: column.colDef.headerName || column.colDef.field,
        field: column.colDef.field,
        selected: column.visible,
        idx: index
      }));
    this.cdr.detectChanges();
  }


  refresh(): boolean {
    return false;
  }
  hideFilter() {
    this.isFilterOpened = false;
    this.cdr.detectChanges();
  }
  onUpdateList({ event: { container } }: { event: { container: ColumnListContainer } }) {
    if (this.apiColumn.getAllColumns()) {
      const activeListView = container.id === 'activeListView' ? container : null;
      const inactiveListView = container.id === 'inactiveListView' ? container : null;
      const columnState = this.apiColumn.getColumnState();
      const setVisible = (fName, bool) => {
        if (columnState.find(({ colId }) => colId === fName)?.hide === bool) {
          this.apiColumn.setColumnVisible(fName, bool);
        }
      };
      inactiveListView?.data.forEach(({ field, selected }) => setVisible(field, selected));
      activeListView?.data.forEach(({ field, selected }, key) => {
        setVisible(field, selected);
        this.apiColumn.moveColumn(field, key + 1);
      });
      setTimeout(() => emitWindowResize(), 100);
    }
  }
  doOpenFilter() {
    if (this.isFilterOpened) {
      return;
    }
    setTimeout(() => {
      this.isFilterOpened = true;
      this.cdr.detectChanges();
    });
    this.cdr.detectChanges();
  }
}
