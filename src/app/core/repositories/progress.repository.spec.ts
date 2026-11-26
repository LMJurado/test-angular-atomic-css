import { TestBed } from '@angular/core/testing';

import { LocalStorageProgressRepository } from './progress.repository';

describe('LocalStorageProgressRepository', () => {
  let repository: LocalStorageProgressRepository;
  const key = 'plataforma-ova.progress.test';

  beforeEach(() => {
    localStorage.removeItem(key);
    TestBed.configureTestingModule({ providers: [LocalStorageProgressRepository] });
    repository = TestBed.inject(LocalStorageProgressRepository);
  });

  afterEach(() => localStorage.removeItem(key));

  it('writes, reads and removes progress records', () => {
    const progress = { userId: 'student-1', completedModules: [1], completedTopics: { '1': [2] }, completedActivities: {} };
    repository.write(key, progress);
    expect(repository.read(key)).toEqual(progress);
    repository.remove(key);
    expect(repository.read(key)).toBeNull();
  });

  it('treats malformed stored data as missing progress', () => {
    localStorage.setItem(key, '{not-json');
    expect(repository.read(key)).toBeNull();
  });
});
