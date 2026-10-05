import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AllCommunityModule, ModuleRegistry, provideGlobalGridOptions } from 'ag-grid-community';
import {
  AllCommunityModule as AllChartsCommunityModule,
  ModuleRegistry as ChartsModuleRegistry,
} from 'ag-charts-community';

import { AppModule } from './app/app.module';

// The app uses AG Grid's legacy CSS themes from styles.scss.
ModuleRegistry.registerModules([AllCommunityModule]);
provideGlobalGridOptions({ theme: 'legacy' });
ChartsModuleRegistry.registerModules([AllChartsCommunityModule]);

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
