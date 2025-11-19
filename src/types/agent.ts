import { Task } from './task';

export type AgentType =
  | 'task_list'
  | 'daily_notes'
  | 'calendar_events'
  | 'function_call';

export interface AgentOutput {
  agentType: AgentType;
  data: any;
  voiceResponse: boolean; // Should AI speak this response?
  responseText?: string; // What AI should say (if voiceResponse=true)
}

export interface TaskListOutput {
  name: string;
  data: Task[];
}

export interface DailyNoteOutput {
  note: string;
  timestamp: Date;
  tags: string[];
}

export interface CalendarEventOutput {
  title: string;
  date: string;
  duration: number; // minutes
  description?: string;
}

export interface FunctionCallOutput {
  function: 'mute' | 'unmute';
  reason: string;
}
