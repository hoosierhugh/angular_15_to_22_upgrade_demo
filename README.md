# Upgrading Angular from 15 to 22 demo
I will have separate branches for each version of Angular so that the viewer can see the changes.
For example: `upgrade/angular-16, upgrade/angular-18, etch`


## Local demo (no backend or login)

After installing dependencies with `npm install`, run:

```sh
npm run dev:mock
```

Open <http://127.0.0.1:4200>. This opt-in configuration signs in a synthetic
`demo` administrator and serves an in-browser API with a welcome dashboard,
clock, user profile, protocol mapping, and editable dashboard/preferences data.
There is no backend process, password, subscription, or real API token.
The dev server polls for changes once per second to avoid file-watcher limits.

API changes are in memory and reset on reload. Demo session/settings keys use
the `HOMER-DEMO-` prefix, separate from normal `HOMER-` keys. Some UI state can
persist in browser storage. Live capture, SIP search/transaction details,
metrics, and external integrations are not implemented: unsupported Angular
HTTP requests fail explicitly instead of reaching a real backend. Local assets
are allowed; browser-loaded resources such as fonts or manually added iframes
are outside that HTTP interception, so this is not a fully offline sandbox.

`npm run test:mock` checks fixture contracts and default-mode isolation.
`npm run build:mock` writes to `dist/homer-ui-mock`. Do not deploy that build as
an authenticated service. Existing `npm run dev` and production builds retain
normal authentication and backend behavior; they do not enable demo mode.
