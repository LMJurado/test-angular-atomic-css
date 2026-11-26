import { Directive, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { LearningRepository, ModuleSummary } from '../../../core/repositories/learning.repository';
import { AuthService } from '../../../services/auth.service';
import { ProgressService } from '../../../services/progress.service';
import { SoundService } from '../../../services/sound.service';

export interface ModuleCard extends ModuleSummary {
  isLocked: boolean;
}

@Directive()
export abstract class WelcomePageLogic implements OnInit {
  showLoadingOverlay = false;
  selectedModule: ModuleCard | null = null;
  modules: ModuleCard[];
  allModulesCompleted = false;
  currentPage = 1;
  readonly pageSize = 3;

  constructor(
    public auth: AuthService,
    private router: Router,
    private progress: ProgressService,
    learningRepository: LearningRepository,
    private sound: SoundService
  ) {
    this.modules = learningRepository.getModuleSummaries().map(module => ({ ...module, isLocked: false }));
  }

  get pagedModules(): ModuleCard[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.modules.slice(start, start + this.pageSize);
  }

  ngOnInit(): void {
    this.updateModuleLocks();
  }

  private updateModuleLocks(): void {
    this.modules.forEach((module, index) => {
      module.isLocked = index > 0 && !this.progress.isModuleCompleted(this.modules[index - 1].id);
    });
    this.allModulesCompleted = this.modules.every(module => this.progress.isModuleCompleted(module.id));
  }

  onModuleClick(module: ModuleCard): void {
    if (module.isLocked) {
      alert('Este módulo está bloqueado. Debes completar el módulo anterior primero.');
      return;
    }

    this.selectedModule = module;
    this.showLoadingOverlay = true;
    this.playBannerSound();
    setTimeout(() => this.router.navigate(['/modulo', module.id]), 1500);
  }

  playBannerSound(): void {
    this.sound.playBannerSound('assets/img/banner1.mp3');
  }

  downloadDiploma(): void {
    if (!this.allModulesCompleted) {
      alert('Debes completar todos los módulos para descargar el diploma.');
      return;
    }
    const link = document.createElement('a');
    link.href = 'assets/img/diploma.pdf';
    link.download = 'diploma.pdf';
    link.click();
  }
}
