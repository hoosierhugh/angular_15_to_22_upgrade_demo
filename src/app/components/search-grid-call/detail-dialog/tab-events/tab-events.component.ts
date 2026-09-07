import { Component, Input, AfterViewChecked, Output, EventEmitter, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-tab-events',
    templateUrl: './tab-events.component.html',
    styleUrls: ['./tab-events.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class TabEventsComponent implements AfterViewInit {
    itemData: Record<string, unknown> | number;
    ip: Record<string, HostDisplay> | number;

    @Input() set dataItem(_dataItem: { data: { hostinfo: Record<string, HostInfo> } }) {
        const hostinfo = _dataItem.data.hostinfo;
        if (Object.keys(hostinfo).length <= 0) {
            this.ip = 0;
            this.itemData = 0;
        } else {
            this.ip = {};
          const hosts = Object.keys(hostinfo);
          hosts.forEach(host => {
              this.ip[host] = {
                Alias: hostinfo[host].alias,
                Group: hostinfo[host].group,
                Mask: hostinfo[host].mask,
                ShardID: hostinfo[host].shardid,
                Status: ( hostinfo[host].status ? 'Active' : 'Inactive'),
                Type: hostinfo[host].type,
                IPV6: hostinfo[host].ipv6
              };
          });

            this.itemData = { 'Live-Log': { type: 'IP Lookup', IP: this.ip } };
        }
    }

    @Output() ready = new EventEmitter<void>();

    ngAfterViewInit() {

        setTimeout(() => {
            this.ready.emit();
        }, 35);
    }

}

interface HostInfo {
    alias: string;
    group: string;
    mask: number;
    shardid: string;
    status: boolean;
    type: number;
    ipv6: boolean;
}

interface HostDisplay {
    Alias: string;
    Group: string;
    Mask: number;
    ShardID: string;
    Status: 'Active' | 'Inactive';
    Type: number;
    IPV6: boolean;
}
