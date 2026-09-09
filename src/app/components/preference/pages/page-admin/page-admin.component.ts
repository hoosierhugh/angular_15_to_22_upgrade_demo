import { Functions } from '@app/helpers/functions';
import { Component, Input, ChangeDetectionStrategy, inject } from '@angular/core';
import { AdminService, StreamType } from '@app/services/preferences/admin.service';
import { HttpResponse } from '@angular/common/http';
import { AlertService } from '@app/services';

@Component({
    selector: 'app-page-admin',
    templateUrl: './page-admin.component.html',
    styleUrls: ['./page-admin.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PageAdminComponent {
  private adminService = inject(AdminService);
  private alertService = inject(AlertService);

  @Input() page: string;

  public async download() {
    const data: HttpResponse<Blob> = await this.adminService.getFile();
    const { headers, body } = data;
    const fName = headers.get('content-disposition') ||
      `logs-${(new Date()).toISOString()}.zip`;
    Functions.saveToFile((body as Blob), fName);
  }
  public async dumpRequest(streamName: StreamType) {
    try {
      const { data } = await this.adminService.dumpRequest(streamName);
      this.alertService.success(data?.message);
    } catch (err) {
      this.alertService.error(err);
    }
  }
}
