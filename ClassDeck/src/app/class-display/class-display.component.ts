import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-class-display',
  templateUrl: './class-display.component.html',
  styleUrls: ['./class-display.component.scss']
})
export class ClassDisplayComponent implements OnInit {

  baseUrl = "http://localhost:8080/pablokvitca/classdeck-api/1.0.0";
  @Input() course;
  @Input() semesterId;
  expanded_prereq: boolean = false;
  expanded_sections: boolean = false;
  sections: any[] = [];
  loaded_sections: boolean = false;

  constructor(private httpClient: HttpClient, private ref: ChangeDetectorRef) { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.loadSections();
  }

  loadSections() {
    if (this.expanded_sections && !this.loaded_sections) {
      this.httpClient.get(this.baseUrl + "/section/by_class/" + this.semesterId + "/" + this.course.class_dept + "/" + this.course.class_number).subscribe((res: any) => {
        this.sections = res;
        this.loaded_sections = true;
      }, (err) => {
        this.loaded_sections = true;
      });
    }
  }

  prereqExpanded(v: boolean) {
    this.expanded_prereq = v;
  }

  sectionsExpanded(v: boolean) {
    this.expanded_sections = v;
    this.loadSections();
  }

}
