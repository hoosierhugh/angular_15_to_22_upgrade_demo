import { setStorage, getStorage } from '@app/helpers/functions';

interface StoredQuery {
  timestamp: number;
  record: string;
}
export class QueryHistoryService {
  id_widget;

  constructor(id_widget: string) {
    this.id_widget = id_widget;
  }
  get key() {
    return 'smart-query-history-' + this.id_widget;
  }
  private setFormat(record: string): StoredQuery {
    return { timestamp: new Date().getTime(), record };
  }

  addRecord(record: string) {
    console.log('addRecord::', record);
    const records: StoredQuery[] = getStorage(this.key) || [];

    if (
      !records.find(i => JSON.stringify(i.record) === JSON.stringify(record)) &&
      !/^\s*$/.test(record)
    ) {
      records.unshift(this.setFormat(record));
    }

    setStorage(this.key, records.filter(({record}) => !record?.match(/^\s*$/g)).slice(0, 12));
  }
  getRecords(): string[] {
    const records: StoredQuery[] = getStorage(this.key) || [];
    return records.map(({ record }) => record).filter(record => !/^\s*$/.test(record));
  }
  removeHistory() {
    localStorage.removeItem(this.key);
  }
}
