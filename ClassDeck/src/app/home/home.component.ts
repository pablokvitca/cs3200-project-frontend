import { FormControl } from '@angular/forms';
import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy } from '@angular/core';
import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, Subscription, Observable, Scheduler } from 'rxjs';
import { CollectionViewer } from '@angular/cdk/collections';
import * as _ from 'lodash';
import { PageEvent } from '@angular/material';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {

  baseUrl = "http://localhost:8080/pablokvitca/classdeck-api/1.0.0";
  semesters: any[] = [];
  user: any = {};
  schedule_options = [];
  selected_semester_schedule_options = [];
  selectedSemesterControl = new FormControl();
  selectedSemesterForCreationControl = new FormControl();
  titleForCreation = new FormControl();
  titleForUpdate = new FormControl();
  available_sections: any[] = [];
  filtered_sections: any[] = [];
  prev_current_schedule_id = 1;
  current_schedule_id = 1;
  selected = new FormControl(0);
  to_remove_sections = [];
  save_count = 0;
  filterSectionsControl = new FormControl();
  currentPage: number = 0;
  loaded = false;
  all_errors: string[] = [];

  @Output() remove_section = new EventEmitter<number>();
  @Output() add_section = new EventEmitter<number>();

  constructor(private httpClient: HttpClient, private router: Router, private ref: ChangeDetectorRef) {
    this.current_schedule_id = 1;
  }

  filterSectionsUpdate() {
    this.available_sections = [];
    this.load_all_sections(this.current_schedule_id);
  }

  pageEvent(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.filterDisplaySections();
    this.ref.markForCheck();
  }

  filterDisplaySections() {
    let chunks = _.chunk(this.available_sections, this.pageSize);
    this.filtered_sections = chunks[this.currentPage];
  }

  get length() {
    return this.available_sections.length;
  }

  get pageSize() {
    return 50;
  }

  ngOnInit() {
    this.load_semesters();
    this.selectedSemesterControl.valueChanges.subscribe((value) => {
      this.refresh_selected_semester_schedule_options();
      this.ref.markForCheck();
    })
    this.add_section.subscribe((crn) => {
      let sec = _.find(this.available_sections, (sec) => {
        return sec.crn == crn;
      });
      this.add_to_current_schedule_option(sec);
      this.ref.markForCheck();
    });
    this.remove_section.subscribe((crn) => {
      this.remove_from_current_schedule_option(crn);
      this.ref.markForCheck();
    });
    this.selected.valueChanges.subscribe((val) => {
      if (val != this.selected_semester_schedule_options.length) {
        val = _.filter(this.schedule_options, (opt) => {
          return opt.semester_id == this.selectedSemesterControl.value;
        })[val].schedule_option_id;
        this.current_schedule_id = val;
        this.update_current_section();
      }
      this.ref.markForCheck();
    });
  }

  remove_from_current_schedule_option(crn) {
    this.to_remove_sections.push(crn);
    this.set_current_schedule_option_sections(_.filter(this.get_current_schedule_option().sections, (sec) => {
      return sec.crn != crn;
    }));
  }

  get_current_schedule_option() {
    return _.find(this.schedule_options, (opt) => {
      return opt.schedule_option_id == this.current_schedule_id;
    });
  }

  set_current_schedule_option_sections(sections) {
    this.schedule_options = _.map(this.schedule_options, (opt) => {
      if (opt.schedule_option_id == this.current_schedule_id) {
        opt.sections = sections;
        return opt;
      } else {
        return opt;
      }
    });
  }

  private load_all_sections(sch_opt) {
    this.loaded = false;
    let query = this.filterSectionsControl.value == "" ? 'null' : this.filterSectionsControl.value;
    this.httpClient.get(this.baseUrl + '/section/filtered/' + sch_opt + "/" + query, {
      withCredentials: true
    })
      .subscribe((res: any) => {
        this.available_sections = res;
        this.loaded = true;
        this.pageEvent({ pageIndex: 0, pageSize: 50, length: this.available_sections.length });
        this.ref.markForCheck();
      });
  }

  private load_user() {
    this.httpClient.get(this.baseUrl + '/student/loggedin', {
      withCredentials: true
    })
      .subscribe((res) => {
        this.user = res[0];
        this.load_options();
        this.refresh_selected_semester_schedule_options();
        this.ref.markForCheck();
      });
  }

  private refresh_selected_semester_schedule_options() {
    this.selected_semester_schedule_options = this.schedule_options.filter(opt => {
      return this.selectedSemesterControl.value == opt.semester_id
    });
  }

  public create_schedule(event) {
    this.httpClient.post(this.baseUrl + "/schedule_option",
      {
        "schedule_option_id": -1,
        "nuid": this.user.nuid,
        "semester": this.selectedSemesterForCreationControl.value,
        "title": this.titleForCreation.value
      },
      {
        withCredentials: true
      }).subscribe((res) => {
        if (res[1] != undefined) {
          this.current_schedule_id = res[1];
          window.location.reload();
        }
        this.ref.markForCheck();
      })
  }

  update_current_section() {
    if (this.prev_current_schedule_id != this.current_schedule_id) {
      this.prev_current_schedule_id = this.current_schedule_id;
      this.load_all_sections(this.current_schedule_id);
    }
  }

  public delete_schedule(event) {
    this.httpClient.delete(this.baseUrl + "/schedule_option/" + this.current_schedule_id,
      {
        withCredentials: true
      }).subscribe((res) => {
        window.location.reload();
        this.ref.markForCheck();
      }, (err) => {
        window.location.reload();
        this.ref.markForCheck();
      })
  }

  public duplicate_schedule(event) {
    this.httpClient.get(this.baseUrl + "/schedule_option/duplicate/" + this.current_schedule_id, {
      withCredentials: true
    }).subscribe((res) => {
      window.location.reload();
      this.ref.markForCheck();
    });
  }

  public save_schedule(event) {
    let option = this.selected_semester_schedule_options.find((opt) => {
      return this.current_schedule_id == opt.schedule_option_id;
    });
    this.save_count = 1;
    if (this.titleForUpdate.value && this.titleForUpdate.value != option.title) {
      this.save_count = 0;
      this.httpClient.put(this.baseUrl + "/schedule_option",
        {
          schedule_id: option.schedule_option_id,
          title: this.titleForUpdate.value,
          nuid: this.user.nuid,
          semester: this.selectedSemesterControl.value + '',
        },
        {
          withCredentials: true
        }).subscribe((res) => {
          if (this.save_count == option.sections.length + this.to_remove_sections) {
            window.location.reload();
          } else {
            this.save_count += 1;
          }
          this.ref.markForCheck();
        });
    }
    this.to_remove_sections.forEach((to_remove) => {
      this.httpClient.delete(this.baseUrl + "/schedule_option_section/" + this.current_schedule_id + "/" + to_remove,
        {
          withCredentials: true
        }).subscribe((res) => {
          if (this.save_count == option.sections.length + this.to_remove_sections) {
            window.location.reload();
          } else {
            this.save_count += 1;
          }
          console.log(res);
          this.ref.markForCheck();
        }, (err) => {
          if (this.save_count == option.sections.length + this.to_remove_sections) {
            window.location.reload();
          } else {
            this.save_count += 1;
          }
          console.log(err);
        })
    });
    option.sections.forEach(section => {
      this.httpClient.post(this.baseUrl + "/schedule_option_section",
        {
          schedule_id: option.schedule_option_id,
          crn: section.crn
        },
        {
          withCredentials: true
        }).subscribe((res) => {
          if (this.save_count == option.sections.length + this.to_remove_sections) {
            window.location.reload();
          } else {
            this.save_count += 1;
          }
          this.ref.markForCheck();
          console.log(res);
        }, (err) => {
          if ((err.error == "schedule options cannot have time conflicts")
            || (err.error == "schedule options can only be on the schedule's semester")) {
            this.save_count = 0;
            if (!this.all_errors.includes(err.error)) {
              this.all_errors.push(err.error);
            }
          } else {
            if (this.save_count == option.sections.length + this.to_remove_sections) {
              window.location.reload();
            } else {
              this.save_count += 1;
            }
          }
          this.ref.markForCheck();
          console.log(err);
        })
    });
  }

  add_to_current_schedule_option(sec) {
    this.schedule_options = _.map(this.schedule_options, (sch: any) => {
      if (sch.schedule_option_id == this.current_schedule_id) {
        if (!_.includes(sch.sections, sec)) {
          sch.sections.push(sec);
        }
      }
      return sch;
    });
  }

  private load_options() {
    this.httpClient.get(this.baseUrl + '/schedule_option/list_by_student/' + this.user.nuid, {
      withCredentials: true
    })
      .subscribe((res: any[]) => {
        this.schedule_options = res;
        this.refresh_selected_semester_schedule_options();
        this.load_all_sections(this.current_schedule_id);
        this.ref.markForCheck();
      });
  }

  private load_semesters() {
    this.httpClient.get(this.baseUrl + '/semester')
      .subscribe((res: any[]) => {
        this.semesters = res;
        this.selectedSemesterControl.setValue(this.semesters[0].id);
        this.refresh_selected_semester_schedule_options();
        this.load_user();
        this.ref.markForCheck();
      });
  }

}