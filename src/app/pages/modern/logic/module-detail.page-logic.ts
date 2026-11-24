import {
  Directive,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgressService } from '../../../services/progress.service';

interface Topic {
  id: number;
  title: string;
  description: string;
  image?: string;
  isLocked: boolean;
  isCompleted: boolean;
}

interface ModuleConfig {
  id: number;
  name: string;
  breadcrumb: string;
  topics: Topic[];
  isCompleted: boolean;
}

const MODULES_CONFIG: Record<number, ModuleConfig> = {
  1: {
    id: 1,
    name: 'Desarrollo Web',
    breadcrumb: 'Desarrollo Web',
    isCompleted: false,
    topics: [
      {
        id: 1,
        title: 'Fundamentos de HTML y CSS',
        description: 'Estructura básica de la web, etiquetas principales y estilos con CSS.',
        image: 'assets/img/tema1.png',
        isLocked: false,
        isCompleted: false
      },
      {
        id: 2,
        title: 'Programación con JavaScript',
        description: 'Variables, funciones, DOM, eventos y buenas prácticas en JavaScript moderno.',
        image: 'assets/img/tema2.png',
        isLocked: true,
        isCompleted: false
      },
      {
        id: 3,
        title: 'Angular Básico',
        description: 'Componentes, módulos, data binding y servicios en aplicaciones SPA con Angular.',
        image: 'assets/img/tema3.png',
        isLocked: true,
        isCompleted: false
      }
    ]
  },
  2: {
    id: 2,
    name: 'Desarrollo Móvil',
    breadcrumb: 'Desarrollo Móvil',
    isCompleted: false,
    topics: [
      {
        id: 1,
        title: 'Introducción al Desarrollo de Apps',
        description: 'Tipos de apps, UX/UI móvil, navegación y patrones básicos de arquitectura.',
        image: 'assets/img/tema21.png',
        isLocked: false,
        isCompleted: false
      },
      {
        id: 2,
        title: 'Fundamentos de Flutter',
        description: 'Widgets, maquetación responsiva, navegación y manejo de estado en Flutter.',
        image: 'assets/img/tema22.png',
        isLocked: true,
        isCompleted: false
      },
      {
        id: 3,
        title: 'React Native Básico',
        description: 'Componentes, hooks y navegación para construir apps nativas con JavaScript.',
        image: 'assets/img/tema23.png',
        isLocked: true,
        isCompleted: false
      }
    ]
  },
  3: {
    id: 3,
    name: 'DevOps y Automatización',
    breadcrumb: 'DevOps y Automatización',
    isCompleted: false,
    topics: [
      {
        id: 1,
        title: 'Docker y Contenedores',
        description: 'Imágenes, contenedores y flujos de trabajo para entornos reproducibles.',
        image: 'assets/img/tema31.png',
        isLocked: false,
        isCompleted: false
      },
      {
        id: 2,
        title: 'Integración Continua (CI/CD)',
        description: 'Pipelines de build, test y despliegue automático con herramientas modernas.',
        image: 'assets/img/tema32.png',
        isLocked: true,
        isCompleted: false
      },
      {
        id: 3,
        title: 'Kubernetes Básico',
        description: 'Conceptos base para orquestar contenedores: pods, deployments y servicios.',
        image: 'assets/img/tema33.png',
        isLocked: true,
        isCompleted: false
      }
    ]
  }
};

@Directive()
export abstract class ModuleDetailPageLogic implements OnInit {

  moduleId!: number;
  moduleConfig!: ModuleConfig;

  constructor(
    private route: ActivatedRoute,
    private progress: ProgressService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    this.moduleId = MODULES_CONFIG[id] ? id : 1;
    this.moduleConfig = { ...MODULES_CONFIG[this.moduleId] };
    
    // Actualizar estado de bloqueo de temas
    this.updateTopicLocks();
  }

  private updateTopicLocks(): void {
    let firstIncompleteTopic = true;

    for (let topic of this.moduleConfig.topics) {
      topic.isCompleted = this.progress.isTopicCompleted(this.moduleId, topic.id);
      
      // Tema 1 siempre desbloqueado
      if (topic.id === 1) {
        topic.isLocked = false;
      } else {
        // Otros temas se desbloquean si el anterior está completado
        topic.isLocked = !this.progress.isTopicCompleted(this.moduleId, topic.id - 1);
      }
    }

    // Verificar si el módulo está completado
    this.moduleConfig.isCompleted = this.moduleConfig.topics.every(t => t.isCompleted);
  }

  onTopicClick(topic: Topic): void {
    if (topic.isLocked) {
      alert(`Este tema está bloqueado. Debes completar el tema anterior primero.`);
      return;
    }

    this.router.navigate(['/modulo', this.moduleId, 'tema', topic.id]);
  }

  playBannerSound(): void {
    const audio = new Audio('assets/img/banner2f.mp3');
    audio.volume = 0.5;
    audio.play().catch(error => {
      console.warn('No se pudo reproducir el sonido:', error);
    });
  }
}
