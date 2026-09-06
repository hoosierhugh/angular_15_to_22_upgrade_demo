import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import  moment from 'moment';
import { Functions } from '@app/helpers/functions';

export const MetricsMap = {
  'mos': 'MEAN_MOS',
  'jitter': 'MAX_INTERARRIVAL_JITTER',
  'delta': 'DELTA',
  'skew': 'MAX_SKEW',
  'pl': 'CUM_PACKET_LOSS',
  'packets': 'TOTAL_PK',
  'bytes': 'TL_BYTE',
};

export interface TooltipDetails {
  custom?: boolean | null;
  isLinkImg?: boolean;
  position?: unknown;
  hidden?: unknown;
  isIPv4?: unknown;
  ip_array?: unknown;
  [key: string]: unknown;
}

export type TooltipMessage = string | TooltipDetails | null;

interface TooltipModel {
  dataPoints?: Array<{ index: number; datasetIndex: number }>;
}

interface TooltipSourceItem {
  id?: string | number;
  srcAlias?: string;
  dstAlias?: string;
  source_port?: string | number;
  destination_port?: string | number;
  source_ip?: string;
  destination_ip?: string;
  callid?: string;
  create_ts?: string | number;
  messageType?: string;
  message: Record<string, unknown>;
}

interface TooltipDataset {
  uuids: Array<string | number>;
}

@Injectable({ providedIn: 'root' })
export class TooltipService {
  private subject = new Subject<TooltipMessage>();
  messageBuffer: string;
  hide() {
    this.messageBuffer = '';
    this.subject.next(null);
  }

  show(message: string | TooltipDetails) {
    if (this.messageBuffer === JSON.stringify(message)) {
      return;
    }
    this.messageBuffer = JSON.stringify(message);
    this.subject.next(message);
  }

  getMessage(): Observable<TooltipMessage> {
    return this.subject.asObservable();
  }

  public getTooltip(tooltipModel: TooltipModel, source: TooltipSourceItem[], metric: string | string[]) {
    if (tooltipModel.dataPoints && tooltipModel.dataPoints.length > 0) {
      const [dataPoint] = tooltipModel.dataPoints;
      const item = Functions.cloneObject(source[dataPoint.index]);
      const srcHost = item.srcAlias ? `${item.srcAlias}:${item.source_port}` : `${item.source_ip}:${item.source_port}`;
      const dstHost = item.dstAlias ? `${item.dstAlias}:${item.destination_port}` : `${item.destination_ip}:${item.destination_port}`;
      const type = (metric as string).toUpperCase();
      const value = item.message[MetricsMap[(metric as string)]] || 'error';
      const from_to = `${item.source_ip}:${item.source_port} -> ${item.destination_ip}:${item.destination_port}`;
      const from_to_Alias = `${srcHost} -> ${dstHost}`;
      const CID = item.callid;
      const time = moment(item.create_ts).format('DD-MM-YYYY HH:mm:ss');
      const dataToolTip = {
        custom: true,
        [type]: value,
        [`[${item.messageType}]`]: from_to,
        Alias: from_to_Alias,
        Orign: `${item.source_ip}:${item.source_port}`,
        CID,
        Time: time
      };
      return dataToolTip;
    } else {
      return false;
    }
  }
  getMetricMapItem(metric, message) {
    // exception for JITTER
    let metricsMap;
    if (metric === 'jitter') {
      metricsMap = message.SOURCE === 'RTCP' ? 'MAX_INTERARRIVAL_JITTER' : 'MAX_JITTER';
    } else {
      metricsMap = MetricsMap[(metric as string)];
    }
    return metricsMap;
  }
  public getTooltipMediaChart(tooltipModel: TooltipModel, source: TooltipSourceItem[], datasets: TooltipDataset[], metric: string | string[]) {
    if (tooltipModel.dataPoints && tooltipModel.dataPoints.length > 0) {
      const [dataPoint] = tooltipModel.dataPoints;
      const index = datasets[dataPoint.datasetIndex].uuids[dataPoint.index];
      const findex = source.findIndex(i => i.id === index);

      if (typeof source[findex] === 'undefined') {
        return false;
      }

      const item = Functions.cloneObject(source[findex]);
      const srcHost = item.srcAlias ? `${item.srcAlias}:${item.source_port}` : `${item.source_ip}:${item.source_port}`;
      const dstHost = item.dstAlias ? `${item.dstAlias}:${item.destination_port}` : `${item.destination_ip}:${item.destination_port}`;
      const type = (metric as string).toUpperCase();
      const value = item.message[this.getMetricMapItem(metric, item.message)];
      const from_to = `${item.source_ip}:${item.source_port} -> ${item.destination_ip}:${item.destination_port}`;
      const from_to_Alias = `${srcHost} -> ${dstHost}`;
      const CID = item.callid;
      const time = moment(item.create_ts).format('DD-MM-YYYY HH:mm:ss');
      const dataToolTip = {
        custom: true,
        [type]: value,
        [`[${item.messageType}]`]: from_to,
        Alias: from_to_Alias,
        Orign: `${item.source_ip}:${item.source_port}`,
        CID,
        Time: time
      };
      return dataToolTip;
    } else {
      return false;
    }
  }
}
