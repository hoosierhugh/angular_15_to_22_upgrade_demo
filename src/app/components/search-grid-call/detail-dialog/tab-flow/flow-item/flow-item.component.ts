import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  AfterViewChecked,
  ChangeDetectorRef,
} from '@angular/core';
import { Functions } from '@app/helpers/functions';

@Component({
  selector: 'app-flow-item',
  templateUrl: './flow-item.component.html',
  styleUrls: ['./flow-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlowItemComponent implements AfterViewChecked {
  _item: FlowDisplayItem;
  @Input() set item(val: FlowDisplayItem) {
    this._item = val;
  }
  get item(): FlowDisplayItem {
    return this._item;
  }
  @Input() isSimplify = true;
  @Input() isGroupByAlias = false;
  @Input() idx = 0;
  @Input() isAbsolute: boolean = false;
  @Output() itemClick = new EventEmitter<{ idx: number; event: MouseEvent }>();

  constructor(private cdr: ChangeDetectorRef) { }

  onClickItem(idx, event) {
    this.itemClick.emit({ idx, event });
  }

  MOSColorGradient(hue) {
    return Functions.MOSColorGradient(hue * 100, 80, 50);
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }
}

interface FlowDisplayItem {
  method_text?: string;
  description?: string;
  source_ip?: string;
  source_port?: string | number;
  destination_ip?: string;
  destination_port?: string | number;
  info_date?: string;
  diff_absolute?: string;
  diff?: string;
  QOS?: { MOS?: number; qosTYPEless?: string };
  options: {
    color?: string;
    color_method?: string;
    start?: number;
    middle?: number;
    rightEnd?: number;
    direction?: boolean;
    isRadialArrow?: boolean;
    isLastHost?: boolean;
    arrowStyleSolid?: boolean;
  };
}
