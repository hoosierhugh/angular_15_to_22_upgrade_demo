import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';
import { AlertMessage, AlertSubject } from '@app/models/alert.model';

export { AlertMessage } from '@app/models/alert.model';
@Injectable({ providedIn: 'root' })
export class AlertService {
  private subject = new Subject<AlertSubject | null>();
  private keepAfterNavigationChange = false;
  private basePagForRedirectTo = "dashboard/home";
  private baseErrorAfterUnexistingID = "dashboard for the user doesn't exist";
  private waitTimeAfterError = 2000;
  constructor(private router: Router,
    public translateService: TranslateService) {
    // clear alert message on route change
    router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        if (this.keepAfterNavigationChange) {
          // only keep for a single location change
          this.keepAfterNavigationChange = false;
        } else {
          // clear alert
          this.subject.next(null);
        }
      }
    });
  }


  hide() {
    this.subject.next(null);
  }
  toTypeAlertMessage(message: unknown): AlertMessage {
    if (typeof message === "string") {
      return {
        isTranslation: false,
        message
      };
    }
    if (message instanceof Error) {
      return { message: message.message, fullObject: message };
    }
    if (isAlertMessage(message)) {
      return message;
    }
    return { message: String(message), fullObject: message };
  }
  async success(alert: unknown, fullObject: string = '', keepAfterNavigationChange = false) {
    const message = this.toTypeAlertMessage(alert);
    if (message.isTranslation) {
      message.message = await this.getTranslation(message.message, message.translationParams);
    }
    this.keepAfterNavigationChange = keepAfterNavigationChange;
    this.subject.next({ type: 'success', text: message.message, object: message.fullObject });
  }

  async error(alert: unknown, fullObject: string = '', keepAfterNavigationChange = false) {
    const message = this.toTypeAlertMessage(alert);
    if (message.isTranslation) {
      message.message = await this.getTranslation(message.message, message.translationParams);
    }
    this.keepAfterNavigationChange = keepAfterNavigationChange;
    this.subject.next({ type: 'error', text: message.message, object: message.fullObject });
    if (message.message === this.baseErrorAfterUnexistingID) {
      setTimeout(() => { this.router.navigate([this.basePagForRedirectTo]) }, this.waitTimeAfterError);
    }
  }

  async warning(alert: unknown, fullObject: string = '', keepAfterNavigationChange = false) {
    const message = this.toTypeAlertMessage(alert);
    if (message.isTranslation) {
      message.message = await this.getTranslation(message.message, message.translationParams);
    }
    this.keepAfterNavigationChange = keepAfterNavigationChange;
    this.subject.next({ type: 'warning', text: message.message, object: message.fullObject });
  }

  async notice(alert: unknown, fullObject: string = '', keepAfterNavigationChange = false) {
    const message = this.toTypeAlertMessage(alert);
    if (message.isTranslation) {
      message.message = await this.getTranslation(message.message, message.translationParams);
    }
    this.keepAfterNavigationChange = keepAfterNavigationChange;
    this.subject.next({ type: 'notice', text: message.message, object: message.fullObject });
  }
  getTranslation(message: string, translationParams): string {
    this.translateService.get(message, translationParams).subscribe((res: string) => {
      message = res;
    })
    return message;
  }
  getMessage(): Observable<AlertSubject | null> {
    return this.subject.asObservable();
  }
}

function isAlertMessage(value: unknown): value is AlertMessage {
  return typeof value === 'object' && value !== null &&
    'message' in value && typeof value.message === 'string';
}
