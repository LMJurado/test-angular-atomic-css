import { NgModule } from '@angular/core';

import {
  ModernAssignmentComponent,
  ModernEvaluationComponent,
  ModernInteractiveActivityComponent,
  ModernModuleDetailComponent,
  ModernResourceComponent,
  ModernTopicDetailComponent,
  ModernWelcomeComponent
} from '../../pages/modern/modern-pages.components';
import { SharedModule } from '../../shared/shared.module';
import { LearningRoutingModule } from './learning-routing.module';

@NgModule({
  declarations: [
    ModernWelcomeComponent,
    ModernModuleDetailComponent,
    ModernTopicDetailComponent,
    ModernResourceComponent,
    ModernInteractiveActivityComponent,
    ModernAssignmentComponent,
    ModernEvaluationComponent
  ],
  imports: [SharedModule, LearningRoutingModule]
})
export class LearningModule {}
