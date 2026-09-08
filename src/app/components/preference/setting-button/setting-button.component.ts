import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-setting-button',
    templateUrl: './setting-button.component.html',
    styleUrls: ['./setting-button.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class SettingButtonComponent implements OnInit {
    @Input() isAccess: Record<string, boolean>;
    @Output() addDialog = new EventEmitter<void>();
    @Output() importDialog = new EventEmitter<void>();
    @Output() exportDialog = new EventEmitter<void>();
    constructor() { }

    ngOnInit(): void {
    }
}
