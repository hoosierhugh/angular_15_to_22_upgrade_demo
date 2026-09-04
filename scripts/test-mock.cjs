const assert = require('node:assert/strict');
require('ts-node').register({ compilerOptions: { module: 'CommonJS' } });
const { MockApi } = require('../src/app/mock/mock-api');
const { MOCK_MODE, MOCK_PROVIDERS, createMockUser } = require('../src/app/runtime-mode');
assert.equal(MOCK_MODE, false, 'normal builds must not auto-login');
assert.deepEqual(MOCK_PROVIDERS, []);
assert.equal(createMockUser(), null);
const api = new MockApi();
assert.equal(api.handle('GET', '/users/profile').body.data.username, 'demo');
const home = api.handle('GET', '/dashboard/store/home').body;
assert.equal(home.data.widgets.length, 2);
home.data.name = 'Changed';
assert.equal(api.handle('GET', '/dashboard/store/home').body.data.name, 'Local demo', 'responses must be independent');
assert.equal(api.handle('PUT', '/dashboard/store/home', home).status, 200);
assert.equal(api.handle('GET', '/dashboard/info').body.data[0].name, 'Changed');
home.data.name = 'Flat payload';
assert.equal(api.handle('PUT', '/dashboard/store/home', home.data).status, 200);
assert.equal(api.handle('GET', '/dashboard/store/home').body.data.dashboardId, 'home');
assert.equal(api.handle('GET', '/dashboard/info').body.data[0].name, 'Flat payload');
assert.equal(new MockApi().handle('GET', '/dashboard/store/home').body.data.name, 'Local demo', 'reload resets data');
const setting = api.handle('POST', '/user/settings', { category: 'system', param: 'timezone', data: { name: 'UTC' } }).body.data;
assert.equal(api.handle('GET', '/user/settings/system').body.count, 1);
assert.equal(api.handle('PUT', '/user/settings/' + setting.guid, { param: 'changed' }).status, 200);
assert.equal(api.handle('DELETE', '/user/settings/' + setting.guid).status, 200);
assert.equal(api.handle('GET', '/user/settings').body.count, 0);
assert.equal(api.handle('GET', '/mapping/protocol').body.data.length, 1);
assert.equal(api.handle('GET', '/dashboard/store/missing').status, 404);
assert.equal(api.handle('PUT', '/dashboard/store/home', {}).status, 400);
assert.equal(api.handle('POST', '/search/call/data', {}).status, 501);
assert.equal(api.handle('POST', '/auth', {}).status, 501);
// Unit-test the interceptor with minimal Angular HTTP/decorator doubles; real RxJS.
// This does not replace a browser integration test.
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { firstValueFrom, of } = require('rxjs');
class HttpResponse { constructor(options) { Object.assign(this, options); } }
class HttpErrorResponse extends Error { constructor(options) { super(options.error?.message); Object.assign(this, options); } }
const compiled = ts.transpileModule(fs.readFileSync(require.resolve('../src/app/mock/mock-backend.interceptor.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, experimentalDecorators: true, target: ts.ScriptTarget.ES2022 }
}).outputText;
const sandbox = {
    exports: {}, URL,
    window: { location: { href: 'http://127.0.0.1:4200/dashboard/home', origin: 'http://127.0.0.1:4200' } },
    document: { baseURI: 'http://127.0.0.1:4200/' },
    require: name => {
        if (name === '@angular/core') return { Injectable: () => target => target };
        if (name === '@angular/common/http') return { HttpResponse, HttpErrorResponse };
        if (name === './mock-api') return require('../src/app/mock/mock-api');
        return require(name);
    }
};
vm.runInNewContext(compiled, sandbox);
async function checkInterception() {
    const interceptor = new sandbox.exports.MockBackendInterceptor();
    let forwarded = 0;
    const next = { handle: () => { forwarded++; return of(new HttpResponse({ status: 200 })); } };
    const send = (method, url) => firstValueFrom(interceptor.intercept({ method, url }, next));
    assert.equal((await send('GET', '/__mock_api__/v3/users/profile')).body.data.username, 'demo');
    for (const url of ['/api/v3/users', 'https://example.test/api/v3/users',
        'https://example.test/__mock_api__/v3/users', '/__mock_api__/v3/unsupported']) {
        await assert.rejects(send('GET', url), error => error.status === 501);
    }
    await assert.rejects(send('POST', '/assets/example.json'), error => error.status === 501);
    assert.equal(forwarded, 0, 'no API request may reach the real handler');
    await send('GET', '/assets/i18n/en.json');
    assert.equal(forwarded, 1, 'only local static assets pass through');
    console.log('Mock API, request isolation and default-mode tests passed.');
}
checkInterception().catch(error => { console.error(error); process.exitCode = 1; });
