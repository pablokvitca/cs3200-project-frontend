import { FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-catalog-selection',
  templateUrl: './catalog-selection.component.html',
  styleUrls: ['./catalog-selection.component.scss']
})
export class CatalogSelectionComponent implements OnInit {

  loaded: boolean = false;
  baseUrl = "http://localhost:8080/pablokvitca/classdeck-api/1.0.0";
  selectedSemesterControl: FormControl = new FormControl();
  semesters: any[] = [];
  constructor(private httpClient: HttpClient, private router: Router) { }

  ngOnInit() {
    this.load_semesters();
    this.selectedSemesterControl.valueChanges.subscribe((value) => {
      if (value > 0) {
        this.router.navigate(["/catalog/" + value]);
      }
    })
  }

  private load_semesters() {
    this.httpClient.get(this.baseUrl + '/semester')
      .subscribe((res: any[]) => {
        this.semesters = res;
        this.semesters.splice(0, 0, { id: -1, semester: "Choose", year: "a semester..." });
        this.selectedSemesterControl.setValue(this.semesters[0].id, { emitEvent: false });
        this.loaded = true;
      });
  }
}
