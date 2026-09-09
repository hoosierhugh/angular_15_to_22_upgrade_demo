import { Directive, Input, TemplateRef, OnInit, ElementRef, HostListener, ViewContainerRef, Component, inject } from '@angular/core';

import {
    ComponentType,
    ComponentPortal,
    TemplatePortal,
} from '@angular/cdk/portal';

import {
    OverlayRef,
    Overlay,
    OverlayPositionBuilder,
} from '@angular/cdk/overlay';

@Directive({
    selector: '[hepTooltip]',
    standalone: false
})
export class HepTooltipDirective implements OnInit {
    private overlay = inject(Overlay);
    private overlayPostionBuilder = inject(OverlayPositionBuilder);
    private elementRef = inject(ElementRef);
    private viewContainerRef = inject(ViewContainerRef);

    @Input('hepTooltip') tooltipContent: TemplateRef<unknown> | ComponentType<unknown>;

    private _overlayRef: OverlayRef;
    ngOnInit(): void {
        if (this.tooltipContent) {
            const position = this.overlayPostionBuilder
                .flexibleConnectedTo(this.elementRef)
                .withPositions([
                    {
                        originX: 'center',
                        originY: 'bottom',
                        overlayX: 'center',
                        overlayY: 'top',
                        offsetX: 0,
                        offsetY: 8,
                    },
                    {
                        originX: 'center',
                        originY: 'top',
                        overlayX: 'center',
                        overlayY: 'bottom',
                        offsetX: 0,
                        offsetY: -8,
                    },
                ]);

            this._overlayRef = this.overlay.create({
                positionStrategy: position,
                scrollStrategy: this.overlay.scrollStrategies.close(),
                panelClass: 'custom-tooltip',
            });
        } else {
            console.log('tooltip content non shown');
        }
    }
    @HostListener('mouseover')
    _show(): void {
        if (this._overlayRef) {
            let containerPortal: TemplatePortal<unknown> | ComponentPortal<unknown>;
            if (this.tooltipContent instanceof TemplateRef) {
                containerPortal = new TemplatePortal(
                    this.tooltipContent,
                    this.viewContainerRef
                );
            } else {
                containerPortal = new ComponentPortal(
                    this.tooltipContent,
                    this.viewContainerRef
                );
            }
            this._overlayRef.attach(containerPortal);
        }
    }
    @HostListener('mouseout')
    _hide(): void {
        if (this._overlayRef) {
            this._overlayRef.detach();
        }
    }
}
