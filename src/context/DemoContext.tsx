'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Role,
  User,
  Teacher,
  Student,
  ScheduleSlot,
  Appointment,
  RescheduleRequest,
  LessonRecord,
  TeacherDemoVideo,
  StudentPracticeVideo,
} from '@/types';

export interface StudentInfo {
  student: Student;
  user: User;
  instrument: string;
}

// Mock Seed Users & Profiles
export const MOCK_TEACHER_USER: User = {
  id: 'u0000000-0000-0000-0000-000000000001',
  role: 'teacher',
  name: '林佩芬 老師 (Teacher Lin)',
  email: 'lin.teacher@harmony.edu',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};

// 劉心悅 (Lin) (全組統一 Demo 學生，已綁定使用者 LINE ID)
export const MOCK_STUDENT_USER: User = {
  id: '55555555-5555-4555-b555-555555555555',
  role: 'student',
  name: '劉心悅 (Lin)',
  email: 'xinyue.student@harmony.edu',
  avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  line_user_id: 'Uf2457bf35e0d6d3060b60838d9a9c91c', // 使用者指定之 LINE ID
};

// Charles (單一學生帳號，獨立 LINE ID)
export const MOCK_STUDENT_CHARLES_USER: User = {
  id: 'u0000000-0000-0000-0000-000000000003',
  role: 'student',
  name: 'Charles (查爾斯)',
  email: 'charles.student@harmony.edu',
  avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  line_user_id: 'U_student_charles_002',
};

// 林家雙寶家庭（Johnny 強尼）
export const MOCK_STUDENT_JOHNNY_USER: User = {
  id: 'u0000000-0000-0000-0000-000000000004',
  role: 'student',
  name: 'Johnny (強尼)',
  email: 'johnny.student@harmony.edu',
  avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  line_user_id: 'Uf2457bf35e0d6d3060b60838d9a9c91c', // 同樣綁定林媽媽 LINE ID (多小孩家庭)
};

export const MOCK_TEACHER: Teacher = {
  id: 't0000000-0000-0000-0000-000000000001',
  user_id: MOCK_TEACHER_USER.id,
  instrument: '小提琴 (Violin) & 鋼琴 (Piano)',
  bio: '國立音樂學院碩士，10年專業小提琴與古典鋼琴教學經驗。專精於古典演奏與AI音聲診斷。',
};

export const MOCK_STUDENT: Student = {
  id: '55555555-5555-4555-b555-555555555555', // 同學 Supabase 資料庫劉心悅 (Lin) 真實 ID
  user_id: MOCK_STUDENT_USER.id,
  teacher_id: 'ef167dc4-2264-4658-91f1-2eb2418242ab', // 張芷嫣老師 (Piano)
  package_total_lessons: 10,
};

export const MOCK_STUDENT_CHARLES: Student = {
  id: 's0000000-0000-0000-0000-000000000003',
  user_id: MOCK_STUDENT_CHARLES_USER.id,
  teacher_id: MOCK_TEACHER.id,
};

export const MOCK_STUDENT_LIN: Student = MOCK_STUDENT;
export const MOCK_STUDENT_LIN_USER: User = MOCK_STUDENT_USER;

export const MOCK_STUDENT_JOHNNY: Student = {
  id: 's0000000-0000-0000-0000-000000000004',
  user_id: MOCK_STUDENT_JOHNNY_USER.id,
  teacher_id: MOCK_TEACHER.id,
};

export const ALL_MOCK_STUDENTS: StudentInfo[] = [
  { student: MOCK_STUDENT, user: MOCK_STUDENT_USER, instrument: '鋼琴 (Piano)' },
  { student: MOCK_STUDENT_JOHNNY, user: MOCK_STUDENT_JOHNNY_USER, instrument: '小提琴 (Violin)' },
  { student: MOCK_STUDENT_CHARLES, user: MOCK_STUDENT_CHARLES_USER, instrument: '鋼琴 (Piano)' },
];

// Initial Slots
const getDynamicDate = (daysToAdd: number, hours: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysToAdd);
  d.setHours(hours, 0, 0, 0);
  return d.toISOString();
};

const INITIAL_SLOTS: ScheduleSlot[] = [
  {
    id: 'slot-1',
    teacher_id: MOCK_TEACHER.id,
    start_time: getDynamicDate(1, 14),
    end_time: getDynamicDate(1, 15),
    is_available: true,
    location: '音符琴房 A303',
  },
  {
    id: 'slot-2',
    teacher_id: MOCK_TEACHER.id,
    start_time: getDynamicDate(1, 16),
    end_time: getDynamicDate(1, 17),
    is_available: true,
    location: '音符琴房 A303',
  },
  {
    id: 'slot-3',
    teacher_id: MOCK_TEACHER.id,
    start_time: getDynamicDate(2, 10),
    end_time: getDynamicDate(2, 11),
    is_available: true,
    location: '音符琴房 A301',
  },
  {
    id: 'slot-4',
    teacher_id: MOCK_TEACHER.id,
    start_time: getDynamicDate(2, 15),
    end_time: getDynamicDate(2, 16),
    is_available: false,
    location: '音符琴房 A301',
  },
  {
    id: 'slot-5',
    teacher_id: MOCK_TEACHER.id,
    start_time: getDynamicDate(3, 19),
    end_time: getDynamicDate(3, 20),
    is_available: true,
    location: '張老師家中',
  },
  {
    id: 'slot-6',
    teacher_id: MOCK_TEACHER.id,
    start_time: getDynamicDate(4, 14),
    end_time: getDynamicDate(4, 15),
    is_available: true,
    location: '音符琴房 A303',
  },
  {
    id: 'slot-7',
    teacher_id: MOCK_TEACHER.id,
    start_time: getDynamicDate(5, 11),
    end_time: getDynamicDate(5, 12),
    is_available: true,
    location: '音符琴房 A302',
  },
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'app-lin-past-1',
    student_id: MOCK_STUDENT.id,
    student_name: '劉心悅 (Lin)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '張老師 (Teacher Chang)',
    start_time: '2026-08-12T10:00:00+08:00',
    end_time: '2026-08-12T12:00:00+08:00',
    status: 'completed',
    instrument: '鋼琴 (Piano)',
    location: '音符琴房 A303',
    payment_status: 'paid',
    payment_type: 'prepaid',
  },
  {
    id: 'app-lin-past-2',
    student_id: MOCK_STUDENT.id,
    student_name: '劉心悅 (Lin)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '張老師 (Teacher Chang)',
    start_time: '2026-08-19T10:00:00+08:00',
    end_time: '2026-08-19T12:00:00+08:00',
    status: 'completed',
    instrument: '鋼琴 (Piano)',
    location: '音符琴房 A303',
    payment_status: 'paid',
    payment_type: 'prepaid',
  },
  {
    id: 'app-lin-1',
    student_id: MOCK_STUDENT.id,
    student_name: '劉心悅 (Lin)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '張老師 (Teacher Chang)',
    start_time: '2026-08-26T10:00:00+08:00',
    end_time: '2026-08-26T12:00:00+08:00',
    status: 'completed',
    instrument: '鋼琴 (Piano)',
    location: '音符琴房 A303',
    payment_status: 'paid',
    payment_type: 'prepaid',
  },
  {
    id: 'app-lin-2',
    student_id: MOCK_STUDENT.id,
    student_name: '劉心悅 (Lin)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '李老師 (Teacher Lee)',
    start_time: '2026-08-29T14:00:00+08:00',
    end_time: '2026-08-29T15:30:00+08:00',
    status: 'completed',
    instrument: '小提琴 (Violin)',
    location: '交響琴房 B104',
    payment_status: 'paid',
    payment_type: 'prepaid',
  },
  {
    id: 'app-lin-3',
    student_id: MOCK_STUDENT.id,
    student_name: '劉心悅 (Lin)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '張老師 (Teacher Chang)',
    start_time: '2026-09-02T10:00:00+08:00',
    end_time: '2026-09-02T12:00:00+08:00',
    status: 'completed',
    instrument: '鋼琴 (Piano)',
    location: '音符琴房 A303',
    payment_status: 'paid',
    payment_type: 'prepaid',
  },
  {
    id: 'app-lin-urgent',
    student_id: MOCK_STUDENT.id,
    student_name: '劉心悅 (Lin)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '張老師 (Teacher Chang)',
    start_time: '2026-09-05T10:00:00+08:00',
    end_time: '2026-09-05T11:00:00+08:00',
    status: 'confirmed',
    instrument: '古典鋼琴進階',
    location: '音符音樂教室 A303',
    payment_status: 'paid',
    payment_type: 'prepaid',
  },
  {
    id: 'app-lin-4',
    student_id: MOCK_STUDENT.id,
    student_name: '劉心悅 (Lin)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '張老師 (Teacher Chang)',
    start_time: '2026-09-09T10:00:00+08:00',
    end_time: '2026-09-09T12:00:00+08:00',
    status: 'confirmed',
    instrument: '古典鋼琴進階',
    location: '音符琴房 A303',
    payment_status: 'paid',
    payment_type: 'prepaid',
  },
  {
    id: 'app-lin-5',
    student_id: MOCK_STUDENT.id,
    student_name: '劉心悅 (Lin)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '李老師 (Teacher Lee)',
    start_time: '2026-09-12T14:00:00+08:00',
    end_time: '2026-09-12T15:30:00+08:00',
    status: 'confirmed',
    instrument: '視唱練耳基礎',
    location: '交響琴房 B104',
    payment_status: 'paid',
    payment_type: 'prepaid',
  },
  {
    id: 'app-lin-6',
    student_id: MOCK_STUDENT.id,
    student_name: '劉心悅 (Lin)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '張老師 (Teacher Chang)',
    start_time: '2026-09-16T10:00:00+08:00',
    end_time: '2026-09-16T12:00:00+08:00',
    status: 'confirmed',
    instrument: '古典鋼琴進階',
    location: '音符琴房 A303',
    payment_status: 'paid',
    payment_type: 'prepaid',
  },
  {
    id: 'app-lin-7',
    student_id: MOCK_STUDENT.id,
    student_name: '劉心悅 (Lin)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '張老師 (Teacher Chang)',
    start_time: '2026-09-23T10:00:00+08:00',
    end_time: '2026-09-23T12:00:00+08:00',
    status: 'confirmed',
    instrument: '古典鋼琴進階',
    location: '音符琴房 A303',
    payment_status: 'paid',
    payment_type: 'prepaid',
  },
  {
    id: 'app-lin-8',
    student_id: MOCK_STUDENT.id,
    student_name: '劉心悅 (Lin)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '張老師 (Teacher Chang)',
    start_time: '2026-09-30T10:00:00+08:00',
    end_time: '2026-09-30T12:00:00+08:00',
    status: 'confirmed',
    instrument: '古典鋼琴進階',
    location: '音符琴房 A303',
    payment_status: 'paid',
    payment_type: 'prepaid',
  },
  {
    id: 'app-charles-1',
    student_id: MOCK_STUDENT_CHARLES.id,
    student_name: 'Charles',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '張老師 (Teacher Chang)',
    start_time: '2026-08-26T19:30:00+08:00',
    end_time: '2026-08-26T21:30:00+08:00',
    status: 'confirmed',
    instrument: '鋼琴 (Piano)',
    location: '音符琴房 A301',
    payment_status: 'paid',
    payment_type: 'prepaid',
  },
  {
    id: 'app-johnny-1',
    student_id: MOCK_STUDENT_JOHNNY.id,
    student_name: 'Johnny',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '張老師 (Teacher Chang)',
    start_time: '2026-08-24T17:00:00+08:00',
    end_time: '2026-08-24T19:00:00+08:00',
    status: 'confirmed',
    instrument: '小提琴 (Violin)',
    location: '音符琴房 A302',
    payment_status: 'pay_per_lesson',
    payment_type: 'postpaid',
  },
];

const INITIAL_LESSONS: LessonRecord[] = [
  {
    id: 'lesson-1',
    appointment_id: 'app-lin-past-1',
    audio_url: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg',
    raw_transcript: '今天練習整體音高表現不錯，但是到了第24小節換指的地方右手姿勢太緊繃了，導致聲音有點乾硬。樂理部分要特別注意十六分音符的拍子，不要搶拍！回家作業請把第16到32小節用 BPM 72 慢練10遍，把音準跟弓法拉平順。加油！你這周進步很多！',
    clean_summary_json: {
      highlights: ['音高控制穩定', '讀譜速度提升明顯'],
      technical_tips: [
        '右手持弓姿勢注意放鬆，避免過度緊繃，以保持弓速的流暢度與琴弦共鳴。',
        '左手第二指按弦精準度，在高把位轉換時應維持指尖垂直落指，防止音準偏低。',
      ],
      theory_tips: [
        '注意十六分音符的均勻度，切分音符需準確踩在拍點上，不能隨意搶拍。',
        'E大調升分號 (C#) 的按弦位置需特別貼近一指，維持半音關係精準度。',
      ],
      homework: [
        '第15至32小節慢速練習並分段重複10次',
        '錄製一段節拍器輔助的穩定演奏音訊供批改',
        '熟記第一樂章前奏的左手把位指法與弓法',
      ],
      encouragement: '每一次的練習都是進步的累積，老師看到你的努力了！',
      bpm_recommendation: 72,
    },
    created_at: '2026-08-15T10:00:00+08:00',
    song_title: '巴哈：E大調小提琴協奏曲 第一樂章',
    teacher_name: '張老師',
  },
  {
    id: 'lesson-2',
    appointment_id: 'app-lin-past-2',
    audio_url: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg',
    raw_transcript: '今天進行了踏板延音練習與琶音流暢度訓練，整體彈奏節奏掌握得很好。',
    clean_summary_json: {
      highlights: ['踏板切換時機精準', '右手琶音音色均勻'],
      technical_tips: [
        '注意左手伴奏觸鍵輕巧，手腕避免過度下沉以減輕手部負擔。',
        '第48小節強弱對比需更加鮮明，高潮段落注意肩膀放鬆。',
      ],
      theory_tips: [
        '降E大調轉調段落和聲走向需清楚呈現主音穩定度。',
        '裝飾音要輕快俐落，勿佔用主音符拍長。',
      ],
      homework: [
        '每日琶音練習20分鐘並以節拍器校對',
        '全曲完整背譜並錄製第32-64小節影音',
        '慢練左手伴奏分解和弦 10 次',
      ],
      encouragement: '手指獨立性大有進步，旋律線條非常優美！加油！',
      bpm_recommendation: 80,
    },
    created_at: '2026-08-19T10:00:00+08:00',
    song_title: '蕭邦：降E大調夜曲 Op.9 No.2',
    teacher_name: '張老師',
  },
  {
    id: 'lesson-3',
    appointment_id: 'app-lin-1',
    audio_url: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg',
    raw_transcript: '今天重點在於月光第三樂章的狂暴氣勢與連續琶音，整體指法與爆發力都做得非常好。',
    clean_summary_json: {
      highlights: ['急板節奏控制極佳', '左手低音清晰紮實'],
      technical_tips: [
        '主和弦強音著地時肩膀放鬆避免聳肩，藉助重力自然落鍵。',
        '注意中段漸強的音量推進層次，避免過早達到最大音量。',
      ],
      theory_tips: [
        '升C小調調性重音需落於第一拍，維持強烈的戲劇張力。',
        '切分節奏點避免搶拍，手腕隨呼吸彈性調適。',
      ],
      homework: [
        '第 1-32 小節重音加強練習，分組連音慢練5次',
        '每日左手單獨練習 15 分鐘確保觸鍵顆粒分明',
        '錄製一段 BPM 120 穩定彈奏供老師檢視',
      ],
      encouragement: '月光第三樂章的狂暴氣勢有充分展現出來，彈奏極具張力！加油！',
      bpm_recommendation: 132,
    },
    created_at: '2026-08-26T10:00:00+08:00',
    song_title: '貝多芬：第十四號鋼琴奏鳴曲《月光》第三樂章',
    teacher_name: '張老師',
  },
  {
    id: 'lesson-4',
    appointment_id: 'app-lin-2',
    audio_url: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg',
    raw_transcript: '今天進行莫札特小提琴協奏曲的換把位練習，第一把位換至第三把位平順很多。',
    clean_summary_json: {
      highlights: ['第一樂章開頭主題音準精確', '揉弦頻率自然均勻'],
      technical_tips: [
        '第三把位換至第一把位時大拇指保持鬆弛滑移，防止虎口緊掐琴頸。',
        '跳弓部分弓根力量要均勻，依靠弓桿天然彈性起跳。',
      ],
      theory_tips: [
        'G大調自然音階半音關係注意升F音位置。',
        '古典時期典雅樂句收尾需做輕柔收音（diminuendo）。',
      ],
      homework: [
        '換把位音階慢練 5 遍，注意拇指放鬆',
        '第 45-60 小節跳弓慢練，錄製 1 分鐘音訊',
        '重點小節音階節奏打拍練習 10 次',
      ],
      encouragement: '莫札特的優雅韻味掌握得相當出色，音色純淨！加油！',
      bpm_recommendation: 96,
    },
    created_at: '2026-08-29T15:30:00+08:00',
    song_title: '莫札特：G大調第三號小提琴協奏曲 第一樂章',
    teacher_name: '張老師',
  },
  {
    id: 'lesson-5',
    appointment_id: 'app-lin-3',
    audio_url: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg',
    raw_transcript: '今天彈奏德布西月光，弱音觸鍵與色彩表現非常有進步，意境很棒。',
    clean_summary_json: {
      highlights: ['弱音觸鍵細膩動人', '九八拍複合拍子律動自然'],
      technical_tips: [
        '中段高潮處低音踏板及時更換避免混濁，留住乾淨泛音。',
        '琶音聲部像流水般流動，手腕帶動手指輕拂琴鍵。',
      ],
      theory_tips: [
        '降D大調黑鍵手型維持微拱，指尖垂直落指。',
        '注意九八拍大三連音拍點重音分佈。',
      ],
      homework: [
        '全曲踏板乾淨度訓練，慢速背譜彈奏',
        '專注第 27-36 小節雙音色彩層次練習 8 次',
        '錄製一組雙手合奏音檔',
      ],
      encouragement: '印象派的朦朧色彩與詩意表現得非常好，聽得出用心投入的感情！加油！',
      bpm_recommendation: 54,
    },
    created_at: '2026-09-02T10:00:00+08:00',
    song_title: '德布西：《貝加馬斯克組曲》第三首〈月光〉',
    teacher_name: '張老師',
  },
];

const INITIAL_DEMO_VIDEOS: TeacherDemoVideo[] = [
  {
    id: 'demo-1',
    teacher_id: MOCK_TEACHER.id,
    title: '巴哈：E大調協奏曲 第一樂章範例 (張老師示範)',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    midi_data: { bpm: 96, key: 'E Major' },
    tags: ['小提琴', '鋼琴', '經典名曲'],
    pitch_tolerance: 5,
    tempo_tolerance: 8,
    created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
  },
];

const INITIAL_PRACTICE_VIDEOS: StudentPracticeVideo[] = [
  {
    id: 'practice-1',
    student_id: MOCK_STUDENT_LIN.id,
    demo_video_id: 'demo-1',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    ai_feedback_json: {
      overall_score: 88,
      pitch_accuracy: 92,
      rhythm_accuracy: 84,
      bpm_detected: 98,
      summary: '整體演奏流暢度佳！唯獨第 0:14 處節奏出現偏快（搶拍 4%），建議參考右側老師 Demo 調整運指節奏。',
      timeline_markers: [
        {
          time: 5,
          type: 'posture',
          severity: 'good',
          title: '手型姿勢標準',
          description: '手型自然，手腕放鬆適度。',
          recommendation: '保持當前放鬆狀態。',
        },
        {
          time: 14,
          type: 'rhythm',
          severity: 'warning',
          title: '第 16 小節十六分音符搶拍',
          description: '偵測到演奏速度達到 102 BPM（老師範例為 96 BPM）。',
          recommendation: '建議搭配節拍器，在第 14-18 秒處保持穩定踏拍。',
        },
      ],
    },
  },
];

interface DemoContextType {
  isAuthenticated: boolean;
  currentRole: Role;
  currentUser: User;
  teacherProfile: Teacher;
  studentProfile: Student;
  activeStudentId: string;
  isMultiChildParent: boolean;
  linkedStudents: StudentInfo[];
  allStudents: StudentInfo[];
  scheduleSlots: ScheduleSlot[];
  appointments: Appointment[];
  rescheduleRequests: RescheduleRequest[];
  lessonRecords: LessonRecord[];
  demoVideos: TeacherDemoVideo[];
  practiceVideos: StudentPracticeVideo[];
  login: (email: string, pass: string, role: Role) => { success: boolean; message: string };
  logout: () => void;
  switchRole: (role: Role) => void;
  switchStudent: (studentId: string) => void;
  toggleSlotAvailability: (slotId: string) => void;
  addScheduleSlot: (startTime: string, endTime: string) => void;
  requestReschedule: (appointmentId: string, slotId: string, reason?: string) => { success: boolean; message: string };
  requestLeave: (appointmentId: string, reason?: string, notes?: string) => { success: boolean; message: string };
  addLessonRecord: (record: Omit<LessonRecord, 'id' | 'created_at'>) => LessonRecord;
  updateDemoVideo: (id: string, updates: Partial<TeacherDemoVideo>) => void;
  addPracticeVideo: (practice: Omit<StudentPracticeVideo, 'id' | 'created_at'>) => StudentPracticeVideo;
  deletePracticeVideo: (practiceId: string) => void;
  checkInAppointment: (appointmentId: string) => { success: boolean; message: string };
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ROLE: 'musimate_active_role',
  STUDENT_ID: 'musimate_active_student_id',
  AUTH: 'musimate_is_authenticated',
  APPOINTMENTS: 'musimate_appointments_v4',
};

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentRole, setCurrentRole] = useState<Role>('student');
  const [activeStudentId, setActiveStudentId] = useState<string>(MOCK_STUDENT.id);
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>(INITIAL_SLOTS);
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn('Failed to parse cached appointments:', e);
      }
    }
    return INITIAL_APPOINTMENTS;
  });
  const [rescheduleRequests, setRescheduleRequests] = useState<RescheduleRequest[]>([]);
  const [lessonRecords, setLessonRecords] = useState<LessonRecord[]>(INITIAL_LESSONS);
  const [demoVideos, setDemoVideos] = useState<TeacherDemoVideo[]>(INITIAL_DEMO_VIDEOS);
  const [practiceVideos, setPracticeVideos] = useState<StudentPracticeVideo[]>(INITIAL_PRACTICE_VIDEOS);

  // 串接 Supabase 資料庫：載入同學資料庫中劉心悅 (Lin) 的即時課表
  useEffect(() => {
    async function syncSupabaseSchedules() {
      try {
        const { data, error } = await supabase
          .from('schedules')
          .select('*')
          .or(`student_id.eq.${MOCK_STUDENT.id},student_name.ilike.%劉心悅%,student_name.ilike.%Lin%`);

        if (error) {
          console.warn('Supabase schedules query error:', error);
          return;
        }

        if (Array.isArray(data) && data.length > 0) {
          const liveAppts: Appointment[] = data.map((item) => {
            const dateStr = item.date || '2026-09-09';
            const startTimeIso = item.start_time?.includes('T')
              ? item.start_time
              : `${dateStr}T${item.start_time || '10:00'}:00+08:00`;
            const endTimeIso = item.end_time?.includes('T')
              ? item.end_time
              : `${dateStr}T${item.end_time || '12:00'}:00+08:00`;

            return {
              id: item.id || `live-${Date.now()}`,
              student_id: MOCK_STUDENT.id,
              student_name: item.student_name || '劉心悅 (Lin)',
              teacher_id: item.teacher_id || MOCK_TEACHER.id,
              teacher_name: item.teacher_name || '張老師 (Teacher Chang)',
              start_time: startTimeIso,
              end_time: endTimeIso,
              status: 'confirmed',
              instrument: item.instrument || '鋼琴 (Piano)',
              location: item.room || '音符琴房 A303',
              payment_status: 'paid',
              payment_type: 'prepaid',
            };
          });

          setAppointments((prev) => {
            const existingIds = new Set(prev.map((a) => a.id));
            const toAdd = liveAppts.filter((a) => !existingIds.has(a.id));
            if (toAdd.length === 0) return prev;
            return [...prev, ...toAdd];
          });
        }
      } catch (err) {
        console.warn('Failed to sync Supabase schedules:', err);
      }
    }

    syncSupabaseSchedules();
  }, []);

  // 雙重狀態保存機制：初始化時優先讀取 URL 參數與 LocalStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const params = new URLSearchParams(window.location.search);
      const studentParam = params.get('student') || params.get('student_id');
      const lineUserIdParam = params.get('line_user_id');
      const roleParam = params.get('role');

      let initialStudentId = MOCK_STUDENT.id;

      if (studentParam) {
        const found = ALL_MOCK_STUDENTS.find(
          (s) =>
            s.student.id.toLowerCase() === studentParam.toLowerCase() ||
            s.user.name.toLowerCase().includes(studentParam.toLowerCase()) ||
            s.user.id.toLowerCase() === studentParam.toLowerCase()
        );
        if (found) initialStudentId = found.student.id;
      } else if (lineUserIdParam) {
        const found = ALL_MOCK_STUDENTS.find((s) => s.user.line_user_id === lineUserIdParam);
        if (found) initialStudentId = found.student.id;
      } else {
        const savedStudentId = localStorage.getItem(STORAGE_KEYS.STUDENT_ID);
        if (savedStudentId && ALL_MOCK_STUDENTS.some((s) => s.student.id === savedStudentId)) {
          initialStudentId = savedStudentId;
        }
      }

      setActiveStudentId(initialStudentId);
      localStorage.setItem(STORAGE_KEYS.STUDENT_ID, initialStudentId);

      const savedRole = (roleParam as Role) || (localStorage.getItem(STORAGE_KEYS.ROLE) as Role);
      if (savedRole === 'teacher' || savedRole === 'student') {
        setCurrentRole(savedRole);
      }

      const savedAuth = localStorage.getItem(STORAGE_KEYS.AUTH);
      if (savedAuth !== null) {
        setIsAuthenticated(savedAuth === 'true');
      }
    } catch (e) {
      console.warn('LocalStorage read error:', e);
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.STUDENT_ID && e.newValue) {
        setActiveStudentId(e.newValue);
      }
      if (e.key === STORAGE_KEYS.ROLE && (e.newValue === 'teacher' || e.newValue === 'student')) {
        setCurrentRole(e.newValue as Role);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 取得當前學生物件
  const activeStudentInfo =
    ALL_MOCK_STUDENTS.find((s) => s.student.id === activeStudentId) || ALL_MOCK_STUDENTS[0];

  const currentStudentProfile = activeStudentInfo.student;
  const currentStudentUser = activeStudentInfo.user;
  const currentUser = currentRole === 'teacher' ? MOCK_TEACHER_USER : currentStudentUser;

  // 嚴格隱私判定：根據當前學生的 line_user_id 找出該帳號名下所有關聯的小孩
  const linkedStudents = ALL_MOCK_STUDENTS.filter(
    (s) => s.user.line_user_id && s.user.line_user_id === currentStudentUser.line_user_id
  );

  // 只有當同一個 LINE ID 底下有 >= 2 位學生時，才被判定為「多小孩家長 (isMultiChildParent = true)」
  const isMultiChildParent = linkedStudents.length > 1;

  const switchStudent = (studentId: string) => {
    // 限制只能在自己名下的小孩中切換 (若為單一學生則不允許切換為他人)
    const allowedPool = isMultiChildParent ? linkedStudents : [activeStudentInfo];
    const found = allowedPool.find((s) => s.student.id === studentId);
    if (found) {
      setActiveStudentId(found.student.id);
      setCurrentRole('student');
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.STUDENT_ID, found.student.id);
        localStorage.setItem(STORAGE_KEYS.ROLE, 'student');
        localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
      }
    }
  };

  const login = (email: string, pass: string, role: Role) => {
    if (role === 'teacher') {
      if (email.trim() === 'chang.teacher@harmony.edu' && pass === 'teacher123') {
        setCurrentRole('teacher');
        setIsAuthenticated(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.ROLE, 'teacher');
          localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
        }
        return { success: true, message: '登入成功！歡迎張老師。' };
      }
      return { success: false, message: '帳號或密碼錯誤（預設密碼: teacher123）' };
    } else {
      const studentMatch = ALL_MOCK_STUDENTS.find((s) => s.user.email.trim() === email.trim());
      if (studentMatch && pass === 'student123') {
        setActiveStudentId(studentMatch.student.id);
        setCurrentRole('student');
        setIsAuthenticated(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.STUDENT_ID, studentMatch.student.id);
          localStorage.setItem(STORAGE_KEYS.ROLE, 'student');
          localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
        }
        return { success: true, message: `登入成功！歡迎 ${studentMatch.user.name}。` };
      }
      return { success: false, message: '帳號或密碼錯誤（預設密碼: student123）' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.AUTH, 'false');
    }
  };

  const switchRole = (role: Role) => {
    setCurrentRole(role);
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ROLE, role);
      localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
    }
  };

  const toggleSlotAvailability = (slotId: string) => {
    setScheduleSlots((prev) =>
      prev.map((slot) => (slot.id === slotId ? { ...slot, is_available: !slot.is_available } : slot))
    );
  };

  const addScheduleSlot = (startTime: string, endTime: string) => {
    const newSlot: ScheduleSlot = {
      id: `slot-${Date.now()}`,
      teacher_id: MOCK_TEACHER.id,
      start_time: startTime,
      end_time: endTime,
      is_available: true,
    };
    setScheduleSlots((prev) => [...prev, newSlot]);
  };

  const requestReschedule = (appointmentId: string, slotIdOrTime: string, reason?: string) => {
    const targetSlot = scheduleSlots.find((s) => s.id === slotIdOrTime || s.start_time === slotIdOrTime);
    const newStart = targetSlot ? targetSlot.start_time : slotIdOrTime;
    const newEnd = targetSlot ? targetSlot.end_time : new Date(new Date(newStart).getTime() + 2 * 3600 * 1000).toISOString();
    const newLoc = targetSlot?.location || '音符琴房 A303';

    const targetApp = appointments.find((a) => a.id === appointmentId);
    if (!targetApp) {
      return { success: false, message: '找不到欲調課的舊課程。' };
    }

    if (targetSlot) {
      setScheduleSlots((prev) =>
        prev.map((s) => (s.id === targetSlot.id ? { ...s, is_available: false } : s))
      );
    }

    const nowPivot = typeof window !== 'undefined' && new Date().getFullYear() >= 2026
      ? new Date().getTime()
      : new Date('2026-09-04T12:00:00+08:00').getTime();
    const isUrgent = (new Date(targetApp.start_time).getTime() - nowPivot) < 24 * 60 * 60 * 1000;

    setAppointments((prev) => {
      const updated = prev.map((app) =>
        app.id === appointmentId
          ? {
              ...app,
              start_time: newStart,
              end_time: newEnd,
              location: newLoc,
              status: 'rescheduled' as const,
              notes: isUrgent
                ? `[課前24H內調課 - 依規扣款手續費] 已調課至 ${newStart.split('T')[0]} (${reason || '學員自主線上調課'})`
                : `已調課至 ${newStart.split('T')[0]} (${reason || '學員自主線上調課'})`,
            }
          : app
      );
      try {
        localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to persist reschedule:', e);
      }
      return updated;
    });

    return {
      success: true,
      message: isUrgent
        ? '⚠️ 調課已確認送出！因距開課不足 24 小時，系統已依規定扣除該堂課費用/時數，新時段已同步張老師。'
        : '調課成功！舊課程已成功移至新時段，全站與老師端課表已即時同步連動。',
    };
  };

  const requestLeave = (appointmentId: string, reason?: string, notes?: string) => {
    const targetApp = appointments.find((a) => a.id === appointmentId);
    if (!targetApp) {
      return { success: false, message: '找不到欲請假的課程。' };
    }

    const nowPivot = typeof window !== 'undefined' && new Date().getFullYear() >= 2026
      ? new Date().getTime()
      : new Date('2026-09-04T12:00:00+08:00').getTime();
    const isUrgent = (new Date(targetApp.start_time).getTime() - nowPivot) < 24 * 60 * 60 * 1000;

    setAppointments((prev) => {
      const updated = prev.map((app) =>
        app.id === appointmentId
          ? {
              ...app,
              status: 'cancelled' as const,
              notes: isUrgent
                ? `[課前24H內臨時請假 - 依規扣款1堂] 請假原因：${reason || '個人行程'} ${notes ? `(${notes})` : ''}`
                : `請假原因：${reason || '個人行程'} ${notes ? `(${notes})` : ''}`,
            }
          : app
      );
      try {
        localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to persist leave:', e);
      }
      return updated;
    });

    return {
      success: true,
      message: isUrgent
        ? '⚠️ 請假申請已送出！因距離開課不足 24 小時，系統已依規定扣除該堂課時數與學費（扣款 1 堂）。'
        : '請假申請已送出！該堂課時數已完整保留至您的剩餘課堂額度。',
    };
  };

  const addLessonRecord = (recordData: Omit<LessonRecord, 'id' | 'created_at'>) => {
    const newRecord: LessonRecord = {
      ...recordData,
      id: `lesson-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setLessonRecords((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  const updateDemoVideo = (id: string, updates: Partial<TeacherDemoVideo>) => {
    setDemoVideos((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates } : v))
    );
  };

  const addPracticeVideo = (practiceData: Omit<StudentPracticeVideo, 'id' | 'created_at'>) => {
    const newPractice: StudentPracticeVideo = {
      ...practiceData,
      id: `practice-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setPracticeVideos((prev) => [newPractice, ...prev]);
    return newPractice;
  };

  const deletePracticeVideo = (practiceId: string) => {
    setPracticeVideos((prev) => prev.filter((p) => p.id !== practiceId));
  };

  const checkInAppointment = (appointmentId: string) => {
    setAppointments((prev) => {
      const updated = prev.map((app) =>
        app.id === appointmentId
          ? {
              ...app,
              status: 'attended' as any,
              attendance: 'attended',
            }
          : app
      );
      try {
        localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to persist checkin:', e);
      }
      return updated;
    });
    return { success: true, message: '報到打卡成功！已為您記錄出席並即時同步至資料庫。' };
  };

  return (
    <DemoContext.Provider
      value={{
        isAuthenticated,
        currentRole,
        currentUser,
        teacherProfile: MOCK_TEACHER,
        studentProfile: currentStudentProfile,
        activeStudentId,
        isMultiChildParent,
        linkedStudents,
        allStudents: ALL_MOCK_STUDENTS,
        scheduleSlots,
        appointments,
        rescheduleRequests,
        lessonRecords,
        demoVideos,
        practiceVideos,
        login,
        logout,
        switchRole,
        switchStudent,
        toggleSlotAvailability,
        addScheduleSlot,
        requestReschedule,
        requestLeave,
        addLessonRecord,
        updateDemoVideo,
        addPracticeVideo,
        deletePracticeVideo,
        checkInAppointment,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export const useDemoContext = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemoContext must be used within a DemoProvider');
  }
  return context;
};
