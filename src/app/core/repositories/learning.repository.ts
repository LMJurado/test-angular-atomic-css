import { Injectable } from '@angular/core';

export interface TopicRecord {
  id: number;
  title: string;
  description: string;
  image: string;
}

export interface ModuleRecord {
  id: number;
  name: string;
  breadcrumb: string;
  image: string;
  topics: TopicRecord[];
}

export interface ModuleSummary {
  id: number;
  title: string;
  image: string;
}

const MODULES: ModuleRecord[] = [
  {
    id: 1,
    name: 'Desarrollo Web',
    breadcrumb: 'Desarrollo Web',
    image: 'assets/img/b3.png',
    topics: [
      { id: 1, title: 'Fundamentos de HTML y CSS', description: 'Estructura básica de la web, etiquetas principales y estilos con CSS.', image: 'assets/img/tema1.png' },
      { id: 2, title: 'Programación con JavaScript', description: 'Variables, funciones, DOM, eventos y buenas prácticas en JavaScript moderno.', image: 'assets/img/tema2.png' },
      { id: 3, title: 'Angular Básico', description: 'Componentes, módulos, data binding y servicios en aplicaciones SPA con Angular.', image: 'assets/img/tema3.png' }
    ]
  },
  {
    id: 2,
    name: 'Desarrollo Móvil',
    breadcrumb: 'Desarrollo Móvil',
    image: 'assets/img/b1.png',
    topics: [
      { id: 1, title: 'Introducción al Desarrollo de Apps', description: 'Tipos de apps, UX/UI móvil, navegación y patrones básicos de arquitectura.', image: 'assets/img/tema21.png' },
      { id: 2, title: 'Fundamentos de Flutter', description: 'Widgets, maquetación responsiva, navegación y manejo de estado en Flutter.', image: 'assets/img/tema22.png' },
      { id: 3, title: 'React Native Básico', description: 'Componentes, hooks y navegación para construir apps nativas con JavaScript.', image: 'assets/img/tema23.png' }
    ]
  },
  {
    id: 3,
    name: 'DevOps y Automatización',
    breadcrumb: 'DevOps y Automatización',
    image: 'assets/img/b2.png',
    topics: [
      { id: 1, title: 'Docker y Contenedores', description: 'Imágenes, contenedores y flujos de trabajo para entornos reproducibles.', image: 'assets/img/tema31.png' },
      { id: 2, title: 'Integración Continua (CI/CD)', description: 'Pipelines de build, test y despliegue automático con herramientas modernas.', image: 'assets/img/tema32.png' },
      { id: 3, title: 'Kubernetes Básico', description: 'Conceptos base para orquestar contenedores: pods, deployments y servicios.', image: 'assets/img/tema33.png' }
    ]
  }
];

@Injectable({ providedIn: 'root' })
export class LearningRepository {
  getModuleSummaries(): ModuleSummary[] {
    return MODULES.map(({ id, name, image }) => ({ id, title: name, image }));
  }

  getModules(): ModuleRecord[] {
    return MODULES.map(module => ({ ...module, topics: module.topics.map(topic => ({ ...topic })) }));
  }

  getModule(id: number): ModuleRecord | undefined {
    const module = MODULES.find(item => item.id === id);
    return module ? { ...module, topics: module.topics.map(topic => ({ ...topic })) } : undefined;
  }
}
