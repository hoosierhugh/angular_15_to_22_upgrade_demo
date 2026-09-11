import { Component, Input, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IWidget } from '../IWidget';
import { Router } from '@angular/router';
// import { SearchGridCallComponent } from '@app/components/search-grid-call/search-grid-call.component';
import { Widget, WidgetArrayInstance } from '@app/helpers/widget';
import { ConstValue, UserConstValue } from '@app/models';
import { SearchService } from '@app/services';
import { Functions } from '@app/helpers/functions';
import { TranslateService } from '@ngx-translate/core'
import { LokiCodeData } from './code-style-field/code-style-field.component';

interface LokiSearchQuery {
  text?: string;
  rxText?: string;
  limit: number;
  protocol_id: string;
  fields: unknown[];
  [key: string]: unknown;
}
@Component({
    selector: 'app-rsearch-widget',
    templateUrl: './rsearch-widget.component.html',
    styleUrls: ['./rsearch-widget.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
@Widget({
  title: 'Loki Search',
  description: 'Display Loki Search Form',
  category: 'Search',
  subCategory: 'Other',
  indexName: 'rsearch',
  settingWindow: false,
  className: 'RsearchWidgetComponent',
  submit: true,
  minHeight: 300,
  minWidth: 300,
  deprecated: true
})
export class RsearchWidgetComponent implements IWidget, OnInit {
  dialog = inject(MatDialog);
  translateService = inject(TranslateService);
  private router = inject(Router);
  private searchService = inject(SearchService);

  @Input() id: string;
  @Input() config: unknown;

  lokiQuery: string;
  limit = 100;
  searchQueryLoki: LokiSearchQuery;
  queryText: string;
  constructor() {
    const translateService = this.translateService;

    translateService.addLangs(['en'])
    translateService.setFallbackLang('en')
  }

  ngOnInit() {
    WidgetArrayInstance[this.id] = this as IWidget;
    const data = Functions.JSON_parse(localStorage.getItem(UserConstValue.SEARCH_QUERY_LOKI)) ||
      Functions.JSON_parse(localStorage.getItem(ConstValue.SEARCH_QUERY_LOKI));
    if (data) {
      this.queryText = data.text;
      this.limit = data.limit * 1 || 100;
    }
  }
  onCodeData(event: LokiCodeData) {
    this.searchQueryLoki = {
      ...event,
      limit: this.limit * 1 || 100,
      protocol_id: ConstValue.LOKI_PREFIX,
      fields: []
    };
  }
  doSearchResult() {
    this.searchService.setLocalStorageQuery(this.searchQueryLoki);
    // setStorage(ConstValue.SEARCH_QUERY, this.searchQueryLoki);
    this.router.navigate(['search/result']);

  }
  onChangeField(event: unknown) {
    // Template hook retained for the deprecated Loki search widget.
  }
  handleEnterKeyPress(event) {
    const tagName = event.target.tagName.toLowerCase();

    if (tagName !== 'textarea') {
      setTimeout(this.doSearchResult.bind(this), 100);
      return false;
    }
    return null;
  }
  onClearFields() {
    this.lokiQuery = '';
    this.limit = 100;
  }
  openDialog(): void {
    // Required by IWidget; settings are edited inline for this widget.
  }

}
