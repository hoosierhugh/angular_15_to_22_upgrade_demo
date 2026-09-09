import { Pipe, PipeTransform, inject } from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";

/**
 * Generated class for the SafeHtmlPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
    name: 'safeHtml',
    standalone: false
})
export class MessageSafeHtmlPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);


  transform(html) {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

}
