export interface AppEnvironment {
  production: boolean;
  environment: string;
  isHomerAPI: boolean;
  apiUrl: string;
}

interface RuntimeConfig {
  PREFIX?: string;
  API_PATH?: string;
}

type GlobalWithRuntimeConfig = typeof globalThis & {
  GLOBAL_CONFIG?: RuntimeConfig;
};

export function applyRuntimeConfig(environment: AppEnvironment): AppEnvironment {
  const runtimeConfig = (globalThis as GlobalWithRuntimeConfig).GLOBAL_CONFIG;

  if (runtimeConfig?.API_PATH) {
    environment.apiUrl = runtimeConfig.API_PATH;
  } else if (runtimeConfig?.PREFIX) {
    environment.apiUrl = location.protocol + '//' + location.host + runtimeConfig.PREFIX + 'api/v3';
  }

  return environment;
}
