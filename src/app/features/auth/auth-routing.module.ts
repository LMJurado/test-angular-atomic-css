import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
  ModernForgotPasswordComponent,
  ModernLoginComponent,
  ModernRegisterComponent
} from '../../pages/modern/modern-pages.components';

const routes: Routes = [
  { path: 'login', component: ModernLoginComponent },
  { path: 'registro', component: ModernRegisterComponent },
  { path: 'olvido-contrasena', component: ModernForgotPasswordComponent }
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class AuthRoutingModule {}
