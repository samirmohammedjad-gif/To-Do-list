
export enum StudentLevel {
  MIDDLE_SCHOOL = 'Middle School',
  HIGH_SCHOOL = 'High School',
  UNDERGRAD = 'Undergraduate',
  POSTGRAD = 'Postgraduate'
}

export type LessonStatus = 'pending' | 'reading' | 'homework' | 'review' | 'mastered';

export interface Lesson {
  id: string;
  title: string;
  status: LessonStatus;
}

export interface Unit {
  id: string;
  title: string;
  lessons: Lesson[];
}

// New Interface for Detailed Study Config
export type BacklogItemType = 'chapter' | 'unit' | 'lesson' | 'lecture';

export interface StudyConfig {
  accumulatedChapters: number; // Kept for backward compatibility
  
  // New Fields
  backlogType: BacklogItemType;
  backlogCount: number;
  itemDuration: number; // e.g. Lecture duration in hours
  studyDuration: number; // Time needed to study/solve in hours
  
  mode: 'online' | 'center';
  studyHoursPerDay: number;
  studyDays: string[]; // This is generally study availability
  lectureDays: string[]; // NEW: Specific days when lectures are released/attended (e.g. ['Sat', 'Tue'])
}

export interface Course {
  id: string;
  name: string;
  teacherName?: string; 
  studyMode?: 'online' | 'offline'; 
  credits: number; 
  difficulty: 'Easy' | 'Medium' | 'Hard';
  color: string;
  currentGrade?: number; 
  targetGrade?: number; 
  units: Unit[];
  studyConfig?: StudyConfig; 
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  courseId?: string;
  dueDate: string; // ISO string
  isCompleted: boolean;
  priority: 'Low' | 'Medium' | 'High';
}

export interface UserStats {
  level: number;
  xp: number;
  streakDays: number;
  totalFocusMinutes: number;
  tasksCompleted: number;
  masteryScore: number;
}

// --- NEW TYPES FOR LIFE MANAGER ---

export type ActivityType = 'study' | 'prayer' | 'sport' | 'sleep' | 'rest' | 'meal';

export interface ScheduleBlock {
  id: string;
  title: string;
  type: ActivityType;
  startTime: string; // HH:MM
  durationMinutes: number;
  isCompleted: boolean;
}

export interface HealthLog {
  date: string; // ISO Date only
  waterCups: number; // Target 8
  sleepHours: number; // Target 7-8
  mood: 'happy' | 'stressed' | 'tired' | 'neutral';
}

export interface ResourceItem {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'link' | 'book';
  url?: string;
  courseId?: string; // Optional linkage to a subject
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

// Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastModified: number;
}

// --- NEW VIDEO LIBRARY TYPES ---
export type VideoCategory = 'explanation' | 'revision' | 'exam';
export type SubjectTrack = 'common' | 'science' | 'math' | 'arts';

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  image?: string;
}

export interface VideoLesson {
  id: string;
  title: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  category: VideoCategory;
  thumbnailUrl: string;
  youtubeId: string; // The ID part of the URL
  duration: string;
  views: string;
  track: SubjectTrack[]; // Who is this for?
}

// --- AI PLAN TYPES (UPDATED) ---
export interface PlanTask {
  subject: string;
  type: 'Lecture' | 'Backlog' | 'Revision';
  details: string; // "New Lecture: Chapter 3" or "Backlog: Unit 1"
  duration: number; // Hours
}

export interface DailyPlan {
  day: string; // Saturday, Sunday, etc.
  tasks: PlanTask[];
  totalHours: number;
}

// Keep simpler type for generic table if needed, but WeeklyPlan is main now
export type BacklogPlanItem = DailyPlan;
