import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { Button } from './css/atoms/button/button';
import { Badge } from './css/atoms/badge/badge';
import { AuthService } from './services/auth.service';
import { ProgressService } from './services/progress.service';
import { SoundService } from './services/sound.service';
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

@NgModule({
  declarations: [
    AppComponent,
    ModernLayoutComponent,
    ModernSplashComponent,
    ModernLoginComponent,
    ModernRegisterComponent,
    ModernForgotPasswordComponent,
    ModernWelcomeComponent,
    ModernModuleDetailComponent,
    ModernTopicDetailComponent,
    ModernResourceComponent,
    ModernInteractiveActivityComponent,
    ModernAssignmentComponent,
    ModernEvaluationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    Button,
    Badge
  ],
  providers: [
    AuthService,
    SoundService,
    ProgressService,
    provideHttpClient(withXhr(), withInterceptorsFromDi())
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
