import { Component, ChangeDetectionStrategy } from '@angular/core';
import {ICellRendererAngularComp} from 'ag-grid-angular';
import { SearchGridCellParams } from './search-grid-renderer.types';

@Component({
    template: `
        <span class='cell-wrapper' (click)='copy(data)'>
            <div class="loki-highlight" [innerHTML]="data"></div>
        </span>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})

export class LokiHighlightRenderer implements ICellRendererAngularComp {
    public params: SearchGridCellParams;
    data: string;

    agInit(params: SearchGridCellParams): void {
        this.params = params;
        const rxText = this.params.context.componentParent.searchQueryLoki.rxText;
        if (!!rxText) {
            const regex = new RegExp('(' + rxText + ')', 'g');
            this.data = this.htmlSpecialChars(String(this.params.value ?? ''))
                .replace(regex, (g, a) => `<span>${a}</span>`);
        } else {
            this.data = this.htmlSpecialChars(String(this.params.value ?? ''));
        }
    }
    private htmlSpecialChars(s: string) {
        return s.replace(/\</g, '&lt;').replace(/\>/g, '&gt;');

    }
    
    copy(value) {
        this.params.context.componentParent.copy(value);
    }
    refresh(): boolean {
        return false;
    }
}
