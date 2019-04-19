import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppLogInComponent } from './app-log-in/app-log-in.component';

import { MatButtonModule, MatCheckboxModule, MatInputModule, MatCardModule, MatIconModule, MatAutocompleteModule, MatTabsModule, MatSelectModule, MatToolbarModule, MatExpansionModule, MatPaginatorModule } from '@angular/material';
import { SignUpComponent } from './sign-up/sign-up.component';
import { HomeComponent } from './home/home.component';
import { UserEditComponent } from './user-edit/user-edit.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ScheduleOptionDisplayComponent } from './schedule-option-display/schedule-option-display.component';
import { SectionDisplayComponent } from './section-display/section-display.component';
import { MeetingDaysDisplayComponent } from './meeting-days-display/meeting-days-display.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { LoadingComponent } from './loading/loading.component';
import { TopNavComponent } from './top-nav/top-nav.component';
import { CatalogViewComponent } from './catalog-view/catalog-view.component';
import { ClassDisplayComponent } from './class-display/class-display.component';
import { CatalogSelectionComponent } from './catalog-selection/catalog-selection.component';
import { DisplayPrerequisitesComponent } from './display-prerequisites/display-prerequisites.component';
import { LogOutComponentComponent } from './log-out-component/log-out-component.component';

@NgModule({
  declarations: [
    AppComponent,
    AppLogInComponent,
    SignUpComponent,
    HomeComponent,
    UserEditComponent,
    ScheduleOptionDisplayComponent,
    SectionDisplayComponent,
    MeetingDaysDisplayComponent,
    LoadingComponent,
    TopNavComponent,
    CatalogViewComponent,
    ClassDisplayComponent,
    CatalogSelectionComponent,
    DisplayPrerequisitesComponent,
    LogOutComponentComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatInputModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    MatToolbarModule,
    MatPaginatorModule,
    MatExpansionModule,
    MatAutocompleteModule,
    ScrollingModule,
    MatSelectModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
