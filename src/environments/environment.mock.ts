import { VERSION } from '../VERSION';
import { AppEnvironment } from './environment.types';

// Never target a real HOMER API in demo mode.
export const environment: AppEnvironment = {
    production: false,
    environment: `${VERSION} — LOCAL DEMO`,
    isHomerAPI: true,
    apiUrl: '/__mock_api__/v3'
};
