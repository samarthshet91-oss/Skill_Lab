export type UserRole = 'STUDENT' | 'ADMIN';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  student_number?: string;
  mobile_number?: string;
  cohort?: string;
  created_at?: string;
}

export type ModuleStatus = 'COMPLETED' | 'IN PROGRESS' | 'UNLOCKED' | 'LOCKED';

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string;
  duration_minutes: number;
  order_index: number;
  is_completed?: boolean;
}

export interface ModuleItem {
  id: string;
  title: string;
  description: string;
  order_index: number;
  status: ModuleStatus;
  lesson_count: number;
  completed_lessons?: number;
  lessons: Lesson[];
  locked_by_admin?: boolean;
  color_accent?: string;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';
export type AttendanceSessionStatus = 'SCHEDULED' | 'ACTIVE' | 'CLOSED';

export interface AttendanceRecord {
  id: string;
  session_id: string;
  date: string;
  topic: string;
  status: AttendanceStatus;
  student_id: string;
  student_name?: string;
  student_number?: string;
  notes?: string;
  submitted_at?: string;
}

export interface AttendanceSession {
  id: string;
  date: string;
  topic: string;
  batch: string;
  created_at: string;
  start_time?: string;
  end_time?: string;
  status?: AttendanceSessionStatus;
  present_count: number;
  absent_count: number;
  late_count?: number;
  total_students?: number;
  records: {
    student_id: string;
    student_name: string;
    student_number?: string;
    status: AttendanceStatus;
    submitted_at?: string;
  }[];
}

export type ResourceType = 'PDF' | 'ZIP' | 'CODE' | 'CHEATSHEET' | 'NOTES';

export interface LearningResource {
  id: string;
  title: string;
  description: string;
  file_type: ResourceType;
  file_size: string;
  file_path: string;
  module_id?: string;
  module_title?: string;
  download_count: number;
  created_at: string;
  author_name?: string;
}

export interface StudentProgressSummary {
  student_id: string;
  student_name: string;
  student_email: string;
  student_number: string;
  avatar_url: string;
  overall_progress: number; // 0 - 100
  attendance_percentage: number; // 0 - 100
  current_module: string;
  completed_lessons_count: number;
  total_lessons_count: number;
  last_active: string;
  status: 'ACTIVE' | 'NEEDS_ATTENTION' | 'ON_TRACK';
}

export interface SkillBotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  context_module?: string;
  practice_prompt?: string;
  suggested_questions?: string[];
}
