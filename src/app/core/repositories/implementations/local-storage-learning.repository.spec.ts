import { TestBed } from '@angular/core/testing';

import { LEARNING_STORAGE_KEY } from '../../storage/storage-keys';
import { LocalStorageLearningRepository } from './local-storage-learning.repository';

describe('LocalStorageLearningRepository', () => {
  let repository: LocalStorageLearningRepository;

  beforeEach(() => {
    localStorage.removeItem(LEARNING_STORAGE_KEY);
    TestBed.configureTestingModule({ providers: [LocalStorageLearningRepository] });
    repository = TestBed.inject(LocalStorageLearningRepository);
  });

  it('seeds existing course content with topic identifiers scoped to each module', async () => {
    const modules = await repository.getAll();
    expect(modules.length).toBeGreaterThan(0);
    expect(modules[0].topics[0].id).toBe(modules[1].topics[0].id);
    expect(modules[0].topics[0].key).not.toBe(modules[1].topics[0].key);
  });

  it('persists module, topic and resource CRUD across repository instances', async () => {
    const module = await repository.create({
      name: 'Pruebas', breadcrumb: 'Pruebas', description: 'Módulo de prueba', image: '', order: 99, status: 'ACTIVE'
    });
    const topic = await repository.createTopic(module.id, {
      title: 'Tema', description: '', image: '', order: 1, status: 'ACTIVE'
    });
    const resource = await repository.createResource(module.id, topic.id, {
      title: 'Video', type: 'video', url: 'https://youtu.be/example', description: ''
    });

    const reloaded = TestBed.inject(LocalStorageLearningRepository);
    expect((await reloaded.getByTopic(module.id, topic.id))?.resources[0].id).toBe(resource.id);
    await reloaded.updateResource(module.id, topic.id, resource.id, { title: 'Video actualizado' });
    expect((await reloaded.getByTopic(module.id, topic.id))?.resources[0].title).toBe('Video actualizado');
    await reloaded.delete(module.id);
    expect(await reloaded.getById(module.id)).toBeNull();
  });
});
