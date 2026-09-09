import { Injectable, inject } from '@angular/core';
import { LOCALE_CONFIG, DefaultLocaleConfig, LocaleConfig } from './daterangepicker.config';

@Injectable()
export class LocaleService {
  private _config = inject<LocaleConfig>(LOCALE_CONFIG);


  get config() {
    if (!this._config) {
      return DefaultLocaleConfig;
    }

    return {... DefaultLocaleConfig, ...this._config};
  }
}
