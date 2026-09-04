// Synthetic fixtures only. Nothing here is a credential or production record.
export const demoUser = {
    id: 1, guid: 'demo-user', username: 'demo', firstname: 'Demo', lastname: 'User',
    email: 'demo@example.test', partid: 10, usergroup: 'admin', department: 'Local demo'
};

export function createHomeDashboard() {
    return {
        id: 'home', dashboardId: 'home', owner: 'demo', name: 'Local demo',
        data: {
            dashboardId: 'home', name: 'Local demo', type: 1, shared: false,
            config: { columns: 33, maxrows: 33, gridType: 'fit' },
            widgets: [
                {
                    id: 'demo-welcome', name: 'embed-markdown', strongIndex: 'AceEditorWidgetComponent',
                    x: 0, y: 0, cols: 22, rows: 22, minWidth: 300, minHeight: 300,
                    config: {
                        title: 'Welcome to the local demo', theme: 'clouds_midnight',
                        text: '# HOMER local demo\n\nYou are automatically signed in as **demo**. No backend server or account is required.\n\nExplore the menus, change dashboard layouts, or add a clock or Markdown widget.\n\n**All API data is synthetic. Changes reset when you reload.**\n\nCapture ingestion, live metrics, external integrations and transaction details are not implemented. Unsupported requests show a demo error instead of contacting a real server.'
                    }
                },
                {
                    id: 'demo-clock', name: 'clock', strongIndex: 'ClockWidgetComponent',
                    x: 22, y: 0, cols: 11, rows: 22, minWidth: 300, minHeight: 300,
                    config: { title: 'UTC clock', location: { desc: 'UTC', name: 'UTC', offset: '+0' },
                        showAnalog: 'Digital', showDate: true, showseconds: true }
                }
            ]
        }
    };
}

export const sipMapping = {
    guid: 'demo-sip', profile: 'call', hepid: 1, hep_alias: 'SIP', partid: 10, version: 1,
    fields_mapping: ['callid', 'method', 'create_date', 'src_ip', 'dst_ip'].map((id, index) => ({
        id, name: id, type: 'string', form_type: 'input', form_default: [],
        index, position: index, hide: false, skip: false
    })), user_mapping: []
};
