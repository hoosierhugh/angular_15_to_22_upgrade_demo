import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Functions } from '@app/helpers/functions';

export enum ArrowEventState {
    PREVIOUS = 'previous',
    FOLLOWING = 'following'
}

export interface MessageDetailsEvent {
    message: unknown;
    metadata: MessageNavigationMetadata;
}

export interface MessageDetailsArrowEvent {
    eventType: ArrowEventState;
    metadata: MessageArrowMetadata;
}

export interface MessageNavigationMetadata {
    channelId: string;
    itemId: number;
    isLeft: boolean;
    isRight: boolean;
    isBrowserWindow: boolean;
}

export interface MessageArrowMetadata {
    data: Pick<MessageNavigationMetadata, 'channelId' | 'itemId'>;
    mouseEventData: unknown;
}

export interface ParentWindowData {
    isBrowserWindow?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class MessageDetailsService {
    static parentWindow: Record<string, ParentWindowData> = {};

    private subject = new Subject<MessageDetailsEvent>();
    private subjectArrows = new Subject<MessageDetailsArrowEvent>();

    public get event(): Observable<MessageDetailsEvent> {
        return this.subject.asObservable();
    }

    public get arrows(): Observable<MessageDetailsArrowEvent> {
        return this.subjectArrows.asObservable();
    }
    public setParentWindowData(indexWindow: string, data: ParentWindowData = {}): void {
        const hash = Functions.md5(indexWindow);
        MessageDetailsService.parentWindow[hash] = data;
    }
    public getParentWindowData(indexWindow: string): ParentWindowData {
        const hash = Functions.md5(indexWindow);
        const p = MessageDetailsService.parentWindow;
        return p && p[hash] || { isBrowserWindow: false };
    }

    public open(message: unknown, metadata: MessageNavigationMetadata): void {
        this.subject.next({ message, metadata });
    }

    public clickArrowRight(metadata: MessageArrowMetadata): void {
        this.subjectArrows.next({
            eventType: ArrowEventState.FOLLOWING,
            metadata
        });
    }

    public clickArrowLeft(metadata: MessageArrowMetadata): void {
        this.subjectArrows.next({
            eventType: ArrowEventState.PREVIOUS,
            metadata
        });
    }
}
