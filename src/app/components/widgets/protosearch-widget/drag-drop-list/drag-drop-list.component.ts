import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';

interface DragDropItem {
    id?: string | number;
    field?: string;
    field_name?: string;
    name?: string;
    selected?: boolean;
    idx?: number;
}

interface DragDropOrderEvent {
    sortedProto: DragDropItem[];
    newProto: DragDropItem[];
    event: CdkDragDrop<DragDropItem[]>;
}

@Component({
    selector: 'app-protosearch-drag-drop-list',
    templateUrl: './drag-drop-list.component.html',
    styleUrls: ['./drag-drop-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})

export class DragDropListComponent implements OnInit {
    _list: DragDropItem[] = [];
    inactiveList: DragDropItem[] = [];
    activeList: DragDropItem[] = [];

    @Output() changed = new EventEmitter<DragDropItem[]> ();
    @Output() order = new EventEmitter<DragDropOrderEvent> ();
    @Input() sortlistactive: DragDropItem[] = [];
    @Input() set list(val: DragDropItem[]) {
        this._list = val;
        this.activeList = [];
        this.inactiveList = [];
        this.list.forEach((item: DragDropItem) => {
            if (item.selected) {
                this.activeList.push(item);
            } else {
                this.inactiveList.push(item);
            }
        });
    }

    get list() {
        return this._list;
    }

    ngOnInit () {
        if (this.sortlistactive && this.sortlistactive.length > 0) {
            const _activeList = [];
            this.sortlistactive.forEach((item: DragDropItem) => {
                _activeList.push(this.activeList.find(i => i.id === item.field_name));

            });
            this.activeList = _activeList;
        }
    }

    drop(event: CdkDragDrop<DragDropItem[]>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(
                event.container.data,
                event.previousIndex,
                event.currentIndex
            );
        } else {
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex
            );
        }
        this.inactiveList.forEach((item: DragDropItem) => {
            item.selected = false;
        });

        this.activeList.forEach((item: DragDropItem) => {
            item.selected = true;
        });
        const newProto = this.activeList.concat(this.inactiveList);
        const sortedProto = newProto.sort((a, b) => (a.idx ?? 0) - (b.idx ?? 0));
        this.changed.emit(newProto);
        this.order.emit({
            sortedProto: sortedProto,
            newProto: newProto,
            event: event
        });
    }
}
