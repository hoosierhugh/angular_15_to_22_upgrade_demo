import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'html'
})
export class HtmlPipe implements PipeTransform {

    constructor(private sanitizer: DomSanitizer) { }

    public transform(value: unknown): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(`<span>${String(value)}</span>`);
    }

}
