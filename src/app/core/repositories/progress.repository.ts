import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { UserProgress } from '../models/user-progress.model';

export interface StoredProgress {
  userId?: string;
  completedModules: number[];
  completedTopics: Record<string, number[]>;
  completedActivities: Record<string, string[]>;
  entries?: UserProgress[];
}

@Injectable({ providedIn: 'root' })
export abstract class ProgressRepository {
  abstract read(key: string): StoredProgress | null;
  abstract write(key: string, value: StoredProgress): void;
  abstract remove(key: string): void;
}

@Injectable({ providedIn: 'root' })
export class LocalStorageProgressRepository extends ProgressRepository {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  read(key: string): StoredProgress | null {
    const value = this.storage()?.getItem(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as StoredProgress;
    } catch {
      return null;
    }
  }

  write(key: string, value: StoredProgress): void {
    this.storage()?.setItem(key, JSON.stringify(value));
  }

  remove(key: string): void {
    this.storage()?.removeItem(key);
  }

  private storage(): Storage | null {
    if (!this.isBrowser) return null;
    try { return this.document.defaultView?.localStorage || null; } catch { return null; }
  }
}
