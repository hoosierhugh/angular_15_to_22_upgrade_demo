import { VERSION } from '../VERSION';

// Never target a real HOMER API in demo mode.
export const environment = {
    production: false,
    environment: `${VERSION} — LOCAL DEMO`,
    isHomerAPI: true,
    apiUrl: '/__mock_api__/v3'
};
