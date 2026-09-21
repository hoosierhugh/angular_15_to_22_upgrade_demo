import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-setting-button',
    templateUrl: './setting-button.component.html',
    styleUrls: ['./setting-button.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports: [
        MatButtonModule,
        FontAwesomeModule
    ]
})
export class SettingButtonComponent {
    @Input() isAccess: Record<string, boolean>;
    @Output() addDialog = new EventEmitter<void>();
    @Output() importDialog = new EventEmitter<void>();
    @Output() exportDialog = new EventEmitter<void>();
}
