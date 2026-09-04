export type Role = 'teacher' | 'student';

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  avatar_url?: string;
  line_user_id?: string; // [新增] LINE User ID 欄位 (供 LINE LIFF / Bot 自動綁定)
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
  package_total_lessons?: number; // [新增] 本期總購買堂數 (預設 10 堂)
}

export interface ScheduleSlot {
  id: string;
  teacher_id: string;
  start_time: string; // ISO string
  end_time: string;   // ISO string
  is_available: boolean;
  location?: string;  // [新增] 上課地點/琴房 (例如: 音符琴房 A303, 張老師家中)
}

export type AppointmentStatus = 'confirmed' | 'cancelled' | 'rescheduled' | 'attended' | 'completed';

export interface Appointment {
  id: string;
  student_id: string;
  student_name?: string;
  teacher_id: string;
  teacher_name?: string; // [新增] 授課教師姓名
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  instrument?: string; // [新增] 上課科目/樂器 (例如: 鋼琴 (Piano))
  location?: string;   // [新增] 上課地點/琴房 (例如: 音符琴房 A303, 張老師家中)
  payment_status?: 'paid' | 'unpaid' | 'pay_per_lesson'; // [新增] 繳費狀態: paid(已繳費) / unpaid(未繳費) / pay_per_lesson(每堂完成後繳費)
  payment_type?: 'prepaid' | 'postpaid'; // [新增] 繳費模式: prepaid(包堂預付) / postpaid(單堂後付)
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
  time: number; // in seconds
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
