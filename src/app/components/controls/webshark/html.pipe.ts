import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'html',
    standalone: false
})
export class HtmlPipe implements PipeTransform {
    private sanitizer = inject(DomSanitizer);


    public transform(value: unknown): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(`<span>${String(value)}</span>`);
    }

}
