import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';

export type IdType = 'sip' | 'rtp' | 'tcp' | 'udp' | 'ip' | 'eth' | 'sdp' | 'http' | 'isup' | 'ssh';

export type VocabularyMap = Record<string, VItem> | [];

interface VocabularyField {
    fieldname: string;
    description: string;
    type: string;
}
interface VocabularySearchResponse {
    data: { data: VocabularyField[] }[];
}

class Buffer {
    static data: Partial<Record<IdType, VocabularyMap>> = {};
}
export class VItem {
    description: string;
    type: string;
    source_value: string;

    constructor(description = '', type = '') {
        this.description = description;
        this.type = type;
    }

    public toString(): string {
        return this.description;
    }
}

@Injectable({
    providedIn: 'root'
})
export class WebsharkDictionaryApiService {
    private http = inject(HttpClient);

    private url = `${environment.apiUrl}/protocol/search/`;

    async get(id: IdType): Promise<VocabularyMap> {
        if (!Buffer.data[id]) {
            Buffer.data[id] = await this.getVocabularyById(id);
        }
        return Buffer.data[id];
    }
    getVocabularyById(id: IdType): Promise<VocabularyMap> {
        return firstValueFrom(this.http.get<VocabularySearchResponse>(this.url + id).pipe(map(data => {
            const out = data;
            const [dataItem] = out?.data || [];
            const vData: VocabularyField[] = dataItem?.data;

            if (vData) {
                return vData.reduce((a, { fieldname, description, type }) => {
                    if (fieldname && description) {
                        a[fieldname] = new VItem(description, type);
                    }
                    return a;
                }, {});

            }

            return [];
        })));
    }
}
