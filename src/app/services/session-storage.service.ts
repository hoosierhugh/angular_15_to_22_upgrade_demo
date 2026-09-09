import { Injectable, inject } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { BehaviorSubject, Observable } from 'rxjs';
import  moment from 'moment';
import { ConstValue, UserConstValue } from '@app/models';
import { Functions, log, setStorage } from '@app/helpers/functions';


export interface UserSettings {
    updateType: string;
    dateTimeRange: {
        title: string;
        timezone: string,
        dates: (moment.Moment | string)[]
    };
    protosearchSettings: Record<string, StoredProtoSearchConfig>;
    favorites: StoredFavorite[];
    searchTabs?: StoredSearchTab[];
    profile_fields?: unknown[];
}

export interface StoredProtoSearchConfig {
    fields?: unknown[];
    limit?: unknown;
    text?: unknown;
    [key: string]: unknown;
}

export interface StoredFavorite {
    id?: string;
    name?: string;
    [key: string]: unknown;
}

export interface StoredSearchTab {
    id: string;
    name: string;
    isDisplayGrid?: boolean;
    owner?: {
        username?: string;
    };
    [key: string]: unknown;
}

enum TypeForSave {
    DATA_TIME_RANGE = 'data-time-range',
    FULL = 'full',
    PROTO_SEARCH = 'proto-search',
    FAVORITES = 'favorites',
    SEARCH_TABS = 'search-tabs'
}
@Injectable({
    providedIn: 'root'
})

export class SessionStorageService {
    private authenticationService = inject(AuthenticationService);


    static userSettings: UserSettings = {
        updateType: TypeForSave.FULL,
        dateTimeRange: {
            title: '',
            timezone: '',
            dates: [moment(), moment()]
        },
        protosearchSettings: {},
        favorites: [],
        searchTabs: []
    };

    set setting(value: UserSettings) {
        SessionStorageService.userSettings = value;
    }
    get setting(): UserSettings {
        return SessionStorageService.userSettings;
    }

    private localUserSettings: BehaviorSubject<UserSettings>;

    public sessionStorage: Observable<UserSettings>;

    constructor() {
        this.updateDataFromLocalStorage();
        setTimeout(() => {
            this.updateDataFromLocalStorage();
        });
    }
    public updateDataFromLocalStorage() {
        this.authenticationService.currentUser.subscribe(currentUser => {
            if (currentUser) {
                this.setting = Functions.JSON_parse(localStorage.getItem(UserConstValue.USER_SETTINGS)) ||
                Functions.JSON_parse(localStorage.getItem(ConstValue.USER_SETTINGS)) ||
                    this.setting;

                if (this.setting.protosearchSettings instanceof Array) {
                    this.setting.protosearchSettings = {};
                }
                if (!this.setting.updateType || this.setting.updateType === TypeForSave.PROTO_SEARCH) {
                    this.setting.updateType = TypeForSave.FULL;
                }
                this.localUserSettings = new BehaviorSubject<UserSettings>(this.setting);
                this.sessionStorage = this.localUserSettings.asObservable();
            }
        });
    }
    public clearLocalStorage() {
        this.setting = {
            updateType: TypeForSave.FULL,
            dateTimeRange: {
                title: '',
                timezone: '',
                dates: [moment(), moment()]
            },
            protosearchSettings: {},
            favorites: [],
            searchTabs: []
        };
    }

    public saveDateTimeRange(dtr: UserSettings['dateTimeRange']) {
        this.setting.dateTimeRange = dtr;
        this.saveUserData(TypeForSave.DATA_TIME_RANGE);
    }
    public getDateTimeRange() {
        return this.setting.dateTimeRange;
    }
    private saveUserData(updateType = TypeForSave.FULL) {
        log('this.setting.protosearchSettings', this.setting.protosearchSettings);
        Object.entries(this.setting.protosearchSettings)
            .forEach(([key, widget]) => {
                if (!widget || widget.hasOwnProperty(ConstValue.serverLoki)) {
                    return;
                }
                const fields = widget.fields;
                if (fields && fields.length === 0) {
                    delete this.setting.protosearchSettings[key];
                }
            });
        this.setting.updateType = updateType;
        this.localUserSettings.next(this.setting);
        this.setting.updateType = TypeForSave.FULL;
        setStorage(UserConstValue.USER_SETTINGS, this.setting);
        localStorage.removeItem(ConstValue.USER_SETTINGS);
    }
    public removeProtoSearchConfig(widgetId: string) {
        delete this.setting.protosearchSettings[widgetId];
        this.saveUserData(TypeForSave.PROTO_SEARCH);
    }
    public saveProtoSearchConfig(widgetId: string, fieldsValue: StoredProtoSearchConfig) {
        this.setting.protosearchSettings[widgetId] = fieldsValue;
        this.saveUserData(TypeForSave.PROTO_SEARCH);
    }
    public saveFavoritesConfig(favorites: StoredFavorite[]) {
        this.setting.favorites = favorites;
        this.saveUserData(TypeForSave.FAVORITES);
    }
    public saveSearchTabsConfig(searchTabs: StoredSearchTab[]) {
        this.setting.searchTabs = searchTabs;
        this.saveUserData(TypeForSave.SEARCH_TABS);
    }
}
