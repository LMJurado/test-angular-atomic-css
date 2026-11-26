import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StudentGuard } from '../../core/guards/student.guard';
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
  { path: 'inicio', component: ModernWelcomeComponent, canActivate: [StudentGuard] },
  { path: 'modulo/:id', component: ModernModuleDetailComponent, canActivate: [StudentGuard] },
  { path: 'modulo/:modId/tema/:topicId', component: ModernTopicDetailComponent, canActivate: [StudentGuard] },
  { path: 'modulo/:modId/recursos', component: ModernResourceComponent, canActivate: [StudentGuard] },
  { path: 'modulo/:modId/tema/:topicId/actividad-interactiva', component: ModernInteractiveActivityComponent, canActivate: [StudentGuard] },
  { path: 'modulo/:modId/tema/:topicId/actividad', component: ModernAssignmentComponent, canActivate: [StudentGuard] },
  { path: 'modulo/:modId/tema/:topicId/evaluacion', component: ModernEvaluationComponent, canActivate: [StudentGuard] }
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class LearningRoutingModule {}
