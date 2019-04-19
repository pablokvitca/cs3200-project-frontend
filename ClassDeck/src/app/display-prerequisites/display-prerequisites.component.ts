import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-display-prerequisites',
  templateUrl: './display-prerequisites.component.html',
  styleUrls: ['./display-prerequisites.component.scss']
})
export class DisplayPrerequisitesComponent implements OnInit {

  baseUrl = "http://localhost:8080/pablokvitca/classdeck-api/1.0.0";
  loaded_prereqs: boolean = false;
  loaded_coreqs: boolean = false;
  @Input() course;
  prerequisites: any = {}
  @Input() expanded: boolean = false;
  corequisites: any = {}


  constructor(private httpClient: HttpClient) { }

  ngOnInit() {
  }

  get loaded(): boolean {
    return this.loaded_prereqs && this.loaded_coreqs;
  }

  ngOnChanges() {
    if (this.expanded && !this.loaded) {
      this.httpClient.get(this.baseUrl + "/class_prereq_group/" + this.course.class_dept + "/" + this.course.class_number).subscribe((res) => {
        this.prerequisites = res;
        this.loaded_prereqs = true;
      }, (err) => {
        this.prerequisites = {};
        this.loaded_prereqs = true;
      });
      this.httpClient.get(this.baseUrl + "/class_prereq_group/coreq/" + this.course.class_dept + "/" + this.course.class_number).subscribe((res) => {
        this.corequisites = res;
        this.loaded_coreqs = true;
      }, (err) => {
        this.corequisites = {};
        this.loaded_coreqs = true;
      });
    }
  }

  corequisitesText() {
    if (this.corequisites.group_id) {
      if (this.corequisites.class_dept == this.course.class_dept
        && this.corequisites.class_number == this.course.class_number) {
        return this.coreq_display(this.corequisites);
      }
    }
    return "None found.";
  }

  private coreq_display(c): string {
    let res = "";
    let first: boolean = true;
    c.reqs.forEach((r) => {
      if (first) {
        res += r.class_dept + " " + r.class_number;
        first = false;
      } else {
        res += " and " + r.class_dept + " " + r.class_number;
      }
    });
    return res;
  }

  prerequisitesText() {
    if (this.prerequisites.group_id) {
      if (this.prerequisites.class_dept == this.course.class_dept
        && this.prerequisites.class_number == this.course.class_number) {
        return this.prereq_display(this.prerequisites, true);
      }
    }
    return "None found.";
  }

  private prereq_display(p, outer): string {
    let join = (p.min_fulfilled_req > 1) ? "and" : "or";
    let result = (p.reqs.length == 1 || outer) ? "" : "(";
    let first = true;
    p.reqs.forEach((req) => {
      let sub_f = false;
      if (req.group_id) {
        let s = this.prereq_display(req, false);
        if (s != "()") {
          result += " " + (first ? "" : join) + " " + s + " ";
        } else {
          sub_f = true;
        }
      } else {
        result += " " + (first ? "" : join) + " " + req.class_dept + " " + req.class_number;
      }
      first = false || sub_f;
    });
    result += (p.reqs.length == 1 || outer) ? "" : ")";
    return result;
  }

}
