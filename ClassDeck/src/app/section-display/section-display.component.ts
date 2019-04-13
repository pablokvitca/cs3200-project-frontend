import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-section-display',
  templateUrl: './section-display.component.html',
  styleUrls: ['./section-display.component.scss']
})
export class SectionDisplayComponent implements OnInit {

  baseUrl = "http://localhost:8080/pablokvitca/classdeck-api/1.0.0";

  @Input() section: any;
  @Input() removable: boolean = false;
  @Input() add_section;
  @Input() remove_section;

  constructor(private httpClient: HttpClient, private router: Router, private ref: ChangeDetectorRef) { }

  ngOnInit() {
    if (this.section.meeting_times == undefined) {
      this.load_meeting_times();
    }
  }

  ngOnChange() {
    if (this.section.meeting_times == undefined) {
      this.load_meeting_times();
    }
  }

  private load_meeting_times() {
    this.httpClient.get(this.baseUrl + '/section/' + this.section.crn)
      .subscribe((res: any) => {
        this.section.meeting_times = res.meeting_times;
        this.ref.markForCheck();
      });
  }

  add_section_to_schedule_option(event, crn) {
    this.add_section.emit(crn);
  }

  remove_section_to_schedule_option(event, crn) {
    this.remove_section.emit(crn);
  }

}
