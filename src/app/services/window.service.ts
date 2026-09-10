import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WindowService {
    currentWindow = '';
    windowList = new Map<string, number>();
    closeTimeout: ReturnType<typeof setTimeout>;

    close(id: string) {
        clearTimeout(this.closeTimeout)
        this.closeTimeout = setTimeout(() => {
            this.currentWindow = '';
            this.windowList.delete(id);

            const arrFromMap = [...this.windowList];

            if(arrFromMap.length > 0) {
                arrFromMap.sort((a,b) =>
                    a[1] - b[1]
                )
                this.currentWindow = arrFromMap.pop()[0];
            }
        }, 50);

    }
}
