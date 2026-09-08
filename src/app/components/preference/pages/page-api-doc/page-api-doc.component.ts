import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { environment } from '@environments/environment';
import { MOCK_MODE } from '@app/runtime-mode';
import SwaggerUIBundle from 'swagger-ui-dist/swagger-ui-bundle.js';

// declare const SwaggerUIBundle: any;
@Component({
    selector: 'app-page-api-doc',
    templateUrl: './page-api-doc.component.html',
    styleUrls: ['./page-api-doc.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})

export class PageApiDocComponent implements OnInit {
    @Input() page: string;
    @Input() pageID: string;
    readonly isMockMode = MOCK_MODE;

    ngOnInit(): void {
        // The local demo intentionally has no Swagger endpoint or real API.
        if (this.isMockMode) {
            return;
        }

        const url = new URL(environment.apiUrl, document.baseURI);
        const ui = SwaggerUIBundle({
            dom_id: '#swagger-ui',
            layout: 'BaseLayout',
            presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIBundle.SwaggerUIStandalonePreset
            ],
            url: url.origin + '/doc/api/json',
            docExpansion: 'none',
            operationsSorter: 'alpha'
        });
    }
}
