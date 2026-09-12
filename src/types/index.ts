// ============================================================================
// MusiMate (Studio OS) — Unified TypeScript Interfaces for Student LIFF
// File: src/web-liff/src/types/index.ts
// ============================================================================

export type LessonStatus = 
  | 'SCHEDULED'
  | 'STUDENT_ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'CANCELLED_EXEMPT'
  | 'RESCHEDULED'
  | 'NO_SHOW_PENDING'
  | 'NO_SHOW_CONFIRMED'
  | 'RESCHEDULE_REQUESTED';

export type AttendanceStatus = 'pending' | 'attended' | 'leave' | 'no_show';

export interface StudentProfile {
  id: string;
  user_id?: string;
  name: string;
  email?: string;
  avatar_url?: string;
  line_user_id?: string;
  default_instrument: string;
  rate_per_lesson: number;
}

export interface TeacherProfile {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  hourly_rate: number;
}

export interface LessonItem {
  id: string;
  student_id: string;
  teacher_id: string;
  teacher_name: string;
  start_time: string;
  end_time: string;
  location: string;
  status: LessonStatus | string;
  instrument: string;
  memo_notes?: string;
  student_checkin_at?: string | null;
  lesson_index?: number | null;
  is_leave?: boolean;
  is_rescheduled?: boolean;
  is_pending_reschedule?: boolean;
  pending_request_id?: string | null;
  pending_reschedule_reason?: string | null;
  total_lessons?: number;
}

export interface PracticeLog {
  id: string;
  student_id?: string;
  lesson_id?: string;
  title?: string;
  song_title?: string;
  date?: string;
  duration_minutes?: number;
  duration_seconds?: number;
  bpm?: number;
  bpm_stability?: number;
  bpm_stability_score?: number;
  tempo_deviation_percent?: number;
  pitch_score?: number;
  pitch_accuracy_score?: number;
  ai_feedback_draft?: string;
  teacher_feedback?: string;
  status?: string;
  created_at?: string;
  media_url?: string;
  audio_url?: string;
}

export interface AvailabilitySlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  teacher_name: string;
  location: string;
  available: boolean;
}

export interface RescheduleRequestItem {
  id: string;
  lesson_id: string;
  target_slot_id?: string;
  original_time?: string;
  target_time?: string;
  reason: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | string;
  created_at: string;
}

export interface LessonReportItem {
  id: string;
  lesson_id: string;
  lesson_index: number;
  lesson_title: string;
  date: string;
  summary: string;
  technique_tips: string[];
  assignment: {
    song: string;
    target_bpm: number;
    daily_minutes: number;
  };
}

export interface ContractBillingInfo {
  contract_id?: string;
  contract_no?: string;
  total_lessons?: number;
  remaining_lessons?: number;
  completed_lessons?: number;
  rate_per_lesson?: number;
  total_paid_amount?: number;
  total_amount?: number;
  payment_mode?: 'PREPAID_10' | 'PAY_PER_LESSON';
  teacher_name?: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  invoice_status?: 'PENDING_PAYMENT' | 'PAID' | 'TRANSFERRED_CONFIRMING' | 'OVERDUE' | string;
  due_date?: string;
  invoices?: Array<{
    id: string;
    invoice_no: string;
    amount: number;
    status: 'PAID' | 'PENDING' | 'OVERDUE';
    paid_at?: string;
    due_date: string;
  }>;
}

// ============================================================================
// Extended UI & Video Comparison Types (from MusiMate Student Portal)
// ============================================================================

export type Role = 'teacher' | 'student';

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  avatar_url?: string;
  line_user_id?: string;
}

export interface Teacher {
  id: string;
  user_id: string;
  instrument: string;
  bio: string;
}

export interface Student {
  id: string;
  user_id: string;
  teacher_id: string;
  package_total_lessons?: number;
}

export interface ScheduleSlot {
  id: string;
  teacher_id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  location?: string;
}

export type AppointmentStatus = 'confirmed' | 'cancelled' | 'rescheduled' | 'attended' | 'completed';

export interface Appointment {
  id: string;
  student_id: string;
  student_name?: string;
  teacher_id: string;
  teacher_name?: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  instrument?: string;
  location?: string;
  payment_status?: 'paid' | 'unpaid' | 'pay_per_lesson';
  payment_type?: 'prepaid' | 'postpaid';
}

export interface AvailableSlotResponse {
  slot_id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  clash_reason?: string;
}

export type RescheduleStatus = 'pending' | 'approved' | 'rejected';

export interface RescheduleRequest {
  id: string;
  appointment_id: string;
  requested_slot_id: string;
  status: RescheduleStatus;
  reason?: string;
  created_at: string;
}

export interface CleanSummaryJSON {
  highlights: string[];
  technical_tips: string[];
  theory_tips?: string[];
  homework: string[];
  encouragement: string;
  bpm_recommendation?: number;
}

export interface LessonRecord {
  id: string;
  appointment_id: string;
  audio_url?: string;
  raw_transcript: string;
  clean_summary_json: CleanSummaryJSON;
  created_at: string;
  song_title?: string;
  teacher_name?: string;
}

export interface TeacherDemoVideo {
  id: string;
  teacher_id: string;
  title: string;
  video_url: string;
  midi_data?: {
    bpm: number;
    key: string;
  };
  tags: string[];
  pitch_tolerance: number;
  tempo_tolerance: number;
  created_at?: string;
}

export interface TimelineMarker {
  time: number;
  type: 'pitch' | 'rhythm' | 'posture';
  severity: 'error' | 'warning' | 'good';
  title: string;
  description: string;
  recommendation: string;
}

export interface AIFeedbackJSON {
  overall_score: number;
  pitch_accuracy: number;
  rhythm_accuracy: number;
  bpm_detected: number;
  timeline_markers: TimelineMarker[];
  summary: string;
}

export interface StudentPracticeVideo {
  id: string;
  student_id: string;
  demo_video_id: string;
  video_url: string;
  ai_feedback_json: AIFeedbackJSON;
  created_at: string;
}

export type AvailableSlot = AvailabilitySlot;
