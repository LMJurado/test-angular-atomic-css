import { Directive, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../services/auth.service';
import { ProgressService } from '../../../services/progress.service';

interface Module {
  id: number;
  title: string;
  image: string;
  isLocked: boolean;
}

@Directive()
export abstract class WelcomePageLogic implements OnInit {
  showLoadingOverlay = false;
  selectedModule: Module | null = null;

  modules: Module[] = [
    { id: 1, title: 'Desarrollo Web', image: 'assets/img/b3.png', isLocked: false },
    { id: 2, title: 'Desarrollo Móvil', image: 'assets/img/b1.png', isLocked: true },
    { id: 3, title: 'DevOps y Automatización', image: 'assets/img/b2.png', isLocked: true }
  ];

  allModulesCompleted = false;

  constructor(
    public auth: AuthService,
    private router: Router,
    private progress: ProgressService
  ) {}

  ngOnInit(): void {
    this.updateModuleLocks();
  }

  private updateModuleLocks(): void {
    // Módulo 1 siempre desbloqueado
    this.modules[0].isLocked = false;

    // Módulo 2 se desbloquea si el módulo 1 está completado
    this.modules[1].isLocked = !this.progress.isModuleCompleted(1);

    // Módulo 3 se desbloquea si el módulo 2 está completado
    this.modules[2].isLocked = !this.progress.isModuleCompleted(2);

    // Verificar si todos los módulos están completados
    this.allModulesCompleted = this.modules.every(m => this.progress.isModuleCompleted(m.id));
  }

  onModuleClick(module: Module): void {
    if (module.isLocked) {
      alert(`Este módulo está bloqueado. Debes completar el módulo anterior primero.`);
      return;
    }

    this.selectedModule = module;
    this.showLoadingOverlay = true;
    this.playBannerSound();

    // Después de 1.5 segundos, navega al módulo
    setTimeout(() => {
      this.router.navigate(['/modulo', module.id]);
    }, 1500);
  }

  playBannerSound(): void {
    const audio = new Audio('assets/img/banner1.mp3');
    audio.volume = 0.5;
    audio.play().catch(error => {
      console.warn('No se pudo reproducir el sonido:', error);
    });
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
