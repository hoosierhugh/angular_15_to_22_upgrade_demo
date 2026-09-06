import { environment } from "@environments/environment";
import { isSameHost, Functions } from "./functions";

export function getUriJson(): unknown {
    if (location.search) {
        try {
            return JSON.parse(
                decodeURIComponent(location.search.slice(1, -1))
            );
        } catch (err) {
            const out = location.search
                .slice(1)
                .split('&')
                .reduce((a, i) => {
                    const [key, value] = i.split('=');
                    if (key && value) {
                        a[key] = value;
                    }
                    return a;
                }, {});
            if (JSON.stringify(out) === '{}') {
                return null;
            } else {
                return out;
            }
        }
    } else {
        return null;
    }
}
export function getUriParams(): string | Record<string, string | null> {
    if (!!location.hash) {
        return location.hash.replace('#', '');
    }
    const lSearch = location.search || '';
    return lSearch
        ? lSearch
            .split('&')
            .map((i) => i.replace('?', '').split('='))
            .reduce((a, b) => ((a[b[0]] = b[1]), a), {})
        : { callid: null, from: null, to: null, uuid: null };
}
export function shareLinkUUID(): string {
    return (location?.hash || '')?.replace('#', '') || '';
}
export function emitWindowResize(): void {
    setTimeout(() => {
        try {
            window.dispatchEvent(new Event('resize'));
        } catch (e) { }
    });
}
export function getJsonFileDataByLink(name: string): Promise<unknown> {
    return new Promise((resolve) => {
        resolve(Reflect.get(window, `file__json_data_${name}`) || {});
    });
}
export function saveToFile(data: BlobPart, filename: string, type = 'application/octet-stream') {
    const file = new Blob([data], { type: type });
    const nav = window.navigator as Navigator & {
        msSaveOrOpenBlob?: (blob: Blob, defaultName?: string) => void;
    };
    if (nav.msSaveOrOpenBlob) {
        // IE10+
        nav.msSaveOrOpenBlob(file, filename);
    } else {
        // Others
        const a = document.createElement('a'),
            url = URL.createObjectURL(file);
        a.href = url;
        a.target = '(file)';
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}
export function console2file(data: unknown, filename?: string) {
    if (!data) {
        console.error('Console.save: No data');
        return;
    }

    if (!filename) {
        filename = 'console.json';
    }

    if (typeof data === 'object') {
        data = JSON.stringify(data, undefined, 4);
    }

    saveToFile(String(data), filename, 'txt/json');
}
export function setStorage(key: string, value: unknown): void {
    // saving JSON from object data
    // log('setStorage >>>', key, value);
    return localStorage.setItem(key, JSON.stringify(value));
}
export function getStorage<T = unknown>(key: string): T | null {
    // log('getStorage <<<', key, Functions.JSON_parse(localStorage.getItem(key)));
    return Functions.JSON_parse(localStorage.getItem(key)) as T | null;
}

export function getSelectedText() {
    return window.getSelection()?.toString() || document.getSelection()?.toString() || '';
}

export function isCurrentHost(host: string): boolean {
    return isSameHost(window?.location.href, host) || isSameHost(environment.apiUrl, host)
}
