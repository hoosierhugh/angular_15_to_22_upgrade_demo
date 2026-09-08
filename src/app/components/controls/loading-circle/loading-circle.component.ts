import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-loading-circle',
    templateUrl: './loading-circle.component.html',
    styleUrls: ['./loading-circle.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class LoadingCircleComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
