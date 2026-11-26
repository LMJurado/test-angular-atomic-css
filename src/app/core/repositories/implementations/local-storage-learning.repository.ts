import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, inject, PLATFORM_ID } from '@angular/core';

import { ActivityRecord, ContentStatus, ModuleRecord, ResourceRecord, TopicRecord } from '../../models/learning.model';
import { LEARNING_STORAGE_KEY } from '../../storage/storage-keys';
import { LearningRepository, NewActivity, NewModule, NewResource, NewTopic } from '../learning.repository';

const DEFAULT_ACTIVITIES: Array<Pick<ActivityRecord, 'type' | 'title' | 'description'>> = [
  { type: 'interactive', title: 'Actividad interactiva', description: 'Resuelve una actividad dinámica para practicar lo aprendido.' },
  { type: 'assignment', title: 'Actividad de entrega', description: 'Entrega tu evidencia escrita o archivo sobre este tema.' },
  { type: 'evaluation', title: 'Evaluación', description: 'Evalúa lo aprendido en este tema.' }
];

const DEFAULTS: ModuleRecord[] = [
  {
    id: 1, name: 'Desarrollo Web', breadcrumb: 'Desarrollo Web', description: 'Aprende HTML, CSS, JavaScript y Angular.',
    image: 'assets/img/b3.png', order: 1, status: 'ACTIVE',
    topics: [
      { id: 1, key: 'm1-t1', moduleId: 1, title: 'Fundamentos de HTML y CSS', description: 'Estructura básica de la web, etiquetas principales y estilos con CSS.', image: 'assets/img/tema1.png', order: 1, status: 'ACTIVE', resources: [{ id: 'web-video', topicId: 1, title: 'Recursos de Desarrollo Web', type: 'video', url: 'https://www.youtube.com/embed/VPQICmxcXqE', description: 'Video de apoyo para el módulo.' }], activities: [] },
      { id: 2, key: 'm1-t2', moduleId: 1, title: 'Programación con JavaScript', description: 'Variables, funciones, DOM, eventos y buenas prácticas en JavaScript moderno.', image: 'assets/img/tema2.png', order: 2, status: 'ACTIVE', resources: [], activities: [] },
      { id: 3, key: 'm1-t3', moduleId: 1, title: 'Angular Básico', description: 'Componentes, módulos, data binding y servicios en aplicaciones SPA con Angular.', image: 'assets/img/tema3.png', order: 3, status: 'ACTIVE', resources: [], activities: [] }
    ]
  },
  {
    id: 2, name: 'Desarrollo Móvil', breadcrumb: 'Desarrollo Móvil', description: 'Diseño y desarrollo de aplicaciones móviles.',
    image: 'assets/img/b1.png', order: 2, status: 'ACTIVE',
    topics: [
      { id: 1, key: 'm2-t1', moduleId: 2, title: 'Introducción al Desarrollo de Apps', description: 'Tipos de apps, UX/UI móvil, navegación y patrones básicos de arquitectura.', image: 'assets/img/tema21.png', order: 1, status: 'ACTIVE', resources: [{ id: 'mobile-video', topicId: 1, title: 'Recursos de Desarrollo Móvil', type: 'video', url: 'https://www.youtube.com/embed/Wc5OBu6PaKQ', description: 'Video de apoyo para el módulo.' }], activities: [] },
      { id: 2, key: 'm2-t2', moduleId: 2, title: 'Fundamentos de Flutter', description: 'Widgets, maquetación responsiva, navegación y manejo de estado en Flutter.', image: 'assets/img/tema22.png', order: 2, status: 'ACTIVE', resources: [], activities: [] },
      { id: 3, key: 'm2-t3', moduleId: 2, title: 'React Native Básico', description: 'Componentes, hooks y navegación para construir apps nativas con JavaScript.', image: 'assets/img/tema23.png', order: 3, status: 'ACTIVE', resources: [], activities: [] }
    ]
  },
  {
    id: 3, name: 'DevOps y Automatización', breadcrumb: 'DevOps y Automatización', description: 'Automatiza, integra y despliega aplicaciones.',
    image: 'assets/img/b2.png', order: 3, status: 'ACTIVE',
    topics: [
      { id: 1, key: 'm3-t1', moduleId: 3, title: 'Docker y Contenedores', description: 'Imágenes, contenedores y flujos de trabajo para entornos reproducibles.', image: 'assets/img/tema31.png', order: 1, status: 'ACTIVE', resources: [{ id: 'devops-video', topicId: 1, title: 'Recursos de DevOps', type: 'video', url: 'https://www.youtube.com/embed/wfLS5kEcDrM', description: 'Video de apoyo para el módulo.' }], activities: [] },
      { id: 2, key: 'm3-t2', moduleId: 3, title: 'Integración Continua (CI/CD)', description: 'Pipelines de build, test y despliegue automático con herramientas modernas.', image: 'assets/img/tema32.png', order: 2, status: 'ACTIVE', resources: [], activities: [] },
      { id: 3, key: 'm3-t3', moduleId: 3, title: 'Kubernetes Básico', description: 'Conceptos base para orquestar contenedores: pods, deployments y servicios.', image: 'assets/img/tema33.png', order: 3, status: 'ACTIVE', resources: [], activities: [] }
    ]
  }
];

@Injectable({ providedIn: 'root' })
export class LocalStorageLearningRepository extends LearningRepository {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private cache: ModuleRecord[] | null = null;

  async getAll(): Promise<ModuleRecord[]> { return this.clone(this.load()); }

  async getById(id: number): Promise<ModuleRecord | null> {
    const module = this.load().find(item => item.id === id);
    return module ? this.clone(module) : null;
  }

  async create(data: NewModule): Promise<ModuleRecord> {
    const modules = this.load();
    const id = modules.reduce((max, item) => Math.max(max, item.id), 0) + 1;
    const module: ModuleRecord = { ...data, id, breadcrumb: data.breadcrumb || data.name, description: data.description || '', image: data.image || 'assets/img/b3.png', order: data.order || id, status: data.status || 'ACTIVE', topics: [] };
    modules.push(module);
    this.save(modules);
    return this.clone(module);
  }

  async update(id: number, data: Partial<NewModule>): Promise<ModuleRecord> {
    const modules = this.load();
    const index = modules.findIndex(item => item.id === id);
    if (index < 0) throw new Error('Módulo no encontrado.');
    modules[index] = { ...modules[index], ...data, id, topics: modules[index].topics };
    this.save(modules);
    return this.clone(modules[index]);
  }

  async delete(id: number): Promise<void> {
    const modules = this.load();
    if (!modules.some(item => item.id === id)) throw new Error('Módulo no encontrado.');
    this.save(modules.filter(item => item.id !== id));
  }

  async setStatus(id: number, status: ContentStatus): Promise<ModuleRecord> { return this.update(id, { status }); }

  async createTopic(moduleId: number, data: NewTopic): Promise<TopicRecord> {
    const module = this.requireModule(moduleId);
    const id = module.topics.reduce((max, item) => Math.max(max, item.id), 0) + 1;
    const topic: TopicRecord = { ...data, id, moduleId, key: 'm' + moduleId + '-t' + id, order: data.order || id, status: data.status || 'ACTIVE', resources: data.resources || [], activities: data.activities || [] };
    module.topics.push(topic);
    this.save(this.load());
    return this.clone(topic);
  }

  async updateTopic(moduleId: number, topicId: number, data: Partial<NewTopic>): Promise<TopicRecord> {
    const module = this.requireModule(moduleId);
    const index = module.topics.findIndex(item => item.id === topicId);
    if (index < 0) throw new Error('Tema no encontrado.');
    module.topics[index] = { ...module.topics[index], ...data, id: topicId, moduleId, key: 'm' + moduleId + '-t' + topicId };
    this.save(this.load());
    return this.clone(module.topics[index]);
  }

  async deleteTopic(moduleId: number, topicId: number): Promise<void> {
    const module = this.requireModule(moduleId);
    if (!module.topics.some(item => item.id === topicId)) throw new Error('Tema no encontrado.');
    module.topics = module.topics.filter(item => item.id !== topicId);
    this.save(this.load());
  }

  async createResource(moduleId: number, topicId: number, data: NewResource): Promise<ResourceRecord> {
    const topic = this.requireTopic(moduleId, topicId);
    const item = { ...data, id: this.newId('resource'), topicId };
    topic.resources.push(item);
    this.save(this.load());
    return { ...item };
  }

  async updateResource(moduleId: number, topicId: number, resourceId: string, data: Partial<NewResource>): Promise<ResourceRecord> {
    const topic = this.requireTopic(moduleId, topicId);
    const index = topic.resources.findIndex(item => item.id === resourceId);
    if (index < 0) throw new Error('Recurso no encontrado.');
    topic.resources[index] = { ...topic.resources[index], ...data, id: resourceId, topicId };
    this.save(this.load());
    return { ...topic.resources[index] };
  }

  async deleteResource(moduleId: number, topicId: number, resourceId: string): Promise<void> {
    const topic = this.requireTopic(moduleId, topicId);
    if (!topic.resources.some(item => item.id === resourceId)) throw new Error('Recurso no encontrado.');
    topic.resources = topic.resources.filter(item => item.id !== resourceId);
    this.save(this.load());
  }

  async createActivity(moduleId: number, topicId: number, data: NewActivity): Promise<ActivityRecord> {
    const topic = this.requireTopic(moduleId, topicId);
    const item = { ...data, id: this.newId('activity'), topicId };
    topic.activities.push(item);
    this.save(this.load());
    return { ...item };
  }

  async updateActivity(moduleId: number, topicId: number, activityId: string, data: Partial<NewActivity>): Promise<ActivityRecord> {
    const topic = this.requireTopic(moduleId, topicId);
    const index = topic.activities.findIndex(item => item.id === activityId);
    if (index < 0) throw new Error('Actividad no encontrada.');
    topic.activities[index] = { ...topic.activities[index], ...data, id: activityId, topicId };
    this.save(this.load());
    return { ...topic.activities[index] };
  }

  async deleteActivity(moduleId: number, topicId: number, activityId: string): Promise<void> {
    const topic = this.requireTopic(moduleId, topicId);
    if (!topic.activities.some(item => item.id === activityId)) throw new Error('Actividad no encontrada.');
    topic.activities = topic.activities.filter(item => item.id !== activityId);
    this.save(this.load());
  }

  private load(): ModuleRecord[] {
    if (this.cache) return this.cache;
    const raw = this.storage()?.getItem(LEARNING_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as ModuleRecord[];
        if (Array.isArray(parsed)) {
          this.cache = this.normalize(parsed);
          return this.cache;
        }
      } catch { /* Se recuperan los contenidos iniciales si el JSON fue alterado. */ }
    }
    this.cache = this.normalize(this.clone(DEFAULTS));
    for (const module of this.cache) {
      for (const topic of module.topics) {
        if (!topic.activities.length) {
          topic.activities = DEFAULT_ACTIVITIES.map((activity, index) => ({
            ...activity, id: 'm' + module.id + '-t' + topic.id + '-activity-' + (index + 1),
            topicId: topic.id, configuration: {}, status: 'ACTIVE'
          }));
        }
      }
    }
    this.save(this.cache);
    return this.cache;
  }

  private normalize(modules: ModuleRecord[]): ModuleRecord[] {
    return modules.map((module, index) => ({
      ...module,
      breadcrumb: module.breadcrumb || module.name,
      description: module.description || '',
      order: module.order || index + 1,
      status: module.status || 'ACTIVE',
      topics: (module.topics || []).map((topic, topicIndex) => ({
        ...topic, key: 'm' + module.id + '-t' + topic.id, moduleId: module.id,
        order: topic.order || topicIndex + 1, status: topic.status || 'ACTIVE',
        resources: topic.resources || [], activities: topic.activities || []
      }))
    }));
  }

  private save(modules: ModuleRecord[]): void {
    this.cache = modules;
    try { this.storage()?.setItem(LEARNING_STORAGE_KEY, JSON.stringify(modules)); } catch { /* El caché local conserva la edición de esta sesión. */ }
  }

  private requireModule(id: number): ModuleRecord {
    const module = this.load().find(item => item.id === id);
    if (!module) throw new Error('Módulo no encontrado.');
    return module;
  }

  private requireTopic(moduleId: number, topicId: number): TopicRecord {
    const topic = this.requireModule(moduleId).topics.find(item => item.id === topicId);
    if (!topic) throw new Error('Tema no encontrado.');
    return topic;
  }

  private newId(prefix: string): string {
    return this.document.defaultView?.crypto?.randomUUID?.() || prefix + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
  }

  private clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }

  private storage(): Storage | null {
    if (!this.isBrowser) return null;
    try { return this.document.defaultView?.localStorage || null; } catch { return null; }
  }
}
