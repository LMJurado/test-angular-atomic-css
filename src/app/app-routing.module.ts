import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ModernAuthGuard } from './pages/modern/modern-auth.guard';
import { ModernLayoutComponent } from './pages/modern/modern-layout.component';
import {
  ModernAssignmentComponent,
  ModernEvaluationComponent,
  ModernForgotPasswordComponent,
  ModernInteractiveActivityComponent,
  ModernLoginComponent,
  ModernModuleDetailComponent,
  ModernRegisterComponent,
  ModernResourceComponent,
  ModernSplashComponent,
  ModernTopicDetailComponent,
  ModernWelcomeComponent
} from './pages/modern/modern-pages.components';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'nuevo' },
  { path: 'login', pathMatch: 'full', redirectTo: 'nuevo/login' },
  { path: 'registro', pathMatch: 'full', redirectTo: 'nuevo/registro' },
  { path: 'olvido-contrasena', pathMatch: 'full', redirectTo: 'nuevo/olvido-contrasena' },
  { path: 'inicio', pathMatch: 'full', redirectTo: 'nuevo/inicio' },
  { path: 'modulo/:id', pathMatch: 'full', redirectTo: 'nuevo/modulo/:id' },
  { path: 'modulo/:modId/tema/:topicId', pathMatch: 'full', redirectTo: 'nuevo/modulo/:modId/tema/:topicId' },
  {
    path: 'modulo/:modId/tema/:topicId/actividad-interactiva',
    pathMatch: 'full',
    redirectTo: 'nuevo/modulo/:modId/tema/:topicId/actividad-interactiva'
  },
  {
    path: 'modulo/:modId/tema/:topicId/actividad',
    pathMatch: 'full',
    redirectTo: 'nuevo/modulo/:modId/tema/:topicId/actividad'
  },
  {
    path: 'modulo/:modId/recursos',
    pathMatch: 'full',
    redirectTo: 'nuevo/modulo/:modId/recursos'
  },
  {
    path: 'modulo/:modId/tema/:topicId/evaluacion',
    pathMatch: 'full',
    redirectTo: 'nuevo/modulo/:modId/tema/:topicId/evaluacion'
  },
  {
    path: 'nuevo',
    component: ModernLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', component: ModernSplashComponent },
      { path: 'login', component: ModernLoginComponent },
      { path: 'registro', component: ModernRegisterComponent },
      { path: 'olvido-contrasena', component: ModernForgotPasswordComponent },
      { path: 'inicio', component: ModernWelcomeComponent, canActivate: [ModernAuthGuard] },
      { path: 'modulo/:id', component: ModernModuleDetailComponent, canActivate: [ModernAuthGuard] },
      {
        path: 'modulo/:modId/tema/:topicId',
        component: ModernTopicDetailComponent,
        canActivate: [ModernAuthGuard]
      },
      {
        path: 'modulo/:modId/tema/:topicId/actividad-interactiva',
        component: ModernInteractiveActivityComponent,
        canActivate: [ModernAuthGuard]
      },
      {
        path: 'modulo/:modId/tema/:topicId/actividad',
        component: ModernAssignmentComponent,
        canActivate: [ModernAuthGuard]
      },
      {
        path: 'modulo/:modId/recursos',
        component: ModernResourceComponent,
        canActivate: [ModernAuthGuard]
      },
      {
        path: 'modulo/:modId/tema/:topicId/evaluacion',
        component: ModernEvaluationComponent,
        canActivate: [ModernAuthGuard]
      },
      { path: '**', redirectTo: '' }
    ]
  },
  { path: '**', redirectTo: 'nuevo' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
