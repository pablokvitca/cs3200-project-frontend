import { FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy } from '@angular/core';
import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, Subscription, Observable } from 'rxjs';
import { CollectionViewer } from '@angular/cdk/collections';

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

  constructor(private httpClient: HttpClient, private router: Router) { }

  ngOnInit() {
    this.load_semesters();
    this.selectedSemesterControl.valueChanges.subscribe((value) => {
      this.refresh_selected_semester_schedule_options();
    })
    this.ds = new SectionsDataSource();
  }

  private load_all_sections() {
    //TODO: current schedule
    this.httpClient.get(this.baseUrl + '/section/filtered/' + "1", {
      withCredentials: true
    })
      .subscribe((res: any) => {
        this.available_sections = res;
        this.ds = new SectionsDataSource(this.available_sections);
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
    //TODO:
  }

  private load_options() {
    this.httpClient.get(this.baseUrl + '/schedule_option/list_by_student/' + this.user.nuid, {
      withCredentials: true
    })
      .subscribe((res: any[]) => {
        this.schedule_options = res;
        this.refresh_selected_semester_schedule_options();
        this.load_all_sections();
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