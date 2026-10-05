import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AllCommunityModule, ModuleRegistry, provideGlobalGridOptions } from 'ag-grid-community';

import { AppModule } from './app/app.module';

// The app uses AG Grid's legacy CSS themes from styles.scss.
ModuleRegistry.registerModules([AllCommunityModule]);
provideGlobalGridOptions({ theme: 'legacy' });

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
