import { Component, ViewChild, ViewContainerRef, ChangeDetectionStrategy, inject } from '@angular/core';
import {
    IAfterGuiAttachedParams,
    IDoesFilterPassParams,
    IFilterParams
} from 'ag-grid-community';
import { IFilterAngularComp } from 'ag-grid-angular';
import { PreferenceMappingProtocolService } from '@app/services';
import { Functions } from '@app/helpers/functions';
import { ConstValue, PreferenceMapping, UserConstValue } from '@app/models';

interface StatusFilterModel { value: string; }
@Component({
    selector: 'app-status-filter',
    templateUrl: 'status-filter.component.html',
    styleUrls: ['status-filter.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class StatusFilterComponent implements IFilterAngularComp {
    private _pmps = inject(PreferenceMappingProtocolService);

    private params: IFilterParams;
    public text = '';
    private statusMapping;

    @ViewChild('input', { read: ViewContainerRef }) public input;
    async agInit(params: IFilterParams) {
        const mappings: PreferenceMapping[] = await this._pmps.getMerged().toPromise();
        const ls = Functions.JSON_parse<{ protocol_id?: string }>(localStorage.getItem(UserConstValue.SEARCH_QUERY)) ||
            Functions.JSON_parse<{ protocol_id?: string }>(localStorage.getItem(ConstValue.SEARCH_QUERY));

        const { fields_mapping } = mappings.find(({ hepid, profile }) =>
                `${hepid}_${profile}` === (ls?.protocol_id || '60_call_h20')) || {};

        this.statusMapping = fields_mapping.find(field => field.id === 'status').form_default;
        this.params = params;
    }

    isFilterActive(): boolean {
        return this.text != null && this.text !== '';
    }

    doesFilterPass(params: IDoesFilterPassParams): boolean {
        const mappingName = this.statusMapping.find(status => {
            const value = this.text.toLowerCase();
            return status.name.toLowerCase().startsWith(value)
                || status.value === parseInt(this.text, 10);
        });
        if (typeof mappingName !== 'undefined') {
            return mappingName.value === this.params.getValue(params.node);
      }
      return false;
    }

    getModel(): StatusFilterModel {
        return { value: this.text };
    }

    setModel(model: StatusFilterModel | null): void {
        this.text = model ? model.value : '';
    }

    afterGuiAttached(params: IAfterGuiAttachedParams): void {
        window.setTimeout(() => this.input.element.nativeElement.focus());
    }

    onChange(newValue): void {
        if (this.text !== newValue) {
            this.text = newValue;
            this.params.filterChangedCallback();
        }
    }
}
