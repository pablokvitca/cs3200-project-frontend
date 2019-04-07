import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';


@Component({
  selector: 'app-app-log-in',
  templateUrl: './app-log-in.component.html',
  styleUrls: ['./app-log-in.component.scss']
})
export class AppLogInComponent implements OnInit {

  baseUrl = "http://localhost:8080/pablokvitca/classdeck-api/1.0.0"

  constructor(private httpClient: HttpClient, private router: Router) { }

  ngOnInit() {
  }

  public login(event, nuid: String, pass: String) {
    if (nuid.length > 7 && pass.length > 0) {
      this.httpClient.get(this.baseUrl + '/student/login?nuid=' + nuid + "&password=" + pass,
        {
          responseType: "text"
        })
        .subscribe((res) => {
          console.log(res);
          this.router.navigateByUrl('/home');
        });
    }
  }

}
