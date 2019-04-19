import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, Subscription, Observable } from 'rxjs';
import { CollectionViewer } from '@angular/cdk/collections';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import * as _ from 'lodash';
import { PageEvent } from '@angular/material';

@Component({
  selector: 'app-catalog-view',
  templateUrl: './catalog-view.component.html',
  styleUrls: ['./catalog-view.component.scss']
})
export class CatalogViewComponent implements OnInit {

  baseUrl = "http://localhost:8080/pablokvitca/classdeck-api/1.0.0";
  semesterId;
  courses: any[] = [];
  filtered_courses: any[] = [];
  searchBar = new FormControl();
  loaded: boolean = false;
  currentPage: number = 0;
  title: string = "Loading...";

  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private router: Router,
    private ref: ChangeDetectorRef) {

  }

  ngOnInit() {
    this.semesterId = this.route.snapshot.paramMap.get('semester-id');
    this.httpClient.get(this.baseUrl + '/class/semester/' + this.semesterId)
      .subscribe((res: any[]) => {
        this.loaded = true;
        this.courses = res;
        this.filterClasses();
        this.ref.markForCheck()
      });
    this.httpClient.get(this.baseUrl + '/semester/' + this.semesterId)
      .subscribe((res: any) => {
        this.title = res.year + " " + res.semester + " Semester";
        this.ref.markForCheck()
      });
  }

  pageEvent(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.filterClasses();
  }

  filterClasses() {
    let pl: boolean = this.loaded;
    this.loaded = false;
    let value = this.searchBar.value || "";
    value = value.toLowerCase();
    let all_filtered = _.filter(this.courses, (course) => {
      let txt = course.class_dept
        + course.class_number
        + course.class_dept
        + " "
        + course.class_number
        + course.name;
      return txt.toLowerCase().includes(value);
    });
    let chunks = _.chunk(all_filtered, this.pageSize);
    this.filtered_courses = chunks[this.currentPage];

    if (pl) {
      this.loaded = true;
    }
  }

  get length() {
    return this.courses.length;
  }

  get pageSize() {
    return 50;
  }

}