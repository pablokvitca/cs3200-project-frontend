import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-log-out-component',
  templateUrl: './log-out-component.component.html',
  styleUrls: ['./log-out-component.component.scss']
})
export class LogOutComponentComponent implements OnInit {

  baseUrl = "http://localhost:8080/pablokvitca/classdeck-api/1.0.0";

  constructor(private httpClient: HttpClient, private router: Router) { }

  ngOnInit() {
    this.httpClient.get(this.baseUrl + "/student/logout", {
      withCredentials: true
    }).subscribe((res) => {
      this.router.navigate(["/login"]);
    });
  }

}
