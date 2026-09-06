import { Functions, log, setStorage } from '@app/helpers/functions';
import { HttpGetBuffer } from '@app/helpers/http-get-buffer';
import { ApiResponse, ConstValue, DashboardContentModel, DashboardData, DashboardModel, UserConstValue } from '@app/models';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, lastValueFrom } from 'rxjs';
import { environment } from '@environments/environment';

export interface DashboardEventData {
  current: string;
  currentDashboardType?: number;
  currentWidget: Partial<DashboardContentModel>;
  currentWidgetList: DashboardContentModel[];
  resultWidget?: Record<string, WidgetResultState>;
  currentProfileList: DashboardProfile[];
  isFromSearch: boolean;
}

interface DashboardProfile {
  alias: string;
  hepid: number;
  profile: string;
}

interface DashboardProfileSource {
  hep_alias: string;
  hepid: number;
  profile: string;
}

export interface DashboardInfo {
  id: string;
  href?: string;
  name: string;
  owner: string;
  shared: boolean | number;
  type?: number;
}

export interface DashboardBackEvent {
  id: string;
  type?: unknown;
}

interface DashboardQueryField {
  name: string;
  value?: unknown;
  [key: string]: unknown;
}

interface DashboardQuery {
  fields?: DashboardQueryField[];
  text?: string;
  [key: string]: unknown;
}

interface WidgetResultState {
  timestamp?: number;
  query?: DashboardQuery;
  slider?: unknown;
  isAutoRefrasher?: boolean;
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root'
})

export class DashboardService {
  static dbSetting: DashboardEventData = {
    current: '',
    currentDashboardType: null,
    currentWidget: {},
    currentWidgetList: [],
    currentProfileList: [],
    resultWidget: {},
    isFromSearch: false
  };
  set dbs(val) {
    DashboardService.dbSetting = val;
  }
  get dbs() {
    return DashboardService.dbSetting;
  }
  private _backBehaviorSubject: BehaviorSubject<DashboardBackEvent>;
  public dashboardBack: Observable<DashboardBackEvent>;
  private _behavior: BehaviorSubject<DashboardEventData>;
  public dashboardEvent: Observable<DashboardEventData>;
  private url = `${environment.apiUrl}/dashboard`;
  private _eventBuffer = '';
  constructor(
    private _http: HttpClient,
    private _httpBuffer: HttpGetBuffer
  ) {
    this.dbs = Functions.JSON_parse(localStorage.getItem(UserConstValue.SQWR)) ||
      Functions.JSON_parse(localStorage.getItem(ConstValue.SQWR)) || this.dbs;

    this._behavior = new BehaviorSubject<DashboardEventData>(this.dbs);
    this.dashboardEvent = this._behavior.asObservable();
    this._backBehaviorSubject = new BehaviorSubject<DashboardBackEvent>({ id: '' });
    this.dashboardBack = this._backBehaviorSubject.asObservable();
  }
  clearLocalStorage() {
    this.dbs = {
      current: '',
      currentWidget: {},
      currentWidgetList: [],
      resultWidget: {},
      currentProfileList: [],
      isFromSearch: false
    };
  }
  setCurrentDashBoardId(val: string) {
    if (!val) {
      return;
    }
    this.dbs.current = val;
  }

  setCurrentWidgetId(val: Partial<DashboardContentModel>) {
    this.dbs.currentWidget = val;
  }

  setWidgetListCurrentDashboard(widgetList: DashboardContentModel[]) {
    this.dbs.currentWidgetList = widgetList;
    this.update();
  }
  setQueryToWidgetResult(id: string, query: DashboardQuery, bNoUpdate = false) {
    if (query.fields) {
      query.fields = query.fields.filter(i => i.name !== ConstValue.CONTAINER && this.filterStatus(i));
    }
    this.saveWidgetParam(id, 'timestamp', Date.now());
    this.saveWidgetParam(id, 'query', query, !bNoUpdate, true);
  }

  filterStatus(item: DashboardQueryField) {
    return item.name !== 'status' || !!item.value;
  }

  setCurrentProfileList(list: ApiResponse<DashboardProfileSource[]>) {
    if (list && list.data && list.data.length > 0) {
      this.dbs.currentProfileList = list.data.map(d => ({
        alias: d.hep_alias,
        hepid: d.hepid,
        profile: d.profile
      }));
      this.update();
    }
  }

  setSliderQueryDataToWidgetResult(id: string, query: unknown) {
    this.saveWidgetParam(id, 'slider', query, true);
    return query;
  }

  getSliderQueryDataToWidgetResult(id: string) {
    return this.loadWidgetParam(id, 'slider');
  }

  saveWidgetParam(idWidget: string, paramName: string, paramValue: unknown, isReadyToUpdate = false, isFromSearch = false) {
    this.dbs.resultWidget = this.dbs.resultWidget || {};
    this.dbs.resultWidget[idWidget] = this.dbs.resultWidget[idWidget] || {};
    this.dbs.resultWidget[idWidget][paramName] = paramValue;
    setStorage(UserConstValue.SQWR, this.dbs);
    localStorage.removeItem(ConstValue.SQWR);
    if (isReadyToUpdate) {
      this.update(isFromSearch);
    }
  }
  loadWidgetParam(idWidget: string, paramName: 'isAutoRefrasher'): boolean | null;
  loadWidgetParam(idWidget: string, paramName: string): unknown;
  loadWidgetParam(idWidget: string, paramName: string): unknown {
    this.dbs = JSON.parse(localStorage.getItem(UserConstValue.SQWR)) ||
      JSON.parse(localStorage.getItem(ConstValue.SQWR)) || this.dbs;
    const wList = this.dbs?.resultWidget || {};
    const result = wList[idWidget] && wList[idWidget][paramName] 
    return result  || typeof result === 'boolean' ? result : null;
  }

  update(isFromSearch = false, isImportant = false) {
    if (isImportant) {
      this.dbs.currentWidgetList
        .filter(({ name }) => name.toLowerCase() === 'result')
        .forEach(({ id }) => this.saveWidgetParam(id, 'timestamp', Date.now()));
    }
    this.dbs.isFromSearch = isFromSearch;

    setStorage(UserConstValue.SQWR, this.dbs);
    localStorage.removeItem(ConstValue.SQWR);
    if (this.dbs.current && this.dbs.currentWidgetList.length) {
      const _md5hash = Functions.md5object(this.dbs);
      if (this._eventBuffer !== _md5hash) {
        this._eventBuffer = _md5hash;
        this._behavior.next(this.dbs);
      }
    }
  }
  setWidgetAsActive(id: string, type: unknown = null) {
    this._backBehaviorSubject.next({ id, type });
  }
  getCurrentDashBoardId() {
    return DashboardService.dbSetting?.current;
  }

  // get Dashboard store
  getDashboardStore(id: string): Observable<DashboardModel> {
    return this._httpBuffer.get<DashboardModel>(`${this.url}/store/${id}`);
  }

  // post Dashboard store for ADD a new dashboard only
  postDashboardStore(id: string, data: DashboardData): Observable<unknown> {
    /** id - DEPRICATED */
    return this._http.post<unknown>(`${this.url}/store/${data.dashboardId || id || this.getCurrentDashBoardId()}`, data);
  }

  // Update json UPDATA data of dahboard
  updateDashboard(data: DashboardData): Observable<unknown> {
    return this._http.put<unknown>(`${this.url}/store/${data.dashboardId || data.id}`, data);
  }

  // delete Dashboard store
  deleteDashboardStore(id: string): Promise<unknown> {
    return this._http.delete<unknown>(`${this.url}/store/${id}`).toPromise();
  }

  // Dashboard info
  getDashboardInfo(delayBuffer: number | null = null): Observable<ApiResponse<DashboardInfo[]>> {
    return this._httpBuffer.get<ApiResponse<DashboardInfo[]>>(`${this.url}/info`, delayBuffer);
  }
  resetDashboard() {
      return lastValueFrom(this._http.get(`${this.url}/reset`));
  }
}
