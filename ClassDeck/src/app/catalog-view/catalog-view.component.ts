import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, Subscription, Observable } from 'rxjs';
import { CollectionViewer } from '@angular/cdk/collections';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import * as _ from 'lodash';

@Component({
  selector: 'app-catalog-view',
  templateUrl: './catalog-view.component.html',
  styleUrls: ['./catalog-view.component.scss']
})
export class CatalogViewComponent implements OnInit {

  baseUrl = "http://localhost:8080/pablokvitca/classdeck-api/1.0.0";
  semesterId;
  courses: any[];
  filtered_courses: any[];
  searchBar = new FormControl();
  loaded: boolean = false;

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
        this.filtered_courses = this.courses;
        this.ref.markForCheck()
      });
  }

  filterClasses() {
    let pl: boolean = this.loaded;
    this.loaded = false;
    let value = this.searchBar.value;
    value = value.toLowerCase()
    this.filtered_courses = _.filter(this.courses, (course) => {
      let txt = course.class_dept
        + course.class_number
        + course.class_dept
        + " "
        + course.class_number
        + course.name;
      return txt.toLowerCase().includes(value);
    });
    if (pl) {
      this.loaded = true;
    }
  }

}