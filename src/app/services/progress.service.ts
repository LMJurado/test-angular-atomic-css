import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { ProgressRepository, StoredProgress } from '../core/repositories/progress.repository';

interface ProgressData {
  completedModules: Set<number>;
  completedTopics: Map<number, Set<number>>; // moduleId -> Set<topicId>
  completedActivities: Map<string, Set<string>>; // "modId-topicId" -> Set<"interactive" | "assignment">
}

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private progressSubject = new BehaviorSubject<ProgressData>({
    completedModules: new Set(),
    completedTopics: new Map(),
    completedActivities: new Map()
  });

  progress$: Observable<ProgressData> = this.progressSubject.asObservable();

  constructor(private auth: AuthService, private repository: ProgressRepository) {
    this.auth.userChanges$.subscribe(() => this.loadProgress());
  }

  private getStorageKey(): string {
    const user = this.auth.user;
    if (!user || !user.username) {
      return 'userProgress_guest';
    }
    return `userProgress_${user.username}`;
  }

  // Cargar progreso del localStorage
  private loadProgress(): void {
    const storageKey = this.getStorageKey();
    const data = this.repository.read(storageKey);
    if (data) {
      try {
        const progress: ProgressData = {
          completedModules: new Set(data.completedModules || []),
          completedTopics: new Map(),
          completedActivities: new Map()
        };

        // Restaurar completedTopics
        if (data.completedTopics) {
          Object.entries(data.completedTopics).forEach(([modId, topics]: any) => {
            progress.completedTopics.set(Number(modId), new Set(topics));
          });
        }

        // Restaurar completedActivities
        if (data.completedActivities) {
          Object.entries(data.completedActivities).forEach(([key, activities]: any) => {
            progress.completedActivities.set(key, new Set(activities));
          });
        }

        this.progressSubject.next(progress);
      } catch (error) {
        console.error('Error al cargar progreso:', error);
      }
    } else {
      // Si no hay progreso guardado, inicializar vacío
      this.progressSubject.next({
        completedModules: new Set(),
        completedTopics: new Map(),
        completedActivities: new Map()
      });
    }
  }

  // Guardar progreso en localStorage
  private saveProgress(): void {
    const storageKey = this.getStorageKey();
    const progress = this.progressSubject.value;
    const data: StoredProgress = {
      completedModules: Array.from(progress.completedModules),
      completedTopics: {},
      completedActivities: {}
    };

    // Convertir Map de temas a objeto
    progress.completedTopics.forEach((topics, modId) => {
      data.completedTopics[modId] = Array.from(topics);
    });

    // Convertir Map de actividades a objeto
    progress.completedActivities.forEach((activities, key) => {
      data.completedActivities[key] = Array.from(activities);
    });

    this.repository.write(storageKey, data);
  }

  // Marcar módulo como completado
  completeModule(moduleId: number): void {
    const progress = this.progressSubject.value;
    progress.completedModules.add(moduleId);
    this.progressSubject.next(progress);
    this.saveProgress();
  }

  // Marcar tema como completado
  completeTopic(moduleId: number, topicId: number): void {
    const progress = this.progressSubject.value;
    if (!progress.completedTopics.has(moduleId)) {
      progress.completedTopics.set(moduleId, new Set());
    }
    progress.completedTopics.get(moduleId)!.add(topicId);
    this.progressSubject.next(progress);
    this.saveProgress();
  }

  // Marcar actividad como completada
  completeActivity(moduleId: number, topicId: number, activityType: 'interactive' | 'assignment'): void {
    const progress = this.progressSubject.value;
    const key = `${moduleId}-${topicId}`;
    if (!progress.completedActivities.has(key)) {
      progress.completedActivities.set(key, new Set());
    }
    progress.completedActivities.get(key)!.add(activityType);
    this.progressSubject.next(progress);
    this.saveProgress();
  }

  // Verificar si un módulo está completado
  isModuleCompleted(moduleId: number): boolean {
    return this.progressSubject.value.completedModules.has(moduleId);
  }

  // Verificar si un tema está completado
  isTopicCompleted(moduleId: number, topicId: number): boolean {
    return this.progressSubject.value.completedTopics.get(moduleId)?.has(topicId) ?? false;
  }

  // Verificar si una actividad está completada
  isActivityCompleted(moduleId: number, topicId: number, activityType: 'interactive' | 'assignment'): boolean {
    const key = `${moduleId}-${topicId}`;
    return this.progressSubject.value.completedActivities.get(key)?.has(activityType) ?? false;
  }

  // Obtener primer módulo no completado
  getFirstIncompleteModule(): number | null {
    const progress = this.progressSubject.value;
    for (let i = 1; i <= 3; i++) {
      if (!progress.completedModules.has(i)) {
        return i;
      }
    }
    return null;
  }

  // Obtener primer tema no completado en un módulo
  getFirstIncompleteTopic(moduleId: number): number | null {
    const progress = this.progressSubject.value;
    const topics = progress.completedTopics.get(moduleId) || new Set();
    for (let i = 1; i <= 3; i++) {
      if (!topics.has(i)) {
        return i;
      }
    }
    return null;
  }

  // Obtener primer actividad no completada en un tema
  getFirstIncompleteActivity(moduleId: number, topicId: number): 'interactive' | 'assignment' | null {
    const progress = this.progressSubject.value;
    const key = `${moduleId}-${topicId}`;
    const activities = progress.completedActivities.get(key) || new Set();

    if (!activities.has('interactive')) return 'interactive';
    if (!activities.has('assignment')) return 'assignment';
    return null;
  }

  // Obtener progreso completo
  getProgress(): ProgressData {
    return this.progressSubject.value;
  }

  // Resetear progreso (para testing)
  resetProgress(): void {
    this.progressSubject.next({
      completedModules: new Set(),
      completedTopics: new Map(),
      completedActivities: new Map()
    });
    const storageKey = this.getStorageKey();
    this.repository.remove(storageKey);
  }
}
