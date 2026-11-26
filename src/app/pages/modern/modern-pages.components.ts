import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AssignmentPageLogic } from './logic/assignment.page-logic';
import { EvaluationPageLogic } from './logic/evaluation.page-logic';
import { ForgotPasswordPageLogic } from './logic/forgot-password.page-logic';
import { InteractiveActivityPageLogic } from './logic/interactive-activity.page-logic';
import { LoginPageLogic } from './logic/login.page-logic';
import { ModuleDetailPageLogic } from './logic/module-detail.page-logic';
import { RegisterPageLogic } from './logic/register.page-logic';
import { ResourcePageLogic } from './logic/resource.page-logic';
import { TopicDetailPageLogic } from './logic/topic-detail.page-logic';
import { WelcomePageLogic } from './logic/welcome.page-logic';
import { AuthService } from '../../services/auth.service';
import { ProgressService } from '../../services/progress.service';
import { SoundService } from '../../services/sound.service';
import { LearningRepository } from '../../core/repositories/learning.repository';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-modern-login',
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class ModernLoginComponent extends LoginPageLogic {
  constructor(
    fb: UntypedFormBuilder,
    private modernAuth: AuthService,
    private modernRouter: Router,
    private modernSound: SoundService,
    public theme: ThemeService
  ) {
    super(fb, modernAuth, modernRouter, modernSound);
  }

  override submit(): void {
    this.modernSound.playButtonSound();
    if (this.form.invalid) return;

    this.loading = true;
    this.error = null;
    const { usernameOrEmail, password } = this.form.value;

    this.modernAuth.login(usernameOrEmail, password).subscribe({
      next: () => {
        this.loading = false;
        this.modernRouter.navigate(['/nuevo/inicio']);
      },
      error: () => {
        this.loading = false;
        this.error = 'Credenciales incorrectas';
      }
    });
  }
}

@Component({
  selector: 'app-modern-register',
  templateUrl: './register.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class ModernRegisterComponent extends RegisterPageLogic {
  constructor(
    fb: UntypedFormBuilder,
    private modernAuth: AuthService,
    private modernRouter: Router,
    private modernSound: SoundService
  ) {
    super(fb, modernAuth, modernRouter, modernSound);
  }

  override submit(): void {
    this.modernSound.playButtonSound();
    if (this.form.invalid) return;
    if (this.form.value.password !== this.form.value.password2) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    this.loading = true;
    this.error = null;
    this.modernAuth.register(this.form.value).subscribe({
      next: () => {
        this.loading = false;
        this.modernRouter.navigate(['/nuevo/login']);
      },
      error: () => {
        this.loading = false;
        this.error = 'No se pudo registrar. Intente de nuevo.';
      }
    });
  }
}

@Component({
  selector: 'app-modern-forgot-password',
  templateUrl: './forgot-password.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class ModernForgotPasswordComponent extends ForgotPasswordPageLogic {
  constructor(
    fb: UntypedFormBuilder,
    private modernAuth: AuthService,
    private modernRouter: Router,
    private modernSound: SoundService
  ) {
    super(fb, modernAuth, modernRouter, modernSound);
  }

  override submitReset(): void {
    this.modernSound.playButtonSound();
    if (this.resetForm.invalid) return;
    if (this.resetForm.value.password !== this.resetForm.value.password2) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    this.loading = true;
    this.error = null;
    const { password } = this.resetForm.value;

    this.modernAuth.updateUserPassword(this.foundUsername, password).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Contraseña actualizada exitosamente. Redirigiendo al inicio de sesión...';
        setTimeout(() => this.modernRouter.navigate(['/nuevo/login']), 1500);
      },
      error: () => {
        this.loading = false;
        this.error = 'Error al actualizar la contraseña. Intente de nuevo.';
      }
    });
  }

  override backToLogin(): void {
    this.modernSound.playButtonSound();
    this.modernRouter.navigate(['/nuevo/login']);
  }
}

@Component({
  selector: 'app-modern-welcome',
  templateUrl: './welcome.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class ModernWelcomeComponent extends WelcomePageLogic {
  constructor(
    auth: AuthService,
    private modernRouter: Router,
    progress: ProgressService,
    learningRepository: LearningRepository,
    sound: SoundService
  ) {
    super(auth, modernRouter, progress, learningRepository, sound);
  }

  override onModuleClick(module: Parameters<WelcomePageLogic['onModuleClick']>[0]): void {
    if (module.isLocked) {
      alert('Este módulo está bloqueado. Debes completar el módulo anterior primero.');
      return;
    }

    this.selectedModule = module;
    this.showLoadingOverlay = true;
    this.playBannerSound();
    setTimeout(() => this.modernRouter.navigate(['/nuevo/modulo', module.id]), 1500);
  }
}

@Component({
  selector: 'app-modern-module-detail',
  templateUrl: './module-detail.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class ModernModuleDetailComponent extends ModuleDetailPageLogic {
  constructor(
    route: ActivatedRoute,
    progress: ProgressService,
    private modernRouter: Router,
    learningRepository: LearningRepository,
    sound: SoundService
  ) {
    super(route, progress, modernRouter, learningRepository, sound);
  }

  override onTopicClick(topic: Parameters<ModuleDetailPageLogic['onTopicClick']>[0]): void {
    if (topic.isLocked) {
      alert('Este tema está bloqueado. Debes completar el tema anterior primero.');
      return;
    }

    this.modernRouter.navigate(['/nuevo/modulo', this.moduleId, 'tema', topic.id]);
  }
}

@Component({
  selector: 'app-modern-topic-detail',
  templateUrl: './topic-detail.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class ModernTopicDetailComponent extends TopicDetailPageLogic {
  constructor(
    route: ActivatedRoute,
    progress: ProgressService,
    private modernRouter: Router,
    learningRepository: LearningRepository,
    sound: SoundService
  ) {
    super(route, progress, modernRouter, learningRepository, sound);
  }

  override onActivityClick(activity: Parameters<TopicDetailPageLogic['onActivityClick']>[0]): void {
    if (activity.isLocked) {
      alert('Esta actividad está bloqueada. Debes completar la actividad anterior primero.');
      return;
    }

    if (activity.type === 'evaluation') {
      this.openEvaluationModal();
      return;
    }

    const path = activity.type === 'interactive' ? 'actividad-interactiva' : 'actividad';
    this.modernRouter.navigate([
      '/nuevo/modulo',
      this.moduleId,
      'tema',
      this.topicId,
      path
    ]);
  }

  override acceptEvaluation(): void {
    this.showEvaluationModal = false;
    this.modernRouter.navigate([
      '/nuevo/modulo',
      this.moduleId,
      'tema',
      this.topicId,
      'evaluacion'
    ]);
  }
}

@Component({
  selector: 'app-modern-resource',
  templateUrl: './resource.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class ModernResourceComponent extends ResourcePageLogic {
  constructor(route: ActivatedRoute) {
    super(route);
  }
}

@Component({
  selector: 'app-modern-interactive-activity',
  templateUrl: './interactive-activity.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class ModernInteractiveActivityComponent extends InteractiveActivityPageLogic {
  constructor(
    route: ActivatedRoute,
    sanitizer: DomSanitizer,
    private modernProgress: ProgressService,
    private modernRouter: Router
  ) {
    super(route, sanitizer, modernProgress, modernRouter);
  }

  override completeActivity(): void {
    this.modernProgress.completeActivity(this.moduleId, this.topicId, 'interactive');
    this.showCompleteMessage = true;
    setTimeout(() => {
      this.modernRouter.navigate([
        '/nuevo/modulo',
        this.moduleId,
        'tema',
        this.topicId
      ]);
    }, 2000);
  }
}

@Component({
  selector: 'app-modern-assignment',
  templateUrl: './assignment.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class ModernAssignmentComponent extends AssignmentPageLogic {
  constructor(
    route: ActivatedRoute,
    private modernProgress: ProgressService,
    private modernRouter: Router
  ) {
    super(route, modernProgress, modernRouter);
  }

  override completeAssignment(): void {
    const modId = Number(this.moduleId);
    const topicId = Number(this.topicId);

    this.modernProgress.completeActivity(modId, topicId, 'assignment');
    this.showCompleteMessage = true;
    setTimeout(() => {
      this.modernRouter.navigate(['/nuevo/modulo', modId, 'tema', topicId]);
    }, 2000);
  }
}

@Component({
  selector: 'app-modern-evaluation',
  templateUrl: './evaluation.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class ModernEvaluationComponent extends EvaluationPageLogic {
  constructor(route: ActivatedRoute, progress: ProgressService) {
    super(route, progress);
  }
}
