import { Component, Output, EventEmitter, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

interface MappingProtocol {
    guid: string;
    hep_alias: string;
    profile: string;
    hepid: number;
}

interface ProtocolOption {
    id: string;
    name: string;
    value: string;
    protocol: string;
    protocol_id: {
        name: string;
        value: number;
    };
}

@Component({
    selector: 'app-code-proto-selector',
    templateUrl: './code-proto-selector.component.html',
    styleUrls: ['./code-proto-selector.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CodeProtoSelectorComponent {
    protoSelect;
    preProtoSelect;
    protocolList: ProtocolOption[] = [];
    @Output() protoChanged = new EventEmitter<ProtocolOption | Record<string, never>>();

    @Input()
    set value(val: ProtocolOption | null) {
        if (!val || !!this.preProtoSelect) {
            return;
        }
        this.preProtoSelect = val;
        this.protoSelect = this.protocolList.find(({ id }) => id === this.preProtoSelect?.id);
    }

    @Input()
    set mappingList(protocols: MappingProtocol[] | null) {
        if (!protocols) {
            return;
        }
        this.protocolList = protocols.map(({ guid, hep_alias, profile, hepid }) => ({
            id: guid,
            name: `${hep_alias} - ${profile}`,
            value: `${hep_alias} - ${profile}`,
            protocol: profile,
            protocol_id: {
                name: hep_alias,
                value: hepid
            }
        }));


        const [firstChild] = this.protocolList;
        this.protoSelect = this.protocolList.find(({ id }) => id === this.preProtoSelect?.id) || firstChild;

    }

    setValue(val) {
    }
    changeProto($event: ProtocolOption) {
        this.protoSelect = $event;
        this.protoChanged.emit(this.protoSelect || {});
    }
}
