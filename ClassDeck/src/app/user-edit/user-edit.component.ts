import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import * as _ from 'lodash';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss']
})
export class UserEditComponent implements OnInit {

  baseUrl = "http://localhost:8080/pablokvitca/classdeck-api/1.0.0"
  loaded = false;
  loaded_user = false;
  loaded_degrees = false;
  loaded_user_degrees = false;
  degree_options: any[] = [];
  degrees = [];
  degrees_to_remove = [];

  addDegreeControl = new FormControl();
  nuidControl = new FormControl();
  nameControl = new FormControl();
  emailControl = new FormControl();
  passControl = new FormControl();
  passrControl = new FormControl();
  filteredOptions: any;

  user: any = {};

  constructor(private httpClient: HttpClient, private router: Router) { }

  ngOnInit() {
    this.httpClient.get(this.baseUrl + '/student/loggedin', {
      withCredentials: true
    })
      .subscribe((res) => {
        console.log(res);
        this.user = res[0];
        this.nuidControl.setValue(String(this.user.nuid).padStart(9, "0"));
        this.nuidControl.disable();
        this.nameControl.setValue(this.user.name);
        this.nameControl.disable();
        this.emailControl.setValue(this.user.email);
        this.emailControl.disable();

        this.loaded_user = true;
        this.update_loaded_flag();
        this.httpClient.get(this.baseUrl + '/degree').subscribe((res: any) => {
          console.log(res);
          this.degree_options = res;
          this.loaded_degrees = true;
          this.httpClient.get(this.baseUrl + '/pursued_degree/' + this.user.nuid,
            {
              withCredentials: true
            })
            .subscribe((res: any) => {
              console.log(res);
              this.degrees = _.map(res, (element) => {
                let deg;
                this.degree_options.forEach(opt => {
                  if (opt.id == element.degree_id) {
                    deg = opt;
                  }
                });
                return deg;
              });
              this.loaded_user_degrees = true;
              this.update_loaded_flag();
            });
          this.update_loaded_flag();
        });
      });

    this.filteredOptions = this.addDegreeControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );
  }

  update_loaded_flag() {
    this.loaded = this.loaded_user && this.loaded_degrees && this.loaded_user_degrees;
  }

  displayFn(deg?: any): string | undefined {
    return deg ? deg.name : undefined;
  }

  private _filter(value: string): string[] {
    try {

      const filterValue = value.toLowerCase();

      return this.degree_options.filter(option => {
        var r = option.name.toLowerCase().includes(filterValue);
        return r;
      });
    } catch (Exception) {
      return this.degree_options;
    }
  }

  remove_nth_degree(event, n) {
    let temp = []
    for (let i = 0; i < this.degrees.length; i += 1) {
      if (i != n) {
        temp.push(this.degrees[i]);
      } else {
        this.degrees_to_remove.push(this.degrees[i]);
      }
    }
    this.degrees = temp;
  }

  add_degree(event, d) {
    for (let i = 0; i < this.degree_options.length; i += 1) {
      if (this.degree_options[i].name == d) {
        if (-1 == _.findIndex(this.degrees, this.degree_options[i])) {
          this.degrees.push(this.degree_options[i]);
        }
        break;
      }
    }
    this.addDegreeControl.setValue("");
  }

  save_changes(event) {
    this.update_password();
    this.update_degrees();
    this.router.navigateByUrl("/home");
  }

  update_degrees() {
    this.degrees.forEach(deg => {
      this.httpClient.post(this.baseUrl + "/pursued_degree",
        {
          "nuid": this.user.nuid,
          "degree_id": deg.id
        },
        {
          withCredentials: true
        })
        .subscribe(
          data => {
            console.log("POST Request is successful ", data);
          },
          error => {
            console.log("Error", error);
          })
    });
    this.degrees_to_remove.forEach(deg => {
      this.httpClient.delete(this.baseUrl + "/pursued_degree/" + this.user.nuid + "/" + deg.id,
        {
          withCredentials: true
        })
        .subscribe(
          data => {
            console.log("DELETE Request is successful ", data);
          },
          error => {
            console.log("Error", error);
          })
    });
  }

  update_password() {
    //TODO:
  }

}
