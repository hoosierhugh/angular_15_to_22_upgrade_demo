import hljs from 'highlight.js';
import { Component, EventEmitter, Input, OnInit, Output, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, HostListener, ElementRef, inject } from '@angular/core';
import { CodeJarContainer } from 'ngx-codejar';

@Component({
    selector: 'app-codejar-wrapper',
    templateUrl: './codejar-wrapper.component.html',
    styleUrls: ['./codejar-wrapper.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class CodeJarWrapperComponent implements OnInit, AfterViewInit {
    private cdr = inject(ChangeDetectorRef);

    @Input()
    set text(value: string) {
        this.code = value;
        requestAnimationFrame(() => this.cdr.detectChanges());
    }
    get text(): string {
        return this.code;
    }
    @Output() textChange = new EventEmitter<string>();
    @Input() mode: string;
    @Input() jsonValidator = false;
    @Input() theme = 'monokai';
    _readOnly = false;
    @Input()
    set readOnly(value: boolean) {
        this._readOnly = value;
        if (this.codejar) {
            console.log('set readOnly', this._readOnly, this.codejar);
            this.updateContentEditable();
        }
    };
    get readOnly(): boolean {
        return this._readOnly;
    }
    @Input() durationBeforeCallback = 0;
    @Input() disabled = false;

    @Output() ready = new EventEmitter<string>();
    code = '';
    errorMessage = '';
    isReadyToShow = false;

    @ViewChild('codejar') codejar: ElementRef<HTMLDivElement>;
    @HostListener('document:keydown', ['$event'])
    handleReadOnly(event: KeyboardEvent) {
        return;
        const buttonList = ['Enter', 'Backspace', 'Delete', 'Insert']
        if (this.readOnly && event.key && (event.key.length === 1 || event.ctrlKey || event.shiftKey || buttonList.includes(event.key) )) {
            event.preventDefault();
            event.stopPropagation();
        }
    }
    highlightMethodJSON(editor: CodeJarContainer) {
        if (editor.textContent !== null && editor.textContent !== undefined) {
            editor.innerHTML = hljs.highlight(editor.textContent, { language: 'json' }).value;
        }
    }
    highlightMethod(editor: CodeJarContainer) {
        if (editor.textContent !== null && editor.textContent !== undefined) {
            editor.innerHTML = hljs.highlight(editor.textContent, { language: 'javascript' }).value;
        }
    }

    ngAfterViewInit(): void {

        requestAnimationFrame(() => {
            console.log('ngAfterViewInit');
            if (this.codejar) {
                console.log('set readOnly:requestAnimationFrame', this._readOnly, this.codejar);
                this.updateContentEditable();
            }
        })
    }
    ngOnInit(): void {
    }

    private updateContentEditable(): void {
        this.codejar.nativeElement.querySelector('pre')
            ?.setAttribute('contenteditable', String(!this._readOnly));
    }

    onChangeCode(event: string) {
        this.code = event;
        if (this.jsonValidator) {
            try {
                JSON.parse(this.code);
                this.errorMessage = '';
            } catch (error: unknown) {
                this.errorMessage = error instanceof Error ? error.message : String(error);
            }
        }
        requestAnimationFrame(() => this.cdr.detectChanges());
        this.textChange.emit(this.code);
    }
}
