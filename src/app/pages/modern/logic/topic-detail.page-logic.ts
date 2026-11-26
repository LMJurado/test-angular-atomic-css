import {
  Directive,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityRecord, LearningRepository, ModuleRecord, TopicRecord } from '../../../core/repositories/learning.repository';
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

  activities: Activity[] = [];

  constructor(
    private route: ActivatedRoute,
    private progress: ProgressService,
    private router: Router,
    private learningRepository: LearningRepository,
    private sound: SoundService
  ) { }

  async ngOnInit(): Promise<void> {
    const modParam = this.route.snapshot.paramMap.get('modId');
    const topicParam = this.route.snapshot.paramMap.get('topicId');

    const modId = Number(modParam);
    const topicId = Number(topicParam);

    const module = await this.learningRepository.getModule(modId);
    if (!module || module.status !== 'ACTIVE') {
      this.router.navigate(['/nuevo/inicio']);
      return;
    }
    this.moduleId = module.id;
    this.moduleConfig = module;

    const foundTopic = this.moduleConfig.topics.find(t => t.id === topicId && t.status === 'ACTIVE');
    if (!foundTopic) {
      this.router.navigate(['/nuevo/modulo', this.moduleId]);
      return;
    }
    this.currentTopic = foundTopic;
    this.topicId = this.currentTopic.id;

    this.activities = this.currentTopic.activities
      .filter(activity => activity.status === 'ACTIVE')
      .map(activity => this.toActivity(activity));
    this.updateActivityLocks();
  }

  private updateActivityLocks(): void {
    this.topicCompleted = this.progress.isTopicCompleted(this.moduleId, this.topicId);
    const hasInteractiveActivity = this.activities.some(activity => activity.type === 'interactive');
    const hasAssignmentActivity = this.activities.some(activity => activity.type === 'assignment');

    for (const activity of this.activities) {
      if (activity.type === 'interactive') {
        activity.isLocked = false;
        activity.isCompleted = this.progress.isActivityCompleted(this.moduleId, this.topicId, 'interactive');
      } else if (activity.type === 'assignment') {
        activity.isLocked = hasInteractiveActivity && !this.progress.isActivityCompleted(this.moduleId, this.topicId, 'interactive');
        activity.isCompleted = this.progress.isActivityCompleted(this.moduleId, this.topicId, 'assignment');
      } else {
        activity.isLocked = hasAssignmentActivity && !this.progress.isActivityCompleted(this.moduleId, this.topicId, 'assignment');
        activity.isCompleted = false;
      }
    }
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

  private toActivity(activity: ActivityRecord): Activity {
    const imageByType: Record<Activity['type'], string> = {
      interactive: 'assets/img/interactiva.png',
      assignment: 'assets/img/subir.png',
      evaluation: 'assets/img/evaluacion.png'
    };
    return {
      type: activity.type, title: activity.title, description: activity.description,
      image: imageByType[activity.type], isLocked: false, isCompleted: false
    };
  }
}
