import {
  Directive,
  OnDestroy,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener
} from '@angular/core';
import {
  DomSanitizer,
  SafeResourceUrl,
} from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgressService } from '../../../services/progress.service';

interface TopicInfo {
  id: number;
  title: string;
}

interface ModuleInfo {
  id: number;
  name: string;
  breadcrumb: string;
  topics: TopicInfo[];
}

const MODULES_INFO: Record<number, ModuleInfo> = {
  1: {
    id: 1,
    name: 'Desarrollo Web',
    breadcrumb: 'Desarrollo Web',
    topics: [
      { id: 1, title: 'Fundamentos de HTML y CSS' },
      { id: 2, title: 'Programación con JavaScript' },
      { id: 3, title: 'Angular Básico' }
    ]
  },
  2: {
    id: 2,
    name: 'Desarrollo Móvil',
    breadcrumb: 'Desarrollo Móvil',
    topics: [
      { id: 1, title: 'Introducción al Desarrollo de Apps' },
      { id: 2, title: 'Fundamentos de Flutter' },
      { id: 3, title: 'React Native Básico' }
    ]
  },
  3: {
    id: 3,
    name: 'DevOps y Automatización',
    breadcrumb: 'DevOps y Automatización',
    topics: [
      { id: 1, title: 'Docker y Contenedores' },
      { id: 2, title: 'Integración Continua (CI/CD)' },
      { id: 3, title: 'Kubernetes Básico' }
    ]
  }
};

const LOCAL_WORD_SEARCH_GAME_IDS: Record<string, number> = {
  '1-2': 18,
  '2-1': 19,
  '2-2': 20,
  '3-3': 21
};

@Directive()
export abstract class InteractiveActivityPageLogic implements OnInit, OnDestroy {

  moduleId!: number;
  topicId!: number;
  moduleInfo!: ModuleInfo;
  topicInfo!: TopicInfo;

  activityUrl!: SafeResourceUrl; // URL segura para el iframe
  rawActivityPath!: string; // Guardar la ruta sin sanitizar para poder recargar

  showCompleteMessage = false;

  @ViewChild('iframeElement') iframeElement!: ElementRef<HTMLIFrameElement>;

  private iframeDocument: Document | null = null;
  private iframeResizeObserver: ResizeObserver | null = null;
  private iframeMutationObserver: MutationObserver | null = null;

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private progress: ProgressService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const modParam = this.route.snapshot.paramMap.get('modId');
    const topicParam = this.route.snapshot.paramMap.get('topicId');

    const modId = Number(modParam);
    const topicId = Number(topicParam);

    // Validación básica
    this.moduleId = MODULES_INFO[modId] ? modId : 1;
    this.moduleInfo = MODULES_INFO[this.moduleId];

    const topic = this.moduleInfo.topics.find(t => t.id === topicId);
    this.topicInfo = topic || this.moduleInfo.topics[0];
    this.topicId = this.topicInfo.id;

    const gameId = LOCAL_WORD_SEARCH_GAME_IDS[`${this.moduleId}-${this.topicId}`];
    const activityUrl = new URL(
      gameId
        ? 'assets/games/word-search/index.html'
        : `assets/h5p/mod${this.moduleId}-tema${this.topicId}.html`,
      document.baseURI
    );
    if (gameId) activityUrl.searchParams.set('id', String(gameId));
    this.rawActivityPath = activityUrl.toString();
    this.activityUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.rawActivityPath);
  }

  restartActivity(): void {
    this.stopObservingIframeContent();
    const activityUrl = new URL(this.rawActivityPath);
    activityUrl.searchParams.set('t', String(Date.now()));
    this.activityUrl = this.sanitizer.bypassSecurityTrustResourceUrl(activityUrl.toString());
  }

  ngOnDestroy(): void {
    this.stopObservingIframeContent();
  }

  completeActivity(): void {
    this.progress.completeActivity(this.moduleId, this.topicId, 'interactive');
    this.showCompleteMessage = true;

    // Mostrar mensaje por 2 segundos y luego redirigir
    setTimeout(() => {
      this.router.navigate(['/modulo', this.moduleId, 'tema', this.topicId]);
    }, 2000);
  }

  onIframeLoad(): void {
    if (this.iframeElement && this.iframeElement.nativeElement) {
      try {
        const iframe = this.iframeElement.nativeElement;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) return;

        this.stopObservingIframeContent();
        this.iframeDocument = iframeDoc;

        const resize = () => this.resizeIframe(iframe, iframeDoc);
        resize();

        if (typeof ResizeObserver !== 'undefined') {
          this.iframeResizeObserver = new ResizeObserver(resize);
          this.iframeResizeObserver.observe(iframeDoc.documentElement);
          if (iframeDoc.body) this.iframeResizeObserver.observe(iframeDoc.body);
        }

        if (typeof MutationObserver !== 'undefined') {
          this.iframeMutationObserver = new MutationObserver(resize);
          this.iframeMutationObserver.observe(iframeDoc.documentElement, {
            childList: true,
            characterData: true,
            subtree: true
          });
        }
      } catch (e) {
        console.error('Error al ajustar la altura del iframe:', e);
      }
    }
  }

  private resizeIframe(iframe: HTMLIFrameElement, iframeDoc: Document): void {
    requestAnimationFrame(() => {
      if (!iframe.isConnected || iframe.contentDocument !== iframeDoc) return;

      const height = Math.max(
        iframeDoc.documentElement.scrollHeight,
        iframeDoc.body?.scrollHeight ?? 0
      );
      iframe.style.height = `${Math.ceil(height)}px`;
    });
  }

  private stopObservingIframeContent(): void {
    this.iframeResizeObserver?.disconnect();
    this.iframeMutationObserver?.disconnect();
    this.iframeResizeObserver = null;
    this.iframeMutationObserver = null;
    this.iframeDocument = null;
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    const iframe = this.iframeElement?.nativeElement;
    if (iframe && this.iframeDocument) {
      this.resizeIframe(iframe, this.iframeDocument);
    }
  }
}
