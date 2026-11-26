import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ModernLayoutComponent } from './pages/modern/modern-layout.component';
import { ModernSplashComponent } from './features/splash/splash.component';
import { AdminGuard } from './core/guards/admin.guard';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'nuevo' },
  { path: 'login', pathMatch: 'full', redirectTo: 'nuevo/login' },
  { path: 'registro', pathMatch: 'full', redirectTo: 'nuevo/registro' },
  { path: 'olvido-contrasena', pathMatch: 'full', redirectTo: 'nuevo/olvido-contrasena' },
  { path: 'inicio', pathMatch: 'full', redirectTo: 'nuevo/inicio' },
  { path: 'modulo/:id', pathMatch: 'full', redirectTo: 'nuevo/modulo/:id' },
  { path: 'modulo/:modId/tema/:topicId', pathMatch: 'full', redirectTo: 'nuevo/modulo/:modId/tema/:topicId' },
  { path: 'modulo/:modId/tema/:topicId/actividad-interactiva', pathMatch: 'full', redirectTo: 'nuevo/modulo/:modId/tema/:topicId/actividad-interactiva' },
  { path: 'modulo/:modId/tema/:topicId/actividad', pathMatch: 'full', redirectTo: 'nuevo/modulo/:modId/tema/:topicId/actividad' },
  { path: 'modulo/:modId/recursos', pathMatch: 'full', redirectTo: 'nuevo/modulo/:modId/recursos' },
  { path: 'modulo/:modId/tema/:topicId/evaluacion', pathMatch: 'full', redirectTo: 'nuevo/modulo/:modId/tema/:topicId/evaluacion' },
  {
    path: 'nuevo',
    component: ModernLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', component: ModernSplashComponent },
      { path: '', loadChildren: () => import('./features/auth/auth.module').then(module => module.AuthModule) },
      { path: 'admin', canActivate: [AdminGuard], loadChildren: () => import('./features/administration/administration.module').then(module => module.AdministrationModule) },
      { path: '', loadChildren: () => import('./features/learning/learning.module').then(module => module.LearningModule) }
    ]
  },
  { path: '**', redirectTo: 'nuevo' }
];

@NgModule({ imports: [RouterModule.forRoot(routes)], exports: [RouterModule] })
export class AppRoutingModule {}
