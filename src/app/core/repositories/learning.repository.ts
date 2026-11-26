import {
  ActivityRecord, ActivityType, ContentStatus, ModuleRecord, ModuleSummary,
  ResourceRecord, ResourceType, TopicRecord
} from '../models/learning.model';

export type { ActivityRecord, ActivityType, ContentStatus, ModuleRecord, ModuleSummary, ResourceRecord, ResourceType, TopicRecord };

export type NewModule = Omit<ModuleRecord, 'id' | 'topics'> & { topics?: TopicRecord[] };
export type NewTopic = Omit<TopicRecord, 'id' | 'key' | 'moduleId' | 'resources' | 'activities'> & {
  resources?: ResourceRecord[];
  activities?: ActivityRecord[];
};
export type NewResource = Omit<ResourceRecord, 'id' | 'topicId'>;
export type NewActivity = Omit<ActivityRecord, 'id' | 'topicId'>;

export abstract class LearningRepository {
  abstract getAll(): Promise<ModuleRecord[]>;
  abstract getById(id: number): Promise<ModuleRecord | null>;
  abstract create(data: NewModule): Promise<ModuleRecord>;
  abstract update(id: number, data: Partial<NewModule>): Promise<ModuleRecord>;
  abstract delete(id: number): Promise<void>;
  abstract setStatus(id: number, status: ContentStatus): Promise<ModuleRecord>;
  abstract createTopic(moduleId: number, data: NewTopic): Promise<TopicRecord>;
  abstract updateTopic(moduleId: number, topicId: number, data: Partial<NewTopic>): Promise<TopicRecord>;
  abstract deleteTopic(moduleId: number, topicId: number): Promise<void>;
  abstract createResource(moduleId: number, topicId: number, data: NewResource): Promise<ResourceRecord>;
  abstract updateResource(moduleId: number, topicId: number, resourceId: string, data: Partial<NewResource>): Promise<ResourceRecord>;
  abstract deleteResource(moduleId: number, topicId: number, resourceId: string): Promise<void>;
  abstract createActivity(moduleId: number, topicId: number, data: NewActivity): Promise<ActivityRecord>;
  abstract updateActivity(moduleId: number, topicId: number, activityId: string, data: Partial<NewActivity>): Promise<ActivityRecord>;
  abstract deleteActivity(moduleId: number, topicId: number, activityId: string): Promise<void>;

  async getByTopic(moduleId: number, topicId: number): Promise<TopicRecord | null> {
    const module = await this.getById(moduleId);
    return module?.topics.find(topic => topic.id === topicId) || null;
  }

  async getModuleSummaries(): Promise<ModuleSummary[]> {
    return (await this.getAll())
      .filter(module => module.status === 'ACTIVE')
      .sort((a, b) => a.order - b.order)
      .map(({ id, name, image }) => ({ id, title: name, image }));
  }

  getModules(): Promise<ModuleRecord[]> { return this.getAll(); }
  getModule(id: number): Promise<ModuleRecord | null> { return this.getById(id); }
}
