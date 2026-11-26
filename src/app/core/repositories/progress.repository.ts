import { Injectable } from '@angular/core';

export interface StoredProgress {
  completedModules: number[];
  completedTopics: Record<string, number[]>;
  completedActivities: Record<string, string[]>;
}

@Injectable({ providedIn: 'root' })
export abstract class ProgressRepository {
  abstract read(key: string): StoredProgress | null;
  abstract write(key: string, value: StoredProgress): void;
  abstract remove(key: string): void;
}

@Injectable({ providedIn: 'root' })
export class LocalStorageProgressRepository extends ProgressRepository {
  read(key: string): StoredProgress | null {
    const value = localStorage.getItem(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as StoredProgress;
    } catch {
      return null;
    }
  }

  write(key: string, value: StoredProgress): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }
}
