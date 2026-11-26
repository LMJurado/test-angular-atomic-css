import { Directive, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { LearningRepository, ModuleRecord, TopicRecord } from '../../../core/repositories/learning.repository';
import { ProgressService } from '../../../services/progress.service';
import { SoundService } from '../../../services/sound.service';

export interface TopicViewModel extends TopicRecord {
  isLocked: boolean;
  isCompleted: boolean;
}

export interface ModuleViewModel extends Omit<ModuleRecord, 'topics'> {
  topics: TopicViewModel[];
  isCompleted: boolean;
}

@Directive()
export abstract class ModuleDetailPageLogic implements OnInit {
  moduleId!: number;
  moduleConfig!: ModuleViewModel;
  currentPage = 1;
  readonly pageSize = 2;

  constructor(
    private route: ActivatedRoute,
    private progress: ProgressService,
    private router: Router,
    private learningRepository: LearningRepository,
    private sound: SoundService
  ) {}

  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const module = await this.learningRepository.getModule(id);
    if (!module || module.status !== 'ACTIVE') {
      this.router.navigate(['/nuevo/inicio']);
      return;
    }
    this.moduleId = module.id;
    this.moduleConfig = {
      ...module,
      isCompleted: false,
      topics: module.topics.filter(topic => topic.status === 'ACTIVE')
        .sort((a, b) => a.order - b.order)
        .map(topic => ({ ...topic, isLocked: false, isCompleted: false }))
    };
    this.updateTopicLocks();
  }

  get pagedTopics(): TopicViewModel[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.moduleConfig.topics.slice(start, start + this.pageSize);
  }

  private updateTopicLocks(): void {
    this.moduleConfig.topics.forEach((topic, index) => {
      topic.isCompleted = this.progress.isTopicCompleted(this.moduleId, topic.id);
      topic.isLocked = index > 0 && !this.progress.isTopicCompleted(this.moduleId, this.moduleConfig.topics[index - 1].id);
    });
    this.moduleConfig.isCompleted = this.moduleConfig.topics.every(topic => topic.isCompleted);
  }

  onTopicClick(topic: TopicViewModel): void {
    if (topic.isLocked) {
      alert('Este tema está bloqueado. Debes completar el tema anterior primero.');
      return;
    }
    this.router.navigate(['/modulo', this.moduleId, 'tema', topic.id]);
  }

  playBannerSound(): void {
    this.sound.playBannerSound();
  }
}
