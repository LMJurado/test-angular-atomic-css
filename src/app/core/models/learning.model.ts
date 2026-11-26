export type ContentStatus = 'ACTIVE' | 'INACTIVE';
export type ResourceType = 'video' | 'document' | 'link';
export type ActivityType = 'interactive' | 'assignment' | 'evaluation';

export interface ResourceRecord {
  id: string;
  topicId: number;
  title: string;
  type: ResourceType;
  url: string;
  description: string;
}

export interface ActivityRecord {
  id: string;
  topicId: number;
  title: string;
  type: ActivityType;
  description: string;
  configuration: Record<string, unknown>;
  status: ContentStatus;
}

export interface TopicRecord {
  id: number;
  key: string;
  moduleId: number;
  title: string;
  description: string;
  image: string;
  order: number;
  status: ContentStatus;
  resources: ResourceRecord[];
  activities: ActivityRecord[];
}

export interface ModuleRecord {
  id: number;
  name: string;
  breadcrumb: string;
  description: string;
  image: string;
  order: number;
  status: ContentStatus;
  topics: TopicRecord[];
}

export interface ModuleSummary {
  id: number;
  title: string;
  image: string;
}
