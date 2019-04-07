import { Component, OnInit, Input, Output } from '@angular/core';

@Component({
  selector: 'app-schedule-option-display',
  templateUrl: './schedule-option-display.component.html',
  styleUrls: ['./schedule-option-display.component.scss']
})
export class ScheduleOptionDisplayComponent implements OnInit {

  @Input() scheduleOption;
  @Input() add_section;
  @Input() remove_section;

  constructor() { }

  ngOnInit() {
  }

}
