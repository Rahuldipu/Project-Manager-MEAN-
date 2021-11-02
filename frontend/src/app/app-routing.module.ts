import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditListComponent } from './pages/edit-list/edit-list.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { NewListComponent } from './pages/new-list/new-list.component';
import { NewProjectComponent } from './pages/new-project/new-project.component';
import { SignupPageComponent } from './pages/signup-page/signup-page.component';
import { TaskViewComponent } from './pages/task-view/task-view.component';

const routes: Routes = [
  { path: '', redirectTo: 'lists', pathMatch: "full"},
  { path: 'new-list', component: NewListComponent},
  { path: 'edit-list/:listId', component: EditListComponent},
  { path: 'login', component: LoginPageComponent},
  { path: 'signup', component: SignupPageComponent},
  { path: 'lists', component: TaskViewComponent},
  { path: 'lists/:listId', component: TaskViewComponent},
  { path: 'lists/:listId/new-project', component: NewProjectComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
