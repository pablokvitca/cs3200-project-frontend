import { HomeComponent } from './home/home.component';
import { AppLogInComponent } from './app-log-in/app-log-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserEditComponent } from './user-edit/user-edit.component';

const routes: Routes = [
  { path: '', component: AppLogInComponent },
  { path: 'signup', component: SignUpComponent },
  { path: 'login', component: AppLogInComponent },
  { path: 'user-edit', component: UserEditComponent },
  { path: 'home', component: HomeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
