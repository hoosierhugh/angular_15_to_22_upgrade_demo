import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core'

@Component({
    selector: 'app-delete-dialog',
    templateUrl: './delete-dialog.component.html',
    styleUrls: ['./delete-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class DeleteDialogComponent {
  dialogRef = inject<MatDialogRef<DeleteDialogComponent>>(MatDialogRef);
  translateService = inject(TranslateService);
  data = inject(MAT_DIALOG_DATA);


  constructor() {
       const translateService = this.translateService;

       translateService.addLangs(['en'])
        translateService.setFallbackLang('en')
    }

  onNoClick(): void {
      this.dialogRef.close();
  }
}

