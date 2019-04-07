import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {

  baseUrl = "http://localhost:8080/pablokvitca/classdeck-api/1.0.0"

  constructor(private httpClient: HttpClient, private router: Router) { }

  ngOnInit() {
  }

  public signup(event, nuid: String, name: String, email: String, pass: String, passr: String) {
    if (nuid.length == 9
      && name.length > 0
      && email.length > 5
      && pass.length > 8
      && pass == passr) {
      this.httpClient.post(this.baseUrl + "/student",
        {
          "nuid": Number(nuid),
          "email": email,
          "name": name,
          "password": pass
        })
        .subscribe(
          data => {
            console.log("POST Request is successful ", data);
            this.router.navigateByUrl('/login');
          },
          error => {
            console.log("Error", error);
          })
    } else {
      //TODO: SHOW ERRORS
    }
  }

}
