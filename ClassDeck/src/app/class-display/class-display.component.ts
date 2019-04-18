import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-class-display',
  templateUrl: './class-display.component.html',
  styleUrls: ['./class-display.component.scss']
})
export class ClassDisplayComponent implements OnInit {

  @Input() course;

  constructor(private httpClient: HttpClient) { }

  ngOnInit() {
  }

}
