import {
  Directive,
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

@Directive()
export abstract class InteractiveActivityPageLogic implements OnInit {

  moduleId!: number;
  topicId!: number;
  moduleInfo!: ModuleInfo;
  topicInfo!: TopicInfo;

  activityUrl!: SafeResourceUrl; // URL segura para el iframe
  rawActivityPath!: string; // Guardar la ruta sin sanitizar para poder recargar

  showCompleteMessage = false;

  @ViewChild('iframeElement') iframeElement!: ElementRef<HTMLIFrameElement>;
  @ViewChild('iframeContainer') iframeContainer!: ElementRef<HTMLDivElement>;

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

    // Construir la ruta del HTML de la actividad
    this.rawActivityPath = `assets/h5p/mod${this.moduleId}-tema${this.topicId}.html`;
    this.activityUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.rawActivityPath);
  }

  restartActivity(): void {
    // Recargar la URL del iframe para reiniciar la actividad
    this.activityUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.rawActivityPath + '?t=' + Date.now());
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
    // Cuando el iframe cargue, ajustar su altura al contenido interno
    if (this.iframeElement && this.iframeElement.nativeElement) {
      try {
        const iframe = this.iframeElement.nativeElement;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        
        if (iframeDoc) {
          // Obtener la altura del contenido del iframe
          const height = iframeDoc.documentElement.scrollHeight || iframeDoc.body.scrollHeight;
          iframe.style.height = (height + 20) + 'px';
        }
      } catch (e) {
        console.error('Error al ajustar la altura del iframe:', e);
      }
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    // Recalcular la altura del iframe cuando la ventana se redimensione
    this.onIframeLoad();
  }

  @HostListener('wheel', ['$event'])
  onMouseWheel(event: WheelEvent): void {
    // Permitir que el scroll de la rueda del ratón funcione en la página
    // El iframe no será scrollable, solo la página principal
    if (this.iframeElement && this.iframeElement.nativeElement) {
      const iframe = this.iframeElement.nativeElement;
      const rect = iframe.getBoundingClientRect();
      
      // Si el scroll está dentro del iframe, ignorar para permitir scroll de página
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        // El evento se propaga naturalmente a la página
        return;
      }
    }
  }
}
