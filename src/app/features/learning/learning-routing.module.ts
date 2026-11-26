import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ModernAuthGuard } from '../../pages/modern/modern-auth.guard';
import {
  ModernAssignmentComponent,
  ModernEvaluationComponent,
  ModernInteractiveActivityComponent,
  ModernModuleDetailComponent,
  ModernResourceComponent,
  ModernTopicDetailComponent,
  ModernWelcomeComponent
} from '../../pages/modern/modern-pages.components';

const routes: Routes = [
  { path: 'inicio', component: ModernWelcomeComponent, canActivate: [ModernAuthGuard] },
  { path: 'modulo/:id', component: ModernModuleDetailComponent, canActivate: [ModernAuthGuard] },
  { path: 'modulo/:modId/tema/:topicId', component: ModernTopicDetailComponent, canActivate: [ModernAuthGuard] },
  { path: 'modulo/:modId/recursos', component: ModernResourceComponent, canActivate: [ModernAuthGuard] },
  { path: 'modulo/:modId/tema/:topicId/actividad-interactiva', component: ModernInteractiveActivityComponent, canActivate: [ModernAuthGuard] },
  { path: 'modulo/:modId/tema/:topicId/actividad', component: ModernAssignmentComponent, canActivate: [ModernAuthGuard] },
  { path: 'modulo/:modId/tema/:topicId/evaluacion', component: ModernEvaluationComponent, canActivate: [ModernAuthGuard] }
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class LearningRoutingModule {}
