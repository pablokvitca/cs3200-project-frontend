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
  loaded_courses = false;
  loaded_user_courses = false;

  degree_options: any[] = [];
  degrees = [];
  degrees_to_remove = [];

  course_options: any[] = [];
  courses = [];
  courses_to_remove = [];

  addDegreeControl = new FormControl();

  addCourseControl = new FormControl();

  nuidControl = new FormControl();
  nameControl = new FormControl();
  emailControl = new FormControl();
  passControl = new FormControl();
  passrControl = new FormControl();

  filteredOptions: any;

  filteredCourses: any;

  user: any = {};

  totalUpdateCount: number = 0;
  updatedCount: number = 0;

  all_errors: string[] = [];

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

        this.httpClient.get(this.baseUrl + '/student_taken_classes/' + this.user.nuid,
          {
            withCredentials: true
          })
          .subscribe((res: any) => {
            console.log(res);
            this.courses = res;
            this.loaded_user_courses = true;
            this.update_loaded_flag();
          });
      });

    this.httpClient.get(this.baseUrl + '/degree').subscribe((res: any) => {
      console.log(res);
      this.degree_options = res;
      this.loaded_degrees = true;

      this.update_loaded_flag();
    });

    this.httpClient.get(this.baseUrl + '/class').subscribe((res: any) => {
      console.log(res);
      this.course_options = res;
      this.loaded_courses = true;
      this.update_loaded_flag();
    });

    this.filteredOptions = this.addDegreeControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value, this.degree_options))
      );

    this.filteredCourses = this.addCourseControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value, this.course_options))
      );


  }

  update_loaded_flag() {
    this.loaded = true
      && this.loaded_user
      && this.loaded_user_degrees
      && this.loaded_user_courses;
  }

  displayFnCourse(crs?: any): string | undefined {
    return crs ? crs.class_dept + " " + crs.class_number + "(" + crs.name + ")" : undefined;
  }

  displayFn(deg?: any): string | undefined {
    return deg ? deg.name : undefined;
  }

  private _filter(value: string, pool): string[] {
    try {

      const filterValue = value.toLowerCase();

      return pool.filter(option => {
        var r = option.class_dept + " " + option.class_number + " " + option.name;
        return r.toLowerCase().includes(filterValue);
      });
    } catch (Exception) {
      return pool;
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

  remove_nth_course(event, n) {
    let temp = []
    for (let i = 0; i < this.courses.length; i += 1) {
      if (i != n) {
        temp.push(this.courses[i]);
      } else {
        this.courses_to_remove.push(this.courses[i]);
      }
    }
    this.courses = temp;
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

  add_course(event, d) {
    for (let i = 0; i < this.course_options.length; i += 1) {
      let cur = this.course_options[i].class_dept
        + " "
        + this.course_options[i].class_number
        + "("
        + this.course_options[i].name
        + ")";
      if (cur == d) {
        if (-1 == _.findIndex(this.courses, (c) => {
          return c.class_dept == this.course_options[i].class_dept
            && c.class_number == this.course_options[i].class_number;
        })) {
          this.courses.push(this.course_options[i]);
        }
        break;
      }
    }
    this.addCourseControl.setValue("");
  }

  save_changes(event) {
    this.updatedCount = 0;
    this.totalUpdateCount = 0;
    this.totalUpdateCount += this.degrees.length;
    this.totalUpdateCount += this.degrees_to_remove.length;
    this.totalUpdateCount += this.courses.length;
    this.totalUpdateCount += this.courses_to_remove.length;
    if (this.shouldUpdatePassword()) {
      this.totalUpdateCount += 1;
    }
    this.update_password();
    this.update_degrees();
    this.update_courses();
  }

  shouldUpdatePassword() {
    return this.passControl.value && this.passrControl.value
      && this.passControl.value == this.passrControl.value;
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
            this.done_with_update_reload();
          },
          error => {
            console.log("Error", error);
            this.done_with_update_reload();
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
            this.done_with_update_reload();
          },
          error => {
            console.log("Error", error);
            this.done_with_update_reload();
          })
    });
  }

  update_courses() {
    this.courses.forEach(course => {
      this.httpClient.post(this.baseUrl + "/student_taken_classes",
        {
          nuid: this.user.nuid,
          class_dept: course.class_dept,
          class_number: course.class_number
        },
        {
          withCredentials: true
        })
        .subscribe(
          data => {
            console.log("POST Request is successful ", data);
            this.done_with_update_reload();
          },
          error => {
            console.log("Error", error);
            this.done_with_update_reload();
          })
    });
    this.courses_to_remove.forEach(course => {
      this.httpClient.delete(
        this.baseUrl
        + "/student_taken_classes/"
        + this.user.nuid
        + "/" + course.class_dept
        + "/" + course.class_number,
        {
          withCredentials: true
        })
        .subscribe(
          data => {
            console.log("DELETE Request is successful ", data);
            this.done_with_update_reload();
          },
          error => {
            console.log("Error", error);
            this.done_with_update_reload();
          })
    });
  }

  update_password() {
    if (this.shouldUpdatePassword()) {
      this.httpClient.put(this.baseUrl + "/student", {
        nuid: this.user.nuid,
        name: this.user.name,
        email: this.user.email,
        password: this.passControl.value
      },
        {
          withCredentials: true
        })
        .subscribe(
          data => {
            console.log("POST Request is successful ", data);
            this.done_with_update_reload();
          },
          error => {
            console.log("Error", error);

            if (!this.all_errors.includes("Error updating password.")) {
              this.all_errors.push("Error updating password.");
            }
          });
    } else {
      if (!this.all_errors.includes("Please enter a matching pair of passwords.")) {
        this.all_errors.push("Please enter a matching pair of passwords.");
      }
    }
  }

  done_with_update_reload() {
    this.updatedCount += 1;
    if (this.updatedCount >= this.totalUpdateCount) {
      window.location.reload();
    }
  }

}
