import { createHomeDashboard, demoUser, sipMapping } from './mock-data';

export const MOCK_API_BASE = '/__mock_api__/v3';
export interface MockReply<T = unknown> { status: number; body: T; }

type MockEntity = {
    guid?: string;
    uuid?: string;
    id?: string | number;
    category?: string;
    [key: string]: unknown;
};

interface MockDashboard extends MockEntity {
    id: string;
    dashboardId: string;
    owner: string;
    data: MockEntity & {
        widgets: unknown[];
        name?: string;
        shared?: boolean;
        type?: number;
    };
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

/** One in-memory backend per page; never uses fetch, credentials or real storage. */
export class MockApi {
    private dashboards: Record<string, MockDashboard> = { home: createHomeDashboard() };
    private collections: Record<string, MockEntity[]> = {
        '/users': [clone(demoUser)], '/user/settings': [], '/advanced': [],
        '/alias': [], '/mapping/protocol': [clone(sipMapping)]
    };
    private sequence = 0;

    handle(method: string, path: string, body?: unknown): MockReply {
        const ok = <T>(data: T): MockReply<T> => ({ status: 200, body: clone(data) });
        const missing = (): MockReply => ({ status: 404, body: { message: 'Demo record not found' } });
        if (method === 'GET') {
            if (path === '/users/profile') {
                return ok({ data: { ...demoUser, admin: true, displayname: 'Demo User',
                    avatar: '', color: '#1976d2', group: 'admin', external_auth: false, external_profile: '' } });
            }
            if (path === '/users/groups') { return ok({ data: ['admin', 'users'] }); }
            if (path === '/user/dashboard/widgets') { return ok({ data: [] }); }
            if (path === '/modules/status') {
                return ok({ data: { loki: { enable: false }, prometheus: { enable: false },
                    grafana: { enable: false }, clickhouse: { enable: false } } });
            }
            if (/^\/version\/(api|ui)\/(info|check(?:\/.*)?)$/.test(path)) {
                return ok({ data: { version: 'local-demo', upgrade: false } });
            }
            if (path === '/dashboard/info') {
                const data = Object.keys(this.dashboards).map(id => ({ id, href: id,
                    name: this.dashboards[id].data.name, owner: 'demo',
                    shared: this.dashboards[id].data.shared, type: this.dashboards[id].data.type }));
                return ok({ data, count: data.length });
            }
            if (path.startsWith('/user/settings/')) {
                const data = this.collections['/user/settings'].filter(row => row.category === path.slice(15));
                return ok({ data, count: data.length });
            }
        }
        const dashboard = path.match(/^\/dashboard\/store\/([^/]+)$/);
        if (dashboard) {
            const id = decodeURIComponent(dashboard[1]);
            if (method === 'GET') { return this.dashboards[id] ? ok(this.dashboards[id]) : missing(); }
            if (method === 'POST' || method === 'PUT') {
                const data = isRecord(body) && isRecord(body.data) ? body.data : body;
                if (!isRecord(data) || !Array.isArray(data.widgets)) {
                    return { status: 400, body: { message: 'Demo dashboard requires widgets' } };
                }
                this.dashboards[id] = { id, dashboardId: id, owner: 'demo',
                    data: { ...clone(data), dashboardId: id, widgets: clone(data.widgets) } };
                return ok({ status: 'ok', message: 'Demo dashboard saved', data: this.dashboards[id] });
            }
            if (method === 'DELETE') {
                if (!this.dashboards[id]) { return missing(); }
                delete this.dashboards[id];
                return ok({ message: 'Demo dashboard deleted' });
            }
        }
        for (const base of Object.keys(this.collections)) {
            if (path !== base && !path.startsWith(base + '/')) { continue; }
            const id = path === base ? null : decodeURIComponent(path.slice(base.length + 1));
            const rows = this.collections[base];
            const index = rows.findIndex(row => row.guid === id || row.uuid === id || String(row.id) === id);
            if (method === 'GET') {
                if (id !== null && index < 0) { return missing(); }
                const data = id === null ? rows : [rows[index]];
                return ok({ data, count: data.length });
            }
            if (method === 'POST' && id === null) {
                const guid = `demo-${++this.sequence}`;
                const row: MockEntity = { ...clone(isRecord(body) ? body : {}), guid, uuid: guid };
                rows.push(row);
                return ok({ data: row, message: 'Demo record created' });
            }
            if (method === 'PUT' && index >= 0) {
                rows[index] = { ...rows[index], ...clone(isRecord(body) ? body : {}), guid: rows[index].guid };
                return ok({ data: rows[index], message: 'Demo record updated' });
            }
            if (method === 'DELETE' && index >= 0) {
                rows.splice(index, 1);
                return ok({ message: 'Demo record deleted' });
            }
            if (id !== null) { return missing(); }
        }
        return { status: 501, body: { message: `Local demo does not implement ${method} ${path}. No real API was called.` } };
    }
}
