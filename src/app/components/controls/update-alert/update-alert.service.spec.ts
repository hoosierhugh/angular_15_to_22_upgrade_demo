
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UpdateAlertService, UpdateCheckResponse } from './update-alert.service';
import { VERSION } from '../../../../VERSION';
import { environment } from '@environments/environment';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('Service: UpdateAlert', () => {
  let service: UpdateAlertService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UpdateAlertService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(UpdateAlertService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('creates the service', () => {
    expect(service).toBeTruthy();
  });

  it('checks for an update using the current UI version', () => {
    const response = {
      data: { upgrade: true, version: '9.0.0' },
      message: 'A newer version is available'
    };

    service.check().subscribe((result) => {
      expect(result).toEqual(response);
    });

    const request = httpTesting.expectOne(
      `${environment.apiUrl}/version/ui/check/${VERSION}`
    );
    expect(request.request.method).toBe('GET');
    request.flush(response);
  });

  it('forwards a server response without changing it', () => {
    const response = { data: { upgrade: false } };
    let received: UpdateCheckResponse | undefined;

    service.check().subscribe((result) => {
      received = result;
    });

    httpTesting.expectOne(
      `${environment.apiUrl}/version/ui/check/${VERSION}`
    ).flush(response);

    expect(received).toEqual(response);
  });
});
