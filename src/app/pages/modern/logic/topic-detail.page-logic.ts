import {
  Directive,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgressService } from '../../../services/progress.service';

interface Activity {
  type: 'interactive' | 'assignment' | 'evaluation';
  title: string;
  description: string;
  image: string;
  isLocked: boolean;
  isCompleted: boolean;
}

interface Topic {
  id: number;
  title: string;
  description: string;
  image?: string;
}

interface ModuleConfig {
  id: number;
  name: string;
  breadcrumb: string;
  topics: Topic[];
}

const MODULES_CONFIG: Record<number, ModuleConfig> = {
  1: {
    id: 1,
    name: 'Desarrollo Web',
    breadcrumb: 'Desarrollo Web',
    topics: [
      {
        id: 1,
        title: 'Fundamentos de HTML y CSS',
        description: 'Estructura básica de la web, etiquetas principales, CSS, Flexbox y Grid.',
        image: 'assets/img/tema1.png'
      },
      {
        id: 2,
        title: 'Programación con JavaScript',
        description: 'Variables, funciones, DOM, eventos y buenas prácticas en JavaScript moderno.',
        image: 'assets/img/tema2.png'
      },
      {
        id: 3,
        title: 'Angular Básico',
        description: 'Componentes, módulos, data binding y servicios en aplicaciones SPA con Angular.',
        image: 'assets/img/tema3.png'
      }
    ]
  },
  2: {
    id: 2,
    name: 'Desarrollo Móvil',
    breadcrumb: 'Desarrollo Móvil',
    topics: [
      {
        id: 1,
        title: 'Introducción al Desarrollo de Apps',
        description: 'Tipos de apps, UX/UI móvil, navegación y patrones básicos de arquitectura.',
        image: 'assets/img/tema21.png'
      },
      {
        id: 2,
        title: 'Fundamentos de Flutter',
        description: 'Widgets, maquetación responsiva, navegación y manejo de estado en Flutter.',
        image: 'assets/img/tema22.png'
      },
      {
        id: 3,
        title: 'React Native Básico',
        description: 'Componentes, hooks y navegación para construir apps nativas con JavaScript.',
        image: 'assets/img/tema23.png'
      }
    ]
  },
  3: {
    id: 3,
    name: 'DevOps y Automatización',
    breadcrumb: 'DevOps y Automatización',
    topics: [
      {
        id: 1,
        title: 'Docker y Contenedores',
        description: 'Imágenes, contenedores y flujos de trabajo para entornos reproducibles.',
        image: 'assets/img/tema31.png'
      },
      {
        id: 2,
        title: 'Integración Continua (CI/CD)',
        description: 'Pipelines de build, test y despliegue automático con herramientas modernas.',
        image: 'assets/img/tema32.png'
      },
      {
        id: 3,
        title: 'Kubernetes Básico',
        description: 'Conceptos base para orquestar contenedores: pods, deployments y servicios.',
        image: 'assets/img/tema33.png'
      }
    ]
  }
};

@Directive()
export abstract class TopicDetailPageLogic implements OnInit {

  moduleId!: number;
  topicId!: number;
  moduleConfig!: ModuleConfig;
  currentTopic!: Topic;
  topicCompleted = false;
  showEvaluationModal = false;

  activities: Activity[] = [
    {
      type: 'interactive',
      title: 'Actividad interactiva',
      description: 'Resuelve una actividad dinámica para practicar lo aprendido.',
      image: 'assets/img/interactiva.png',
      isLocked: false,
      isCompleted: false
    },
    {
      type: 'assignment',
      title: 'Actividad de entrega',
      description: 'Entrega tu evidencia escrita o archivo sobre este tema.',
      image: 'assets/img/subir.png',
      isLocked: true,
      isCompleted: false
    },
    {
      type: 'evaluation',
      title: 'Evaluación',
      description: 'Evalúa lo aprendido en este tema.',
      image: 'assets/img/evaluacion.png',
      isLocked: true,
      isCompleted: false
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private progress: ProgressService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const modParam = this.route.snapshot.paramMap.get('modId');
    const topicParam = this.route.snapshot.paramMap.get('topicId');

    const modId = Number(modParam);
    const topicId = Number(topicParam);

    this.moduleId = MODULES_CONFIG[modId] ? modId : 1;
    this.moduleConfig = MODULES_CONFIG[this.moduleId];

    const foundTopic = this.moduleConfig.topics.find(t => t.id === topicId);
    this.currentTopic = foundTopic || this.moduleConfig.topics[0];
    this.topicId = this.currentTopic.id;

    this.updateActivityLocks();
  }

  private updateActivityLocks(): void {
    this.topicCompleted = this.progress.isTopicCompleted(this.moduleId, this.topicId);

    // Actividad interactiva siempre desbloqueada
    this.activities[0].isLocked = false;
    this.activities[0].isCompleted = this.progress.isActivityCompleted(this.moduleId, this.topicId, 'interactive');

    // Actividad de entrega se desbloquea si la interactiva está completada
    this.activities[1].isLocked = !this.progress.isActivityCompleted(this.moduleId, this.topicId, 'interactive');
    this.activities[1].isCompleted = this.progress.isActivityCompleted(this.moduleId, this.topicId, 'assignment');

    // Evaluación se desbloquea si la entrega está completada
    this.activities[2].isLocked = !this.progress.isActivityCompleted(this.moduleId, this.topicId, 'assignment');
  }

  onActivityClick(activity: Activity): void {
    if (activity.isLocked) {
      alert('Esta actividad está bloqueada. Debes completar la actividad anterior primero.');
      return;
    }

    if (activity.type === 'evaluation') {
      this.openEvaluationModal();
      return;
    }

    const path = activity.type === 'interactive' 
      ? `/modulo/${this.moduleId}/tema/${this.topicId}/actividad-interactiva`
      : `/modulo/${this.moduleId}/tema/${this.topicId}/actividad`;
    
    this.router.navigate([path]);
  }

  markActivityComplete(activityType: 'interactive' | 'assignment'): void {
    this.progress.completeActivity(this.moduleId, this.topicId, activityType);
    this.updateActivityLocks();

    // Si todas las actividades están completadas, marcar tema como completo
    if (this.activities.every(a => a.isCompleted || a.type === 'evaluation')) {
      this.progress.completeTopic(this.moduleId, this.topicId);
      this.topicCompleted = true;
    }
  }

  openEvaluationModal(): void {
    this.showEvaluationModal = true;
    this.playBannerSound();
  }

  closeEvaluationModal(): void {
    this.showEvaluationModal = false;
  }

  acceptEvaluation(): void {
    this.showEvaluationModal = false;
    
    // La evaluación decidirá si se completa el tema basado en el puntaje
    // No completamos aquí, solo navegamos a la evaluación
    window.location.href = `/modulo/${this.moduleId}/tema/${this.topicId}/evaluacion`;
  }

  playBannerSound(): void {
    const audio = new Audio('assets/img/banner2f.mp3');
    audio.volume = 0.5;
    audio.play().catch(error => {
      console.warn('No se pudo reproducir el sonido:', error);
    });
  }
}
