import { FormControl } from '@angular/forms';
import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy } from '@angular/core';
import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, Subscription, Observable, Scheduler } from 'rxjs';
import { CollectionViewer } from '@angular/cdk/collections';
import * as _ from 'lodash';

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
  available_sections: any[] = [];
  ds: SectionsDataSource;
  prev_current_schedule_id = 1;
  current_schedule_id = 1;
  selected = new FormControl(0);
  to_remove_sections = [];
  save_count = 0;

  @Output() remove_section = new EventEmitter<number>();
  @Output() add_section = new EventEmitter<number>();

  constructor(private httpClient: HttpClient, private router: Router, private ref: ChangeDetectorRef) {
    this.current_schedule_id = 1;
  }

  ngOnInit() {
    this.load_semesters();
    this.selectedSemesterControl.valueChanges.subscribe((value) => {
      this.refresh_selected_semester_schedule_options();
    })
    this.ds = new SectionsDataSource();
    this.add_section.subscribe((crn) => {
      let sec = _.find(this.available_sections, (sec) => {
        return sec.crn == crn;
      });
      this.add_to_current_schedule_option(sec);
    });
    this.remove_section.subscribe((crn) => {
      this.remove_from_current_schedule_option(crn);
    });
    this.selected.valueChanges.subscribe((val) => {
      if (val != this.selected_semester_schedule_options.length) {
        val = _.filter(this.schedule_options, (opt) => {
          return opt.semester_id == this.selectedSemesterControl.value;
        })[val].schedule_option_id;
        this.current_schedule_id = val;
        this.update_current_section();
      }
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
    this.httpClient.get(this.baseUrl + '/section/filtered/' + sch_opt, {
      withCredentials: true
    })
      .subscribe((res: any) => {
        this.available_sections = res;
        this.ds = new SectionsDataSource(this.available_sections);
        this.ref.markForCheck()
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
      }, (err) => {
        window.location.reload();
      })
  }

  public duplicate_schedule(event) {
    //TODO:
  }

  public save_schedule(event) {
    let option = this.selected_semester_schedule_options.find((opt) => {
      return this.current_schedule_id == opt.schedule_option_id;
    });
    this.save_count = 1;
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
          console.log(res);
        }, (err) => {
          if (this.save_count == option.sections.length + this.to_remove_sections) {
            window.location.reload();
          } else {
            this.save_count += 1;
          }
          console.log(err);
        })
    });
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
        }, (err) => {
          if (this.save_count == option.sections.length + this.to_remove_sections) {
            window.location.reload();
          } else {
            this.save_count += 1;
          }
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
      });
  }

  private load_semesters() {
    this.httpClient.get(this.baseUrl + '/semester')
      .subscribe((res: any[]) => {
        this.semesters = res;
        this.selectedSemesterControl.setValue(this.semesters[0].id);
        this.refresh_selected_semester_schedule_options();
        this.load_user();
      });
  }

}


export class SectionsDataSource extends DataSource<string | undefined> {
  private length = 100000;
  private pageSize = 100;
  private cachedData = Array.from<string>({ length: this.length });
  private fetchedPages = new Set<number>();
  private dataStream = new BehaviorSubject<(string | undefined)[]>(this.cachedData);
  private subscription = new Subscription();

  constructor(data: any[] = []) {
    super()
    this.cachedData = data;
  }

  connect(collectionViewer: CollectionViewer): Observable<(string | undefined)[]> {
    this.subscription.add(collectionViewer.viewChange.subscribe(range => {
      const startPage = this.getPageForIndex(range.start);
      const endPage = this.getPageForIndex(range.end - 1);
      for (let i = startPage; i <= endPage; i++) {
        this.fetchPage(i);
      }
    }));
    return this.dataStream;
  }

  disconnect(): void {
    this.subscription.unsubscribe();
  }

  private getPageForIndex(index: number): number {
    return Math.floor(index / this.pageSize);
  }

  private fetchPage(page: number) {
    if (this.fetchedPages.has(page)) {
      return;
    }
    this.fetchedPages.add(page);

    // Use `setTimeout` to simulate fetching data from server.
    setTimeout(() => {
      this.cachedData.splice(page * this.pageSize, this.pageSize);
      this.dataStream.next(this.cachedData);
    }, Math.random() * 1000 + 200);
  }
}