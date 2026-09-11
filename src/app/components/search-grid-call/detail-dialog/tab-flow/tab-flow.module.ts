import { FlowItemComponent } from './flow-item/flow-item.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabFlowComponent } from './tab-flow.component';
// import { VirtualScrollerModule } from 'ngx-virtual-scroller';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core'
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatTooltipModule } from '@angular/material/tooltip';
@NgModule({
  imports: [
    CommonModule,
    // VirtualScrollerModule,
    ScrollingModule,
    TranslatePipe,
    TranslateDirective,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  declarations: [
    TabFlowComponent,
    FlowItemComponent,
  ],
  exports: [TabFlowComponent]

})
export class TabFlowModule { }
