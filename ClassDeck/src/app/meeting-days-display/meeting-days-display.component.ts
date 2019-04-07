import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-meeting-days-display',
  templateUrl: './meeting-days-display.component.html',
  styleUrls: ['./meeting-days-display.component.scss']
})
export class MeetingDaysDisplayComponent implements OnInit {

  @Input() meeting_days: String;
  @Input() start_time;
  @Input() end_time;

  constructor() { }

  ngOnInit() {
  }

  public meets_on_day(day) {
    return this.meeting_days.includes(day);
  }

}
