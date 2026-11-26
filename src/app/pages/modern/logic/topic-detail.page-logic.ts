import {
  Directive,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LearningRepository, ModuleRecord, TopicRecord } from '../../../core/repositories/learning.repository';
import { ProgressService } from '../../../services/progress.service';
import { SoundService } from '../../../services/sound.service';

interface Activity {
  type: 'interactive' | 'assignment' | 'evaluation';
  title: string;
  description: string;
  image: string;
  isLocked: boolean;
  isCompleted: boolean;
}

type ModuleConfig = ModuleRecord;

@Directive()
export abstract class TopicDetailPageLogic implements OnInit {

  moduleId!: number;
  topicId!: number;
  moduleConfig!: ModuleConfig;
  currentTopic!: TopicRecord;
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
    private router: Router,
    private learningRepository: LearningRepository,
    private sound: SoundService
  ) { }

  ngOnInit(): void {
    const modParam = this.route.snapshot.paramMap.get('modId');
    const topicParam = this.route.snapshot.paramMap.get('topicId');

    const modId = Number(modParam);
    const topicId = Number(topicParam);

    const module = this.learningRepository.getModule(modId) ?? this.learningRepository.getModule(1)!;
    this.moduleId = module.id;
    this.moduleConfig = module;

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
    this.sound.playBannerSound();
  }
}
