import { Injectable } from '@angular/core';
import { WorkerCommands } from '@app/models/worker-commands.module';

export enum WorkerScript {
  TRANSACTION = '@app/workers/transaction.worker',
  CLICKHOUSE = '@app/workers/clickhouse.worker'
}
interface WorkerPull {
  [key: string]: WorkerService;
}

interface WorkerMetadata {
  workerCommand: WorkerCommands | string;
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class WorkerService {
  static workerPull: WorkerPull = {};

  worker: Worker;
  instanceId: number;

  static async doOnce<TOutput = unknown>(workerCommand: WorkerCommands, data: unknown, path: string = WorkerScript.TRANSACTION, id: string = '1'): Promise<TOutput> {
    const workerId = path === WorkerScript.CLICKHOUSE ? `${workerCommand}_${id}` : workerCommand;
    if (!WorkerService.workerPull[workerCommand]) {
      if (path === WorkerScript.TRANSACTION) {
        WorkerService.workerPull[workerId] = new WorkerService(new Worker(new URL('@app/workers/transaction.worker', import.meta.url), { type: 'module' }));
      } else if (path === WorkerScript.CLICKHOUSE) {
        WorkerService.workerPull[workerId] = new WorkerService(new Worker(new URL('@app/workers/clickhouse.worker', import.meta.url), { type: 'module' }));
      }
     
    }
    return await WorkerService.workerPull[workerId].do<TOutput>(workerCommand, data);
  }

  constructor(worker: Worker) {
    this.worker = worker;
    this.instanceId = Math.floor(Math.random() * 999);
  }
  public getParseData<TOutput = unknown>(metaData: WorkerMetadata, srcdata: unknown): Promise<TOutput> {
    return new Promise(resolve => {
      this.worker.onmessage = ({ data }) => resolve(JSON.parse(data) as TOutput);
      this.worker.postMessage(JSON.stringify({ metaData, srcdata }));
    });
  }

  public async do<TOutput = unknown>(workerCommand: WorkerCommands, data: unknown): Promise<TOutput> {
    return await this.getParseData<TOutput>({ workerCommand }, data);
  }
  public terminate() {
    this.worker.terminate();
  }
}
