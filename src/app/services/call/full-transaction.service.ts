import { HepLogService } from './hep-log.service';
import { AgentsubService } from '@app/services/agentsub.service';
import { Injectable, inject } from '@angular/core';
import { CallReportService } from '@app/services';
import { CallTransactionService } from '@app/services';
import { Observable, lastValueFrom } from 'rxjs';
// import { HepLogService } from '@app/services';
import { WorkerService } from '../worker.service';
import { WorkerCommands } from '@app/models/worker-commands.module';
import { Functions, log } from '@app/helpers/functions';
import { PreferenceHepsubService } from '@app/services';
import { PreferenceAgentsubService } from '@app/services';
import { DateTimeRangeService } from '@services/data-time-range.service';
import { ApiResponse, PreferenceAgentsub, PreferenceHepsub } from '@app/models';

type TransactionSearchField = Record<string, unknown>;

interface TransactionRequest {
  param: {
    search: Record<string, TransactionSearchField>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

type TransactionRecord = Record<string, unknown>;

interface FullTransactionResult {
  callid?: string | string[];
  data?: {
    messages?: TransactionRecord[];
    calldata?: TransactionRecord[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface TransactionWorkerPayload {
  tData: FullTransactionResult;
  type: 'full' | 'logs' | 'qos';
  logsData?: unknown;
  qosData?: unknown;
}

interface FullTransactionEvent {
  type: string;
  data: FullTransactionResult;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

@Injectable({
  providedIn: 'root'
})
export class FullTransactionService {
  private callReportService = inject(CallReportService);
  private callTransactionService = inject(CallTransactionService);
  private hepLogService = inject(HepLogService);
  private agentsubService = inject(AgentsubService);
  private preferenceHepsubService = inject(PreferenceHepsubService);
  private _pass = inject(PreferenceAgentsubService);
  private dateTimeRangeService = inject(DateTimeRangeService);

  isReadyAfterCollectData = false;

  public getTransactionData(requestTransaction: TransactionRequest, dateFormat: string): Observable<FullTransactionEvent> {
    const worker = (data: TransactionWorkerPayload) =>
      WorkerService.doOnce<FullTransactionResult>(WorkerCommands.TRANSACTION_SERVICE_FULL, data);
    return new Observable<FullTransactionEvent>(observer => {
      let tData: FullTransactionResult;
      const next = (type: string) => observer.next({ type, data: tData });
      let tr = false, dt = false, qo = false, lo = false;
      const ready = (type: string, fn?: (readyType: string) => void) => {
        // console.log('ready', type)
        if (this.isReadyAfterCollectData) {
          tr = tr || type === 'transaction';
          dt = dt || type === 'dtmf';
          qo = qo || type === 'qos';
          lo = lo || type === 'heplogs';

          if (tr && dt && qo && lo) {
            next('transaction');
          }
        } else {
          next(type);
        }
        fn?.(type);
      };
      const onError = (err: unknown) => (type: string) => {
        ready(type, _type => {
          log('error', _type, err instanceof Error ? err : new Error(String(err)));
          observer.error(err);
        });
      };
      const rt = requestTransaction;
      this.callTransactionService.getTransaction<FullTransactionResult>(rt).toPromise().then(async (data) => {
        data.dateFormat = dateFormat;
        data.timeZone = this.dateTimeRangeService.getTimezoneForQuery();
        tData = await worker({ tData: data, type: 'full' });
        ready('transaction');
        Object.values(rt.param.search).forEach(item => item.callid = tData.callid);

        const query = Functions.cloneObject(rt);
        const [protocol] = Object.keys(query?.param?.search || {});

        const hepsubResponse = await this.preferenceHepsubService.getAll().toPromise() as unknown as ApiResponse<PreferenceHepsub[]>;
        const hData = hepsubResponse?.data || [];
        const mapping = (hData.find(({ hepid, profile }) => `${hepid}_${profile}` === protocol)?.mapping || {}) as {
          source_field?: string;
          source_fields?: Record<string, string>;
        };

        const { messages = [], calldata = [] } = tData?.data || {};

        // source_field - string (HEPSUB mapping contains single lookup property source_field)
        const { source_field } = mapping || {};
        if (source_field) {
          const [, fName] = source_field.split('.');
          query.param.search[protocol][fName] = [...messages, ...calldata]
            .filter(i => i[fName])
            .map(i => i[fName]).sort()
            .filter((i, k, a) => i !== a[k + 1]);
        }
        // source_fields - object (HEPSUB mapping contains multiple lookup properties source_fields)
        const { source_fields } = mapping || {};
        if (source_fields) {
          Object.entries(source_fields).forEach(([key, value]) => {
            const [, fName] = value.split('.');
            query.param.search[protocol][key] = [...messages, ...calldata]
              .filter(i => i[fName])
              .map(i => i[fName]).sort()
              .filter((i, k, a) => i !== a[k + 1]);
          })
        }

        try {
          // load all subscribed agents
          const agents = await this._pass.getAll().toPromise() as unknown as ApiResponse<PreferenceAgentsub[]>;
          // load all HEPSUB mappings (but why?!)
          const hsData = await this.preferenceHepsubService.getAll().toPromise() as unknown as ApiResponse<PreferenceHepsub[]>;
          if (agents?.data) {
            if (hsData?.data) {
              // collect all promises and wait for all responses
              const allAgentPromises = agents.data.map(async agent => {
                return await this.agentsubService.getHepsubElements({ uuid: agent.uuid, type: agent.type, data: query }).toPromise();
              })
              const allAgentResponses = await Promise.all(allAgentPromises)
              // check for data in any of the responses, if we get data back capture into model
              allAgentResponses.forEach(
                (agent: unknown) => {
                  if (isRecord(agent) && agent.data) {
                    tData.agentCdr = agent;
                  }
                }
              )
            }
          }
        } catch (err) { onError('agentCdr'); }

        try {
          const hepLogRes = await this.hepLogService.getLog(rt).toPromise() as ApiResponse<unknown>;
          tData = await worker({ tData, logsData: hepLogRes.data, type: 'logs' });
          tData.heplogs = hepLogRes.data;
        } catch (err) { onError('heplogs'); }

        try {
          const callIdArr = tData?.data?.calldata.map(i => i.sid).sort().filter((i, k, a) => i !== a[k - 1]) || [];
          Object.values(rt.param.search).forEach(item => item.callid = callIdArr);
          const qosData = await lastValueFrom(this.callReportService.postQOS(rt));
          tData = await worker({ tData, qosData, type: 'qos' });
          tData.qosData = qosData;
        } catch (err) { onError('qos'); }
        ready('qos');

      }, onError('transaction'));
    });
  }
}
