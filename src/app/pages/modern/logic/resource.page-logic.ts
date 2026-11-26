import { Directive, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

import { ResourceRecord } from '../../../core/models/learning.model';
import { LearningRepository } from '../../../core/repositories/learning.repository';

export interface ResourceView extends ResourceRecord {
  safeUrl: SafeResourceUrl | null;
}

@Directive()
export abstract class ResourcePageLogic implements OnInit {
  moduleId!: number;
  moduleName = '';
  resources: ResourceView[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly learning: LearningRepository,
    private readonly sanitizer: DomSanitizer,
    private readonly router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.moduleId = Number(this.route.snapshot.paramMap.get('modId')) || 1;
    const module = await this.learning.getById(this.moduleId);
    if (!module || module.status !== 'ACTIVE') {
      this.router.navigate(['/nuevo/inicio']);
      return;
    }
    this.moduleName = module.name;
    this.resources = module.topics
      .filter(topic => topic.status === 'ACTIVE')
      .sort((a, b) => a.order - b.order)
      .flatMap(topic => topic.resources.map(resource => ({
        ...resource,
        safeUrl: resource.type === 'video' ? this.safeYoutubeUrl(resource.url) : null
      })));
  }

  private safeYoutubeUrl(rawUrl: string): SafeResourceUrl | null {
    try {
      const url = new URL(rawUrl);
      const allowedHosts = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'youtube-nocookie.com', 'www.youtube-nocookie.com'];
      if (!allowedHosts.includes(url.hostname.toLowerCase())) return null;
      let videoId = '';
      if (url.hostname.toLowerCase() === 'youtu.be') videoId = url.pathname.split('/').filter(Boolean)[0] || '';
      else if (url.pathname === '/watch') videoId = url.searchParams.get('v') || '';
      else if (url.pathname.startsWith('/embed/')) videoId = url.pathname.split('/')[2] || '';
      if (!/^[\w-]{6,20}$/.test(videoId)) return null;
      return this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + videoId);
    } catch {
      return null;
    }
  }
}
