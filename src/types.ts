export type PriorityLevel = 'low' | 'medium' | 'high';
export type Timeframe = 'daily' | 'weekly' | 'monthly';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: PriorityLevel;
  dueDate: string; // YYYY-MM-DD
  completed: boolean;
  subject?: string;
  estimatedHours?: number;
}

export interface StudyGoal {
  id: string;
  title: string;
  timeframe: Timeframe;
  currentProgress: number;
  targetValue: number;
  unit: string; // e.g. "hours", "chapters", "tasks"
  completed: boolean;
}

export interface StudySession {
  id: string;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  subject?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  lastUpdated: string; // ISO string
  color: string; // Tailwind background color class
}

export interface ScheduleItem {
  id: string;
  time: string; // HH:MM
  title: string;
  subject?: string;
  completed: boolean;
}
