import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-display-prerequisites',
  templateUrl: './display-prerequisites.component.html',
  styleUrls: ['./display-prerequisites.component.scss']
})
export class DisplayPrerequisitesComponent implements OnInit {

  @Input() classDept;
  @Input() classNumber;

  constructor() { }

  ngOnInit() {
  }

}
