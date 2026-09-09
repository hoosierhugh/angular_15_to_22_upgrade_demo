import { WindowService } from '@app/components/controls/modal-resizable/window/window.service';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, ViewChild, Input, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { TooltipService, TooltipDetails } from '@app/services/tooltip.service';

@Component({
    selector: 'tooltip',
    templateUrl: './flow-tooltip.component.html',
    styleUrls: ['./flow-tooltip.component.scss'],
    host: { '(document:mousemove)': 'onMouseMove($event)' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class FlowTooltipComponent implements OnInit, OnDestroy {
    private windowService = inject(WindowService);
    private tooltipService = inject(TooltipService);
    private cdr = inject(ChangeDetectorRef);

    private subscription: Subscription;
    isMessage: boolean;
    messageTable: { name: string; value: unknown }[];
    messageString: string;
    messageChart:  string;
    type = 'string';
    messageBuffer = '';
    point: { left: number; top: number } = {
        left: 0,
        top: 0
    };
    isLinkImg: boolean;
    @Input() isForPopup = false;
    @ViewChild('tooltipContainer', { static: true }) tooltipContainer: ElementRef;

    onMouseMove(evt: MouseEvent) {
        const getParentBody = (el: HTMLElement | null): HTMLElement | null => {
            if (!el) {
                return null;
            }
            if (el?.tagName === 'BODY') {
                return el;
            }
            return getParentBody(el.parentElement);
        };

        const parentBody = getParentBody(this.tooltipContainer.nativeElement);
        this.tooltipContainer.nativeElement.style.opacity =
            evt.view?.document?.body?.id === parentBody?.id ? (
                this.isForPopup && parentBody?.id === '' ? 0 : 1
            ) : 0;
        const tcHeight = this.tooltipContainer.nativeElement.offsetHeight;
        this.point.left = Math.min(evt.clientX + 10, evt.view?.innerWidth - 250);
        this.point.top = Math.min(evt.clientY + 10, evt.view?.innerHeight - tcHeight);
        this.cdr.detectChanges();
    }

    ngOnInit() {
        this.windowService.listen.subscribe(evt => {
            this.onMouseMove(evt);
        })
        this.subscription = this.tooltipService.getMessage().subscribe(message => {
            this.isMessage = !!message;
            if (typeof message === 'string') {
                this.type = 'string';

                this.messageString = message;
                this.cdr.detectChanges();
                return;
            }
            if (!message) {
                this.cdr.detectChanges();
                return;
            }
            this.type = 'object';
            const details: TooltipDetails = message;
            if (details.custom === true && this.messageBuffer !== JSON.stringify(details) && this.type !== 'chart') {
                this.messageBuffer = JSON.stringify(details);
                details.custom = null;
                this.messageTable = Object.entries(details).filter(i => !!i[1]).map(i => {
                    const [name, value] = i;
                    return { name, value };
                });
            } else if (details && this.messageBuffer !== JSON.stringify(details)) {
                this.messageBuffer = JSON.stringify(details);

                const sortedDetails: TooltipDetails = Object.assign({
                    image: null,
                    agent: null,
                    dns: null,
                    alias: null
                }, details); // sort by name
                sortedDetails.position = null;
                sortedDetails.hidden = null;
                sortedDetails.isIPv4 = null;
                sortedDetails.ip_array = null;
                this.isLinkImg = sortedDetails.isLinkImg;
                this.messageTable = Object.entries(sortedDetails).filter(i => !!i[1] && typeof i[1] !== 'object').map(i => {
                    const [name, value] = i;
                    return { name, value };
                });
            }
            this.cdr.detectChanges();
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
