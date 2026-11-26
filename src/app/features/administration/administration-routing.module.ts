import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminComponent } from './admin.component';

const routes: Routes = [
  { path: '', component: AdminComponent, data: { section: 'dashboard' } },
  { path: 'modulos', component: AdminComponent, data: { section: 'modules' } },
  { path: 'modulos/crear', component: AdminComponent, data: { section: 'modules' } },
  { path: 'modulos/editar/:id', component: AdminComponent, data: { section: 'modules' } },
  { path: 'temas', component: AdminComponent, data: { section: 'topics' } },
  { path: 'recursos', component: AdminComponent, data: { section: 'resources' } },
  { path: 'actividades', component: AdminComponent, data: { section: 'activities' } },
  { path: 'usuarios', component: AdminComponent, data: { section: 'users' } }
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class AdministrationRoutingModule {}
