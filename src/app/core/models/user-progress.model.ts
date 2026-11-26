export type ProgressStatus = 'IN_PROGRESS' | 'COMPLETED';

export interface UserProgress {
  id: string;
  userId: string;
  moduleId: number;
  topicId: number | null;
  activityId: string | null;
  status: ProgressStatus;
  completedAt: string | null;
}
