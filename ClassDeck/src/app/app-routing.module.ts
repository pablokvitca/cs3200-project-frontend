import { CatalogSelectionComponent } from './catalog-selection/catalog-selection.component';
import { HomeComponent } from './home/home.component';
import { AppLogInComponent } from './app-log-in/app-log-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserEditComponent } from './user-edit/user-edit.component';
import { CatalogViewComponent } from './catalog-view/catalog-view.component';
import { LogOutComponentComponent } from './log-out-component/log-out-component.component';

const routes: Routes = [
  { path: '', component: AppLogInComponent },
  { path: 'signup', component: SignUpComponent },
  { path: 'login', component: AppLogInComponent },
  { path: 'logout', component: LogOutComponentComponent },
  { path: 'user-edit', component: UserEditComponent },
  { path: 'home', component: HomeComponent },
  { path: 'catalog', component: CatalogSelectionComponent },
  { path: 'catalog/:semester-id', component: CatalogViewComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
