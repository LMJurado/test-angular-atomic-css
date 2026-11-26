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
  readonly pageSize = 3;

  constructor(
    private route: ActivatedRoute,
    private progress: ProgressService,
    private router: Router,
    private learningRepository: LearningRepository,
    private sound: SoundService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const module = this.learningRepository.getModule(id) ?? this.learningRepository.getModule(1)!;
    this.moduleId = module.id;
    this.moduleConfig = {
      ...module,
      isCompleted: false,
      topics: module.topics.map(topic => ({ ...topic, isLocked: false, isCompleted: false }))
    };
    this.updateTopicLocks();
  }

  get pagedTopics(): TopicViewModel[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.moduleConfig.topics.slice(start, start + this.pageSize);
  }

  private updateTopicLocks(): void {
    for (const topic of this.moduleConfig.topics) {
      topic.isCompleted = this.progress.isTopicCompleted(this.moduleId, topic.id);
      topic.isLocked = topic.id > 1 && !this.progress.isTopicCompleted(this.moduleId, topic.id - 1);
    }
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
