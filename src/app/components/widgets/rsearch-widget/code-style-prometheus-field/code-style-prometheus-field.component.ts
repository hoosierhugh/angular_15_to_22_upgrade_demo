import { Component, ViewChild, AfterViewInit, Output, EventEmitter, Input, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';

interface TextSegment {
  text: string;
  node: Node;
}

export interface PrometheusCodeUpdate {
  text: string;
  serverLoki: string;
  obj: Record<string, string | null> | string;
  rxText: string;
}

@Component({
    selector: 'app-code-style-prometheus-field',
    templateUrl: './code-style-prometheus-field.component.html',
    styleUrls: ['./code-style-prometheus-field.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CodeStylePrometheusFieldComponent implements AfterViewInit {
  divHTML: string;
  divText: string;
  serverLoki: string;
  editor: HTMLElement;
  isLabel = true;
  _queryText: string;

  lokiConnectionDisapper = false;

  menuTitle: string;
  private _menuDOM: HTMLElement;
  private lastMenuXPosition = 0;

  @Input() set queryText(val: string) {
    this._queryText = val;
    this.updateEditor(null);
  }
  get queryText() {
    return this._queryText;
  }
  @Input() arrayForMenu: string[] = [];
  @Output() updateData = new EventEmitter<PrometheusCodeUpdate>();
  @Output() keyEnter = new EventEmitter<void>();
  @ViewChild('divContainer', { static: false }) divContainer: ElementRef<HTMLDivElement>;
  @ViewChild(MatMenuTrigger, { static: false }) trigger: MatMenuTrigger;

  popupList: string[];

  ngAfterViewInit() {
    this.editor = this.divContainer.nativeElement;
    this.editor.addEventListener('input', this.updateEditor.bind(this));
    if (this.queryText) {
      this.editor.innerText = this.queryText;
      this.updateEditor(null);
    }
    // this.arrayForMenu = [];
  }

  triggerNavMenu(action: string = null) {
    switch (action) {
      case 'ArrowUp': case 'ArrowDown':
        this.trigger.menu.focusFirstItem();
        break;
      case 'Enter':
        if (!this.trigger.menuOpen) {
          this.keyEnter.emit();
        }
        break;
    }

  }
  onKeyDownDiv(event: KeyboardEvent) {
    if (({ ArrowDown: 1, ArrowUp: 1, Enter: 1 })[event.key]) {
      this.triggerNavMenu(event.key);
      event.preventDefault();
      return;
    }
  }
  private setMenuXPosition() {
    if (this.getCaretPosition() === -1) {
      return;
    }
    if (!this._menuDOM) {
      this._menuDOM = document.querySelectorAll('*[id^=cdk-overlay]')[1] as HTMLElement;
      setTimeout(() => {
        this._menuDOM.style.marginTop = '-18px';
        this.setMenuXPosition();
      }, 0);
      return;
    }
    const x0 = this._menuDOM.getBoundingClientRect().left - (parseInt(this._menuDOM.style.marginLeft, 10) || 0);

    this._menuDOM.style.marginLeft = (this.getCaretPosition() - x0) + 'px';
  }
  private getCaretPosition() {
    try {
      const d = window.getSelection()?.anchorNode?.parentNode as HTMLElement | null;
      if (!d) {
        return -1;
      }
      this.lastMenuXPosition = Math.round(d.getBoundingClientRect().left);
      return Math.round(d.getBoundingClientRect().left);
    } catch (e) {
      return -1;
    }
  }
  gatObjectLabels(): Record<string, string[]> {
    const labels: Record<string, string[]> = {};
    this.arrayForMenu.forEach(item => {
      const labelBlock = item.match(/\{(.+)\}/g)?.find(Boolean);
      if (!labelBlock) {
        return;
      }
      labelBlock.replace(/[\{\}\s\"]{1}/g, '')
        .split(',')
        .map(pair => pair.split('='))
        .forEach(([name, value]) => {
          if (!name || value === undefined) {
            return;
          }
          labels[name] = labels[name] || [];
          if (!labels[name].includes(value)) {
            labels[name].push(value);
          }
        });
    });
    return labels;
  }
  getLabels() {
    const readyAdded = this.getObject(this.editor.innerText);
    this.popupList = Object.keys(this.gatObjectLabels()).filter(i => {
      return Object.keys(readyAdded).indexOf(i) === -1;
    });

    this.isLabel = true;
    if (this.popupList.length > 0) {
      this.menuTitle = 'Labels';
      this.trigger.openMenu();
      this.setMenuXPosition();
      this.editor.focus();
    }
  }
  getVariabls(label: string = null) {
    setTimeout(() => {
      label = label || this.editor.innerText.split(',').pop().replace(/[\=\"\,\{\}]+/g, '');
      this.isLabel = false;

      this.popupList = this.gatObjectLabels()[label] || [];

      if (this.popupList.length > 0) {
        this.menuTitle = `Label value for "${label}"`;
        this.trigger.openMenu();
        this.setMenuXPosition();
        this.editor.focus();
      }
    }, 10);
  }
  onKeyUpDiv(event: KeyboardEvent): boolean | void {
    if (this.editor.innerText === '' || [17, 16].indexOf(event.keyCode) !== -1) {
      return;
    }
    if (({ ArrowDown: 1, ArrowUp: 1, Enter: 1 })[event.key]) {
      this.triggerNavMenu(event.key);
      event.preventDefault();
      return;
    }

    if ([8, 221].indexOf(event.keyCode) !== -1) {
      if (')}]'.indexOf(this.editor.innerText[0]) !== -1) {
        this.editor.innerText = this.editor.innerText.slice(1);
      }
      if (this.editor.innerText === '') {
        this.trigger.closeMenu();
        return;
      }
      event.preventDefault();
      return false;
    }
    if ([219, 222, 188, 187, 192].indexOf(event.keyCode) !== -1) {
      const [getLastLetter] = (window.getSelection()?.anchorNode?.textContent || '').split('');

      if ('(' === getLastLetter) { // ()
        this.editor.innerText = '()';
        this.updateEditor(null);
        this.restoreSelection(1, 1);
      }
      if ('[' === getLastLetter) { // []
        this.editor.innerText = '[]';
        this.updateEditor(null);
        this.restoreSelection(1, 1);
      }
      if ('{' === getLastLetter) { // {}
        this.editor.innerText = '{}';
        this.updateEditor(null);
        this.restoreSelection(1, 1);
      }
      if ('="'.indexOf(getLastLetter) !== -1) { // '=' | '"'
        this.getVariabls();
      } else {
        const o = this.getObject(this.editor.innerText);
        const _label = Object.keys(o).filter(i => o[i] === null);
        if (_label.length > 0) {
          this.getVariabls(_label[0]);
        } else {
          this.getLabels();
        }
      }
      this.editor.focus();
    } else {
      this.trigger.closeMenu();
    }
    return;
  }
  getObject(str: string): Record<string, string | null> | string {
    if (str.match(/\{.*\}/g)) {
      str = str.match(/\{.*\}/g).find(i => !!i);
    }
    const json = str.replace(/\{|\}/g, '')
      .split(',')
      .map(i => {
        if (i.indexOf('=') === -1) {
          i += ':';
        }
        return i;
      }).join(',')
      .replace(/\=/g, ':')
      .replace(/[a-zA-Z-]+/g, (a, b) => `"${a}"`)
      .replace(/\"\"/g, '"')
      .replace(/\s/g, '')
      .replace(/^.*$/g, a => `{${a}}`)
      .replace(',}', '}')
      .replace(':}', ': null}')
      .replace('":"}', '": null}')
      .replace('",: null}', '"}');
    try {
      if (json === '{: null}') {
        return {};
      }
      return JSON.parse(json) as Record<string, string | null>;
    } catch (e) {
      return json;
    }
  }
  getRegExpString(str: string): string {
    return str.split(/\{.*\}\s*/g)[1] || '';
  }
  onMenuMessage(item: string, event: KeyboardEvent | null = null) {
    if (!event || (event.keyCode === 13 || event.keyCode === 32)) {
      if (this.isLabel) {
        this.typeInTextarea(item + '=');
        this.updateEditor(null, true);
        const c = this.editor.innerText.length - 1;
        this.restoreSelection(c, c);
        this.getVariabls();
      } else {
        this.typeInTextarea(`"${item}"`);
        this.updateEditor(null);
        const c = this.editor.innerText.length - 1;
        this.restoreSelection(c, c);
      }
    }
    if (event && event.keyCode === 27) {
      this.trigger.closeMenu();
    }
  }

  private setStyleCodeColors(str: string): string {
    const s = str.match(/[\{\}\=, ]{1}|[^\{\}\=, ]+/g);
    if (!s) {
      return '';
    }
    return s.map(i => {
      let cssClass = 'Pwhite';
      if ('{}'.indexOf(i) !== -1) {
        cssClass = 'Pbracket';
      } else if (i === '=') {
        cssClass = 'Pequally';
      } else if (i.match(/[\"\'\`]+/g)) {
        cssClass = 'Pquotes';
      } else if (i.match(/[a-z]+/g)) {
        cssClass = 'Plabel';
      }
      const span = document.createElement('span');
      span.classList.add(cssClass);
      span.innerText = i;

      return span.outerHTML;
    }).join('');
  }

  private getTextSegments(element: Node): TextSegment[] {
    const textSegments: TextSegment[] = [];
    try {
      Array.from(element.childNodes).forEach((node: Node) => {
        switch (node.nodeType) {
          case Node.TEXT_NODE:
            textSegments.push({ text: node.nodeValue || '', node });
            break;

          case Node.ELEMENT_NODE:
            textSegments.splice(textSegments.length, 0, ...(this.getTextSegments(node)));
            break;

          default:
            throw new Error(`Unexpected node type: ${node.nodeType}`);
        }
      });
    } catch (err) {
      // Ignore unsupported selection nodes.
    }
    return textSegments;
  }

  private updateEditor(_event: Event | null, setEnd = false) {
    const sel = window.getSelection();
    const textSegments = this.getTextSegments(this.editor);
    const textContent = textSegments.map(({ text }) => text).join('');
    let anchorIndex: number | null = null;
    let focusIndex: number | null = null;
    let currentIndex = 0;
    textSegments.forEach(({ text, node }) => {
      if (node === sel?.anchorNode) {
        anchorIndex = currentIndex + sel.anchorOffset;
      }
      if (node === sel?.focusNode) {
        focusIndex = currentIndex + sel.focusOffset;
      }
      currentIndex += text.length;
    });

    try {
      this.editor.innerHTML = this.setStyleCodeColors(textContent); // this.renderText(textContent);
    } catch (err) {
      // Ignore editor updates before the editable element is ready.
    }

    if (setEnd) {
      this.restoreSelection(this.editor.innerText.length, this.editor.innerText.length);
    } else {
      this.restoreSelection(anchorIndex ?? 0, focusIndex ?? anchorIndex ?? 0);
    }
    this.updateData.emit({
      text: textContent,
      serverLoki: this.serverLoki,
      obj: this.getObject(textContent),
      rxText: this.getRegExpString(textContent)
    });
  }

  private restoreSelection(absoluteAnchorIndex: number, absoluteFocusIndex: number) {
    const sel = window.getSelection();
    if (!sel) {
      return;
    }
    const textSegments = this.getTextSegments(this.editor);
    let anchorNode: Node = this.editor;
    let anchorIndex = 0;
    let focusNode: Node = this.editor;
    let focusIndex = 0;
    let currentIndex = 0;

    textSegments.forEach(({ text, node }) => {
      const startIndexOfNode = currentIndex;
      const endIndexOfNode = startIndexOfNode + text.length;
      if (startIndexOfNode <= absoluteAnchorIndex && absoluteAnchorIndex <= endIndexOfNode) {
        anchorNode = node;
        anchorIndex = absoluteAnchorIndex - startIndexOfNode;
      }
      if (startIndexOfNode <= absoluteFocusIndex && absoluteFocusIndex <= endIndexOfNode) {
        focusNode = node;
        focusIndex = absoluteFocusIndex - startIndexOfNode;
      }
      currentIndex += text.length;
    });
    try {
      sel.setBaseAndExtent(anchorNode, anchorIndex, focusNode, focusIndex);
    } catch (err) {
      // Ignore invalid selection restoration ranges.
    }
  }
  private typeInTextarea(str: string) {
    const sel = window.getSelection() as Selection;
    const el = sel.anchorNode?.parentNode as HTMLElement | null;
    if (!el) {
      return false;
    }
    const start = sel.anchorOffset || 0;
    const end = sel.focusOffset || 0;
    const text = el.innerText;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    el.innerText = (before + str + after);
    el.focus();
    return false;
  }
}
