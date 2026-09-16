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

// 許雅婷 (Charles / 查爾斯) (林佩芬名師學員，已綁定 Charles LINE ID)
export const MOCK_STUDENT_CHARLES_USER: User = {
  id: '89e45974-7f00-4bfd-bd84-3eb26351a150',
  role: 'student',
  name: '許雅婷 (Charles / 查爾斯)',
  email: 'charles.student@harmony.edu',
  avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  line_user_id: 'U26ed3c0e48864aebdc244594cf780df0',
};

// 學員：陳子翔 (Johnny / 阿堅) (已綁定 Johnny LINE ID)
export const MOCK_STUDENT_JOHNNY_USER: User = {
  id: 'b0000000-0000-0000-0000-000000000001',
  role: 'student',
  name: '陳子翔 (Johnny / 阿堅)',
  email: 'zixiang.student@harmony.edu',
  avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  line_user_id: 'U2a2f432d824e353e8eb3fbe579def2cf',
};

// 陳子翔 (Chen Zi-xiang)
export const MOCK_STUDENT_CHEN_USER: User = {
  id: 'b0000000-0000-0000-0000-000000000001',
  role: 'student',
  name: '陳子翔 (Johnny / 阿堅)',
  email: 'chen.student@harmony.edu',
  avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  line_user_id: 'U2a2f432d824e353e8eb3fbe579def2cf',
};

export const MOCK_TEACHER: Teacher = {
  id: 'df637b26-7cab-443b-8801-4361fb35afdd',
  user_id: MOCK_TEACHER_USER.id,
  instrument: '古典鋼琴 · 流行爵士鋼琴',
  bio: '國立維也納音樂學院碩士，具備 12 年教學資歷，專注於觸鍵音色與音樂詮釋。',
};

export const MOCK_STUDENT: Student = {
  id: '55555555-5555-4555-b555-555555555555', // 同學 Supabase 資料庫劉心悅 (Lin) 真實 ID
  user_id: MOCK_STUDENT_USER.id,
  teacher_id: 'df637b26-7cab-443b-8801-4361fb35afdd', // 林佩芬老師 (Piano)
  package_total_lessons: 10,
};

export const MOCK_STUDENT_CHARLES: Student = {
  id: '89e45974-7f00-4bfd-bd84-3eb26351a150',
  user_id: MOCK_STUDENT_CHARLES_USER.id,
  teacher_id: MOCK_TEACHER.id,
  package_total_lessons: 10,
};

export const MOCK_STUDENT_LIN: Student = MOCK_STUDENT;
export const MOCK_STUDENT_LIN_USER: User = MOCK_STUDENT_USER;

export const MOCK_STUDENT_JOHNNY: Student = {
  id: 'b0000000-0000-0000-0000-000000000001',
  user_id: MOCK_STUDENT_JOHNNY_USER.id,
  teacher_id: MOCK_TEACHER.id,
};

export const MOCK_STUDENT_CHEN: Student = {
  id: 'b0000000-0000-0000-0000-000000000001',
  user_id: MOCK_STUDENT_CHEN_USER.id,
  teacher_id: MOCK_TEACHER.id,
  package_total_lessons: 10,
};

export const ALL_MOCK_STUDENTS: StudentInfo[] = [
  { student: MOCK_STUDENT, user: MOCK_STUDENT_USER, instrument: '古典鋼琴 (Piano)' },
  { student: MOCK_STUDENT_CHARLES, user: MOCK_STUDENT_CHARLES_USER, instrument: '古典鋼琴 (Piano)' },
  { student: MOCK_STUDENT_JOHNNY, user: MOCK_STUDENT_JOHNNY_USER, instrument: '古典鋼琴 (Piano)' },
];

export const NEW_STUDENT_USER: User = {
  id: 'new_student',
  role: 'student',
  name: '新生訪客',
  email: 'guest@musimate.app',
  avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
};

export const NEW_STUDENT: Student = {
  id: 'new_student',
  user_id: 'new_student',
  teacher_id: 'df637b26-7cab-443b-8801-4361fb35afdd',
  package_total_lessons: 0,
};

export const NEW_STUDENT_INFO: StudentInfo = {
  student: NEW_STUDENT,
  user: NEW_STUDENT_USER,
  instrument: '探索 8 大樂器',
};

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
    location: '林佩芬老師音樂工作室',
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
  // ===== 劉心悅 (Lin) 第 3 期：共 10 堂 (6 堂已完成 + 4 堂即將上課) =====
  {
    id: 'app-lin-past-1',
    contract_id: 'contract-lin-term-3',
    term_period: 3,
    student_id: MOCK_STUDENT.id,
    student_name: '劉心悅 (Lin)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-08-15T10:00:00+08:00',
    end_time: '2026-08-15T12:00:00+08:00',
    status: 'completed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A303',
    payment_status: 'paid',
    payment_type: 'prepaid',
  },
  {
    id: 'app-lin-past-2',
    contract_id: 'contract-lin-term-3',
    term_period: 3,
    student_id: MOCK_STUDENT.id,
    student_name: '劉心悅 (Lin)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-08-19T10:00:00+08:00',
    end_time: '2026-08-19T12:00:00+08:00',
    status: 'completed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A303',
    payment_status: 'paid',
    payment_type: 'prepaid',
  },
  {
    id: 'app-lin-1',
    contract_id: 'contract-lin-term-3',
    term_period: 3,
    student_id: MOCK_STUDENT.id,
    student_name: '劉心悅 (Lin)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-08-26T10:00:00+08:00',
    end_time: '2026-08-26T12:00:00+08:00',
    status: 'completed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A303',
    payment_status: 'pay_per_lesson',
    payment_type: 'postpaid',
  },
  {
    id: 'app-lin-2',
    contract_id: 'contract-lin-term-3',
    term_period: 3,
    student_id: MOCK_STUDENT.id,
    student_name: '劉心悅 (Lin)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-08-29T10:00:00+08:00',
    end_time: '2026-08-29T12:00:00+08:00',
    status: 'completed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A303',
    payment_status: 'pay_per_lesson',
    payment_type: 'postpaid',
  },
  {
    id: 'app-lin-3',
    contract_id: 'contract-lin-term-3',
    term_period: 3,
    student_id: MOCK_STUDENT.id,
    student_name: '劉心悅 (Lin)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-09-02T10:00:00+08:00',
    end_time: '2026-09-02T12:00:00+08:00',
    status: 'completed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A303',
    payment_status: 'pay_per_lesson',
    payment_type: 'postpaid',
  },
  {
    id: 'app-lin-4',
    contract_id: 'contract-lin-term-3',
    term_period: 3,
    student_id: MOCK_STUDENT.id,
    student_name: '劉心悅 (Lin)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-09-09T10:00:00+08:00',
    end_time: '2026-09-09T12:00:00+08:00',
    status: 'completed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A303',
    payment_status: 'pay_per_lesson',
    payment_type: 'postpaid',
  },
  {
    id: 'app-lin-6',
    contract_id: 'contract-lin-term-3',
    term_period: 3,
    student_id: MOCK_STUDENT.id,
    student_name: '劉心悅 (Lin)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-09-16T10:00:00+08:00',
    end_time: '2026-09-16T12:00:00+08:00',
    status: 'confirmed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A303',
    payment_status: 'pay_per_lesson',
    payment_type: 'postpaid',
  },
  {
    id: 'app-lin-7',
    contract_id: 'contract-lin-term-3',
    term_period: 3,
    student_id: MOCK_STUDENT.id,
    student_name: '劉心悅 (Lin)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-09-19T14:00:00+08:00',
    end_time: '2026-09-19T16:00:00+08:00',
    status: 'confirmed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A303',
    payment_status: 'pay_per_lesson',
    payment_type: 'postpaid',
  },
  {
    id: 'app-lin-8',
    contract_id: 'contract-lin-term-3',
    term_period: 3,
    student_id: MOCK_STUDENT.id,
    student_name: '劉心悅 (Lin)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-09-23T10:00:00+08:00',
    end_time: '2026-09-23T12:00:00+08:00',
    status: 'confirmed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A303',
    payment_status: 'pay_per_lesson',
    payment_type: 'postpaid',
  },
  {
    id: 'app-lin-9',
    contract_id: 'contract-lin-term-3',
    term_period: 3,
    student_id: MOCK_STUDENT.id,
    student_name: '劉心悅 (Lin)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-09-30T10:00:00+08:00',
    end_time: '2026-09-30T12:00:00+08:00',
    status: 'confirmed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A303',
    payment_status: 'pay_per_lesson',
    payment_type: 'postpaid',
  },
  // ===== 劉心悅 (Lin) 第 4 期：已排定 10 堂 =====
  {
    id: 'app-lin-p4-1',
    contract_id: 'contract-lin-term-4',
    term_period: 4,
    student_id: MOCK_STUDENT.id,
    student_name: '劉心悅 (Lin)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-10-06T19:00:00+08:00',
    end_time: '2026-10-06T21:00:00+08:00',
    status: 'confirmed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A303',
    payment_status: 'pay_per_lesson',
    payment_type: 'postpaid',
  },
  {
    id: 'app-lin-p4-2',
    contract_id: 'contract-lin-term-4',
    term_period: 4,
    student_id: MOCK_STUDENT.id,
    student_name: '劉心悅 (Lin)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-10-13T19:00:00+08:00',
    end_time: '2026-10-13T21:00:00+08:00',
    status: 'confirmed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A303',
    payment_status: 'pay_per_lesson',
    payment_type: 'postpaid',
  },
  {
    id: 'app-lin-p4-3',
    contract_id: 'contract-lin-term-4',
    term_period: 4,
    student_id: MOCK_STUDENT.id,
    student_name: '劉心悅 (Lin)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-10-20T19:00:00+08:00',
    end_time: '2026-10-20T21:00:00+08:00',
    status: 'confirmed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A303',
    payment_status: 'pay_per_lesson',
    payment_type: 'postpaid',
  },
  {
    id: 'app-lin-p4-4',
    contract_id: 'contract-lin-term-4',
    term_period: 4,
    student_id: MOCK_STUDENT.id,
    student_name: '劉心悅 (Lin)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-10-27T19:00:00+08:00',
    end_time: '2026-10-27T21:00:00+08:00',
    status: 'confirmed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A303',
    payment_status: 'pay_per_lesson',
    payment_type: 'postpaid',
  },
  {
    id: 'app-lin-p4-5',
    contract_id: 'contract-lin-term-4',
    term_period: 4,
    student_id: MOCK_STUDENT.id,
    student_name: '劉心悅 (Lin)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-11-03T19:00:00+08:00',
    end_time: '2026-11-03T21:00:00+08:00',
    status: 'confirmed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A303',
    payment_status: 'pay_per_lesson',
    payment_type: 'postpaid',
  },
  {
    id: 'app-lin-p4-6',
    contract_id: 'contract-lin-term-4',
    term_period: 4,
    student_id: MOCK_STUDENT.id,
    student_name: '劉心悅 (Lin)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-11-10T19:00:00+08:00',
    end_time: '2026-11-10T21:00:00+08:00',
    status: 'confirmed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A303',
    payment_status: 'pay_per_lesson',
    payment_type: 'postpaid',
  },
  {
    id: 'app-lin-p4-7',
    contract_id: 'contract-lin-term-4',
    term_period: 4,
    student_id: MOCK_STUDENT.id,
    student_name: '劉心悅 (Lin)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-11-17T19:00:00+08:00',
    end_time: '2026-11-17T21:00:00+08:00',
    status: 'confirmed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A303',
    payment_status: 'pay_per_lesson',
    payment_type: 'postpaid',
  },
  {
    id: 'app-lin-p4-8',
    contract_id: 'contract-lin-term-4',
    term_period: 4,
    student_id: MOCK_STUDENT.id,
    student_name: '劉心悅 (Lin)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-11-24T19:00:00+08:00',
    end_time: '2026-11-24T21:00:00+08:00',
    status: 'confirmed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A303',
    payment_status: 'pay_per_lesson',
    payment_type: 'postpaid',
  },
  {
    id: 'app-lin-p4-9',
    contract_id: 'contract-lin-term-4',
    term_period: 4,
    student_id: MOCK_STUDENT.id,
    student_name: '劉心悅 (Lin)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-12-01T19:00:00+08:00',
    end_time: '2026-12-01T21:00:00+08:00',
    status: 'confirmed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A303',
    payment_status: 'pay_per_lesson',
    payment_type: 'postpaid',
  },
  {
    id: 'app-lin-p4-10',
    contract_id: 'contract-lin-term-4',
    term_period: 4,
    student_id: MOCK_STUDENT.id,
    student_name: '劉心悅 (Lin)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-12-08T19:00:00+08:00',
    end_time: '2026-12-08T21:00:00+08:00',
    status: 'confirmed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A303',
    payment_status: 'pay_per_lesson',
    payment_type: 'postpaid',
  },
  // ===== 許雅婷 (Charles / 查爾斯) 第 1 期：共 10 堂 (每週三 19:30-21:30，7 堂已完課 + 3 堂即將上課) =====
  {
    id: 'app-charles-1',
    contract_id: 'contract-charles-term-1',
    term_period: 1,
    student_id: MOCK_STUDENT_CHARLES.id,
    student_name: '許雅婷 (Charles / 查爾斯)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-07-29T19:30:00+08:00',
    end_time: '2026-07-29T21:30:00+08:00',
    status: 'completed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A301',
    payment_status: 'paid',
    payment_type: 'prepaid',
  },
  {
    id: 'app-charles-2',
    contract_id: 'contract-charles-term-1',
    term_period: 1,
    student_id: MOCK_STUDENT_CHARLES.id,
    student_name: '許雅婷 (Charles / 查爾斯)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-08-05T19:30:00+08:00',
    end_time: '2026-08-05T21:30:00+08:00',
    status: 'completed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A301',
    payment_status: 'paid',
    payment_type: 'prepaid',
  },
  {
    id: 'app-charles-3',
    contract_id: 'contract-charles-term-1',
    term_period: 1,
    student_id: MOCK_STUDENT_CHARLES.id,
    student_name: '許雅婷 (Charles / 查爾斯)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-08-12T19:30:00+08:00',
    end_time: '2026-08-12T21:30:00+08:00',
    status: 'completed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A301',
    payment_status: 'paid',
    payment_type: 'prepaid',
  },
  {
    id: 'app-charles-4',
    contract_id: 'contract-charles-term-1',
    term_period: 1,
    student_id: MOCK_STUDENT_CHARLES.id,
    student_name: '許雅婷 (Charles / 查爾斯)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-08-19T19:30:00+08:00',
    end_time: '2026-08-19T21:30:00+08:00',
    status: 'completed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A301',
    payment_status: 'paid',
    payment_type: 'prepaid',
  },
  {
    id: 'app-charles-5',
    contract_id: 'contract-charles-term-1',
    term_period: 1,
    student_id: MOCK_STUDENT_CHARLES.id,
    student_name: '許雅婷 (Charles / 查爾斯)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-08-26T19:30:00+08:00',
    end_time: '2026-08-26T21:30:00+08:00',
    status: 'completed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A301',
    payment_status: 'paid',
    payment_type: 'prepaid',
  },
  {
    id: 'app-charles-6',
    contract_id: 'contract-charles-term-1',
    term_period: 1,
    student_id: MOCK_STUDENT_CHARLES.id,
    student_name: '許雅婷 (Charles / 查爾斯)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-09-02T19:30:00+08:00',
    end_time: '2026-09-02T21:30:00+08:00',
    status: 'completed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A301',
    payment_status: 'paid',
    payment_type: 'prepaid',
  },
  {
    id: 'app-charles-7',
    contract_id: 'contract-charles-term-1',
    term_period: 1,
    student_id: MOCK_STUDENT_CHARLES.id,
    student_name: '許雅婷 (Charles / 查爾斯)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-09-09T19:30:00+08:00',
    end_time: '2026-09-09T21:30:00+08:00',
    status: 'completed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A301',
    payment_status: 'paid',
    payment_type: 'prepaid',
  },
  {
    id: 'app-charles-8',
    contract_id: 'contract-charles-term-1',
    term_period: 1,
    student_id: MOCK_STUDENT_CHARLES.id,
    student_name: '許雅婷 (Charles / 查爾斯)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-09-16T19:30:00+08:00',
    end_time: '2026-09-16T21:30:00+08:00',
    status: 'confirmed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A301',
    payment_status: 'paid',
    payment_type: 'prepaid',
  },
  {
    id: 'app-charles-9',
    contract_id: 'contract-charles-term-1',
    term_period: 1,
    student_id: MOCK_STUDENT_CHARLES.id,
    student_name: '許雅婷 (Charles / 查爾斯)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-09-23T19:30:00+08:00',
    end_time: '2026-09-23T21:30:00+08:00',
    status: 'confirmed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A301',
    payment_status: 'paid',
    payment_type: 'prepaid',
  },
  {
    id: 'app-charles-10',
    contract_id: 'contract-charles-term-1',
    term_period: 1,
    student_id: MOCK_STUDENT_CHARLES.id,
    student_name: '許雅婷 (Charles / 查爾斯)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-09-30T19:30:00+08:00',
    end_time: '2026-09-30T21:30:00+08:00',
    status: 'confirmed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A301',
    payment_status: 'paid',
    payment_type: 'prepaid',
  },
  // ===== 許雅婷 (Charles / 查爾斯) 第 2 期：已排定 10 堂 =====
  {
    id: 'app-charles-p2-1',
    contract_id: 'contract-charles-term-2',
    term_period: 2,
    student_id: MOCK_STUDENT_CHARLES.id,
    student_name: '許雅婷 (Charles / 查爾斯)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-10-07T19:30:00+08:00',
    end_time: '2026-10-07T21:30:00+08:00',
    status: 'confirmed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A301',
    payment_status: 'paid',
    payment_type: 'prepaid',
  },
  {
    id: 'app-charles-p2-2',
    contract_id: 'contract-charles-term-2',
    term_period: 2,
    student_id: MOCK_STUDENT_CHARLES.id,
    student_name: '許雅婷 (Charles / 查爾斯)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-10-14T19:30:00+08:00',
    end_time: '2026-10-14T21:30:00+08:00',
    status: 'confirmed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A301',
    payment_status: 'paid',
    payment_type: 'prepaid',
  },
  // ===== Johnny (阿堅/陳子翔) 第 1 期：共 10 堂 (每週一 17:00-19:00，3 堂已完課 + 7 堂即將上課) =====
  {
    id: 'app-johnny-1',
    contract_id: 'contract-johnny-term-1',
    term_period: 1,
    student_id: MOCK_STUDENT_JOHNNY.id,
    student_name: '陳子翔 (Johnny / 阿堅)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-08-24T17:00:00+08:00',
    end_time: '2026-08-24T19:00:00+08:00',
    status: 'completed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A302',
    payment_status: 'paid',
    payment_type: 'prepaid',
  },
  {
    id: 'app-johnny-2',
    contract_id: 'contract-johnny-term-1',
    term_period: 1,
    student_id: MOCK_STUDENT_JOHNNY.id,
    student_name: '陳子翔 (Johnny / 阿堅)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-08-31T17:00:00+08:00',
    end_time: '2026-08-31T19:00:00+08:00',
    status: 'completed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A302',
    payment_status: 'paid',
    payment_type: 'prepaid',
  },
  {
    id: 'app-johnny-3',
    contract_id: 'contract-johnny-term-1',
    term_period: 1,
    student_id: MOCK_STUDENT_JOHNNY.id,
    student_name: '陳子翔 (Johnny / 阿堅)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-09-07T17:00:00+08:00',
    end_time: '2026-09-07T19:00:00+08:00',
    status: 'completed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A302',
    payment_status: 'paid',
    payment_type: 'prepaid',
  },
  {
    id: 'app-johnny-4',
    contract_id: 'contract-johnny-term-1',
    term_period: 1,
    student_id: MOCK_STUDENT_JOHNNY.id,
    student_name: '陳子翔 (Johnny / 阿堅)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-09-14T17:00:00+08:00',
    end_time: '2026-09-14T19:00:00+08:00',
    status: 'confirmed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A302',
    payment_status: 'paid',
    payment_type: 'prepaid',
  },
  {
    id: 'app-johnny-5',
    contract_id: 'contract-johnny-term-1',
    term_period: 1,
    student_id: MOCK_STUDENT_JOHNNY.id,
    student_name: '陳子翔 (Johnny / 阿堅)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-09-21T17:00:00+08:00',
    end_time: '2026-09-21T19:00:00+08:00',
    status: 'confirmed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A302',
    payment_status: 'paid',
    payment_type: 'prepaid',
  },
  {
    id: 'app-johnny-6',
    contract_id: 'contract-johnny-term-1',
    term_period: 1,
    student_id: MOCK_STUDENT_JOHNNY.id,
    student_name: '陳子翔 (Johnny / 阿堅)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-09-28T17:00:00+08:00',
    end_time: '2026-09-28T19:00:00+08:00',
    status: 'confirmed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A302',
    payment_status: 'paid',
    payment_type: 'prepaid',
  },
  {
    id: 'app-johnny-7',
    contract_id: 'contract-johnny-term-1',
    term_period: 1,
    student_id: MOCK_STUDENT_JOHNNY.id,
    student_name: '陳子翔 (Johnny / 阿堅)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-10-05T17:00:00+08:00',
    end_time: '2026-10-05T19:00:00+08:00',
    status: 'confirmed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A302',
    payment_status: 'paid',
    payment_type: 'prepaid',
  },
  {
    id: 'app-johnny-8',
    contract_id: 'contract-johnny-term-1',
    term_period: 1,
    student_id: MOCK_STUDENT_JOHNNY.id,
    student_name: '陳子翔 (Johnny / 阿堅)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-10-12T17:00:00+08:00',
    end_time: '2026-10-12T19:00:00+08:00',
    status: 'confirmed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A302',
    payment_status: 'paid',
    payment_type: 'prepaid',
  },
  {
    id: 'app-johnny-9',
    contract_id: 'contract-johnny-term-1',
    term_period: 1,
    student_id: MOCK_STUDENT_JOHNNY.id,
    student_name: '陳子翔 (Johnny / 阿堅)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-10-19T17:00:00+08:00',
    end_time: '2026-10-19T19:00:00+08:00',
    status: 'confirmed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A302',
    payment_status: 'paid',
    payment_type: 'prepaid',
  },
  {
    id: 'app-johnny-10',
    contract_id: 'contract-johnny-term-1',
    term_period: 1,
    student_id: MOCK_STUDENT_JOHNNY.id,
    student_name: '陳子翔 (Johnny / 阿堅)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-10-26T17:00:00+08:00',
    end_time: '2026-10-26T19:00:00+08:00',
    status: 'confirmed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A302',
    payment_status: 'paid',
    payment_type: 'prepaid',
  },
  // ===== Johnny (阿堅/陳子翔) 第 2 期：已排定 10 堂 =====
  {
    id: 'app-johnny-p2-1',
    contract_id: 'contract-johnny-term-2',
    term_period: 2,
    student_id: MOCK_STUDENT_JOHNNY.id,
    student_name: '陳子翔 (Johnny / 阿堅)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-11-02T17:00:00+08:00',
    end_time: '2026-11-02T19:00:00+08:00',
    status: 'confirmed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A302',
    payment_status: 'paid',
    payment_type: 'prepaid',
  },
  {
    id: 'app-johnny-p2-2',
    contract_id: 'contract-johnny-term-2',
    term_period: 2,
    student_id: MOCK_STUDENT_JOHNNY.id,
    student_name: '陳子翔 (Johnny / 阿堅)',
    teacher_id: MOCK_TEACHER.id,
    teacher_name: '林佩芬 老師 (Teacher Lin)',
    start_time: '2026-11-09T17:00:00+08:00',
    end_time: '2026-11-09T19:00:00+08:00',
    status: 'confirmed',
    instrument: '古典鋼琴 (Piano)',
    location: '音符琴房 A302',
    payment_status: 'paid',
    payment_type: 'prepaid',
  },
];

const INITIAL_LESSONS: LessonRecord[] = [
  {
    id: 'lesson-1',
    appointment_id: 'app-lin-past-1',
    audio_url: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg',
    raw_transcript:
      '今天心悅在車爾尼 Op.599 的音準與指法掌握非常穩定，右手高音區觸鍵清晰具顆粒感。在踏板切換時需注意不要踩得太深，避免低音共鳴混濁。回家作業請把第 16 到 32 小節用 BPM 72 慢練 10 遍，手指關節站穩，加油！',
    clean_summary_json: {
      highlights: ['右手高音觸鍵清晰具顆粒感', '視奏流暢度明顯提升'],
      technical_tips: [
        '右手第 4、5 指落指時掌關節需支撐站穩，避免塌陷以保持觸鍵清脆。',
        '手腕保持彈性放鬆，隨旋律音型自然微幅呼吸起伏，切勿聳肩。',
      ],
      theory_tips: [
        '十六分音符節奏需均勻踩在拍點上，注意三連音轉分音的時值切換。',
        '注意 C 大調主和弦與屬七和弦在低音部的聲部導向。',
      ],
      homework: [
        '第 16 至 32 小節慢速練習並分段重複 10 次 (BPM 72)',
        '每日哈農第 1 首指法獨立性暖身 15 分鐘',
        '錄製一段節拍器輔助的穩定彈奏音訊供批改',
      ],
      encouragement: '每一次的觸鍵都是音樂感的累積，老師看到你的進步了！加油！',
      bpm_recommendation: 72,
    },
    created_at: '2026-08-15T10:00:00+08:00',
    song_title: '車爾尼：Op.599 No.50 視奏與高音顆粒感',
    teacher_name: '林佩芬 老師 (Teacher Lin)',
  },
  {
    id: 'lesson-2',
    appointment_id: 'app-lin-past-2',
    audio_url: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg',
    raw_transcript:
      '今天進行了踏板延音層次與左手和聲分解練習，整體彈奏節奏與歌唱性掌握得非常好。注意左手伴奏觸鍵要輕巧如水，不要搶過右手主旋律。回家作業請加強第 32 到 64 小節的華彩裝飾音練習。',
    clean_summary_json: {
      highlights: ['踏板切換時機乾淨精準', '右手旋律線條優美富歌唱性'],
      technical_tips: [
        '左手低音伴奏觸鍵輕巧柔和，手腕避免過度下沉，讓大姆指落鍵最輕。',
        '第 48 小節強弱對比 (p 到 f) 需更加鮮明，高潮段落利用手臂自然重量下沉。',
      ],
      theory_tips: [
        '降 E 大調轉調段落和聲走向需清楚呈現主音穩定度。',
        '裝飾音要輕快俐落如珍珠般均勻，勿佔用主音符的時值。',
      ],
      homework: [
        '每日琶音練習 20 分鐘並以節拍器校對 (BPM 80)',
        '全曲完整背譜並錄製第 32-64 小節演奏影音',
        '慢練左手伴奏分解和弦 10 次',
      ],
      encouragement: '手指獨立性與樂句歌唱感大有進步，旋律線條非常優美！繼續保持！',
      bpm_recommendation: 80,
    },
    created_at: '2026-08-19T10:00:00+08:00',
    song_title: '蕭邦：降E大調夜曲 Op.9 No.2 踏板層次與歌唱性',
    teacher_name: '林佩芬 老師 (Teacher Lin)',
  },
  {
    id: 'lesson-3',
    appointment_id: 'app-lin-1',
    audio_url: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg',
    raw_transcript:
      '今天重點在於月光第三樂章的狂暴氣勢與連續琶音，整體指法與爆發力都做得非常好。主和弦強音著地時肩膀放鬆避免聳肩，藉助重力自然落鍵。回家作業請把第 1 到 32 小節重音加強慢練 5 遍。',
    clean_summary_json: {
      highlights: ['急板節奏控制極佳', '左手低音清晰紮實具震撼力'],
      technical_tips: [
        '主和弦強音 (sfz) 著地時肩膀放鬆，藉助整條手臂的重力自然落鍵，防止手腕僵硬。',
        '連續上升琶音第 1 指 (大拇指) 轉指需提前穿過掌心，維持指尖靈敏度。',
      ],
      theory_tips: [
        '升 C 小調調性重音需精準落於第一拍，維持強烈的戲劇張力。',
        '切分節奏點避免搶拍，手腕隨呼吸彈性調適。',
      ],
      homework: [
        '第 1-32 小節重音加強練習，分組連音慢練 5 次',
        '每日左手單獨練習 15 分鐘確保觸鍵顆粒分明',
        '錄製一段 BPM 120 穩定彈奏供老師檢視',
      ],
      encouragement: '月光第三樂章的狂暴氣勢有充分展現出來，彈奏極具戲劇張力！太棒了！',
      bpm_recommendation: 120,
    },
    created_at: '2026-08-26T10:00:00+08:00',
    song_title: '貝多芬：第十四號鋼琴奏鳴曲《月光》第三樂章 急板琶音',
    teacher_name: '林佩芬 老師 (Teacher Lin)',
  },
  {
    id: 'lesson-4',
    appointment_id: 'app-lin-2',
    audio_url: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg',
    raw_transcript:
      '今天進行巴哈二聲部創意曲第一首的雙手獨立性訓練，左右手主題對答的清晰度進步很多。注意左手模仿主題時音量要與右手等重，指尖要站立彈出非連音 (non legato) 的清晰感。',
    clean_summary_json: {
      highlights: ['雙手聲部對位清晰', '主題動機對答層次分明'],
      technical_tips: [
        '左手模仿主題時指尖垂直站穩，彈出巴洛克時期特有的斷奏與清晰顆粒感。',
        '雙手同時彈奏不同節奏型態時，維持手腕水平穩定，切勿左右搖晃。',
      ],
      theory_tips: [
        'C 大調二聲部對位結構解析，注意倒影模仿與轉位聲部。',
        '樂句終止式 (Cadence) 需做適度的微幅漸慢 (ritenuto)。',
      ],
      homework: [
        '左右手單手分開背譜各彈奏 5 遍',
        '以 BPM 84 雙手合奏慢練，錄製第 1-12 小節音訊',
        '重點標記樂譜中的主題與答題聲部',
      ],
      encouragement: '巴哈複調音樂的嚴謹與邏輯掌握得越來越好，雙手平衡感極佳！',
      bpm_recommendation: 84,
    },
    created_at: '2026-08-29T10:00:00+08:00',
    song_title: '巴哈：二聲部創意曲 No.1 C大調 對位複調與獨立性',
    teacher_name: '林佩芬 老師 (Teacher Lin)',
  },
  {
    id: 'lesson-5',
    appointment_id: 'app-lin-3',
    audio_url: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg',
    raw_transcript:
      '今天彈奏德布西月光，弱音觸鍵與色彩表現非常有進步，意境很棒。中段高潮處低音踏板及時更換避免混濁，留住乾淨泛音。琶音聲部像流水般流動，手腕帶動手指輕拂琴鍵。',
    clean_summary_json: {
      highlights: ['弱音觸鍵細膩動人', '九八拍複合拍子律動自然'],
      technical_tips: [
        '中段高潮處低音踏板及時半踏更換避免混濁，留住純淨琴弦泛音。',
        '琶音聲部像流水般流動，手腕水平劃圓帶動手指指腹輕拂琴鍵。',
      ],
      theory_tips: [
        '降 D 大調黑鍵手型維持微拱，指腹肉墊接觸琴鍵營造柔和音色。',
        '注意九八拍大三連音的律動感，保持平穩不急躁。',
      ],
      homework: [
        '全曲踏板乾淨度訓練，慢速背譜彈奏 3 遍',
        '專注第 27-36 小節雙音色彩層次練習 8 次',
        '錄製一組雙手合奏音檔',
      ],
      encouragement: '印象派的朦朧色彩與詩意表現得非常好，聽得出用心投入的感情！加油！',
      bpm_recommendation: 54,
    },
    created_at: '2026-09-02T10:00:00+08:00',
    song_title: '德布西：《貝加馬斯克組曲》第三首〈月光〉 印象派色彩',
    teacher_name: '林佩芬 老師 (Teacher Lin)',
  },
  {
    id: 'lesson-6',
    appointment_id: 'app-lin-4',
    audio_url: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg',
    raw_transcript:
      '今天驗收莫札特 K.545 第一樂章，古典時期的典雅與活潑感詮釋得很到位。左手阿爾貝蒂低音 (Alberti bass) 伴奏要注意音量控制在 pp 到 p，烘托右手流暢的十六分音符音階。',
    clean_summary_json: {
      highlights: ['右手音階跑動顆粒感極佳', '左手伴奏平衡恰到好處'],
      technical_tips: [
        '左手 Alberti bass (5-1-3-1 指法) 旋轉手腕自然發力，大拇指切勿用力下砸。',
        '右手顫音 (Trill) 與裝飾音要均勻靈巧，利用指尖彈簧般的彈性落鍵。',
      ],
      theory_tips: [
        '古典奏鳴曲式呈示部結構（第一主題 C 大調，第二主題 G 大調）。',
        '古典樂句的起伏原則：上行微漸強，下行微漸弱，句尾收音優雅。',
      ],
      homework: [
        '第 1-28 小節呈示部以 BPM 96 穩定合奏 5 遍',
        '右手音階琶音單獨以節拍器提速至 BPM 108 練習',
        '錄製一段完整第一樂章影音供批改',
      ],
      encouragement: '莫札特的純淨典雅與音階顆粒感彈得非常乾淨漂亮！太棒了！',
      bpm_recommendation: 96,
    },
    created_at: '2026-09-09T10:00:00+08:00',
    song_title: '莫札特：C大調鋼琴奏鳴曲 K.545 第一樂章 經典觸鍵',
    teacher_name: '林佩芬 老師 (Teacher Lin)',
  },
  {
    id: 'lesson-7',
    appointment_id: 'app-lin-5',
    audio_url: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg',
    raw_transcript:
      '今天小明彈徹爾尼 599 第 20 首，右手顆粒感進步很多，但第 12 小節左手伴奏太重，請放輕手腕帶動。作業練第 20 首速度 80，加上巴哈初步第 3 首前四小節。',
    clean_summary_json: {
      highlights: [
        '徹爾尼 599 第 20 首右手顆粒感顯著進步，手指獨立性佳',
        '音色清晰純淨，樂句整體流暢度大幅提升',
      ],
      technical_tips: [
        '第 12 小節左手伴奏觸鍵偏重，請以放輕手腕自然呼吸帶動，避免手臂下壓用力。',
        '右手快速音群保持掌關節穩定拱形，指尖垂直觸鍵確保顆粒分明。',
      ],
      theory_tips: [
        '注意主從和聲平衡：右手為主旋律、左手為背景和弦伴奏，兩手強弱需有明顯層次。',
        '巴哈複調音樂雙手各自獨立，注意二聲部對位線條清晰度。',
      ],
      homework: [
        '徹爾尼 599 第 20 首：配合節拍器由慢練漸進提升至目標速度 BPM 80，每日練習 15 分鐘',
        '巴哈初步第 3 首：雙手分開單獨慢練第 1 至 4 小節，熟記指法與聲部進行',
        '針對第 12 小節左手伴奏手腕放鬆度錄製 15 秒打卡音訊供批改',
      ],
      encouragement:
        '右手顆粒感的進步非常亮眼！只要把左手的手腕放鬆、伴奏輕下來，整首曲子的層次就會如同水晶般清澈。繼續加油！',
      bpm_recommendation: 80,
    },
    created_at: '2026-09-18T10:00:00+08:00',
    song_title: '徹爾尼 599 第 20 首 & 巴哈初步第 3 首',
    teacher_name: '林佩芬 老師 (Teacher Lin)',
  },
];

const INITIAL_DEMO_VIDEOS: TeacherDemoVideo[] = [
  {
    id: 'demo-1',
    teacher_id: MOCK_TEACHER.id,
    title: '巴哈：二聲部創意曲 第一首示範 (林佩芬老師示範)',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    midi_data: { bpm: 84, key: 'C Major' },
    tags: ['古典鋼琴', '複調對位', '名師示範'],
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
  isVerifiedStudent: boolean;
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
  APPOINTMENTS: 'musimate_appointments_v0914',
};

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentRole, setCurrentRole] = useState<Role>('student');
  const [activeStudentId, setActiveStudentId] = useState<string>('');
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>(INITIAL_SLOTS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
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
              teacher_name: item.teacher_name || '林佩芬 老師 (Teacher Lin)',
              start_time: startTimeIso,
              end_time: endTimeIso,
              status: 'confirmed',
              instrument: item.instrument || '古典鋼琴 (Piano)',
              location: item.room || '音符琴房 A303',
              payment_status: 'paid',
              payment_type: 'prepaid',
            };
          });

          setAppointments((prev) => {
            const existingIds = new Set(prev.map((a) => a.id));
            const toAdd = liveAppts.filter((a) => !existingIds.has(a.id));
            if (toAdd.length === 0) return prev;
            const updated = [...prev, ...toAdd];
            try {
              localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(updated));
            } catch (e) {
              console.warn('Failed to cache synced appointments:', e);
            }
            return updated;
          });
        }
      } catch (err) {
        console.warn('Failed to sync Supabase schedules:', err);
      }
    }

    syncSupabaseSchedules();
  }, []);

  // 雙重狀態保存機制：初始化時優先讀取 LIFF 登入身分、URL 參數與 LocalStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    async function initLiffAuth() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const queryId =
          urlParams.get('student_id') ||
          urlParams.get('line_user_id') ||
          urlParams.get('user_id') ||
          urlParams.get('student') ||
          urlParams.get('mock_user');

        let targetId: string | null = queryId;
        let liveLineId: string | null = null;
        let displayName: string | null = null;
        let pictureUrl: string | undefined = undefined;

        // 1. 嘗試由 LINE LIFF Native SDK 取得身分
        try {
          const liff = (await import('@line/liff')).default;
          const liffId = process.env.NEXT_PUBLIC_LIFF_ID || '2011164851-lGsEnQWB';
          await liff.init({ liffId });

          if (liff.isLoggedIn() || liff.isInClient()) {
            try {
              const profile = await liff.getProfile();
              if (profile?.userId) {
                liveLineId = profile.userId;
                displayName = profile.displayName || null;
                pictureUrl = profile.pictureUrl;
              }
            } catch (pe) {
              console.warn('liff.getProfile error in DemoContext:', pe);
            }

            if (!liveLineId) {
              const ctx = liff.getContext();
              if (ctx?.userId) {
                liveLineId = ctx.userId;
              }
            }
            if (!liveLineId) {
              const idToken = liff.getDecodedIDToken();
              if (idToken?.sub) {
                liveLineId = idToken.sub;
              }
            }
          }

          if (liveLineId) {
            targetId = liveLineId;
            console.log(`🎯 [DemoContext LIFF Auth] 抓到真實登入學員 LINE ID: ${liveLineId}, 暱稱: ${displayName}`);

            // 自動非同步寫入資料庫
            fetch('/api/student/bind-line', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true',
              },
              body: JSON.stringify({
                line_user_id: liveLineId,
                display_name: displayName,
                picture_url: pictureUrl,
                student_name: displayName,
              }),
            }).catch((e) => console.warn('自動綁定請求略過:', e));
          }
        } catch (liffErr) {
          console.info('ℹ️ DemoContext LIFF 初始化略過 (Web 模式):', liffErr);
        }

        // 2. 如果沒有從 URL 或 LIFF 抓到，檢查 LocalStorage (排除 guest/new_student)
        if (!targetId) {
          const cached =
            localStorage.getItem(STORAGE_KEYS.STUDENT_ID) ||
            localStorage.getItem('musimate_student_id');
          if (cached && cached !== 'new_student' && cached !== 'guest') {
            targetId = cached;
          }
        }

        // 3. 根據 targetId 與 displayName 比對學生並鎖定當前學生身分 (未驗證訪客嚴禁預設劉心悅)
        let matchedId = '';
        const dName = (displayName || '').trim().toLowerCase();
        const tId = (targetId || '').trim();
        const qId = (queryId || '').trim().toLowerCase();
        const matchCandidate = `${tId} ${dName}`.toLowerCase();

        if (
          tId === 'U26ed3c0e48864aebdc244594cf780df0' ||
          tId === MOCK_STUDENT_CHARLES.id ||
          matchCandidate.includes('charles') ||
          matchCandidate.includes('查爾斯') ||
          matchCandidate.includes('許雅婷')
        ) {
          matchedId = MOCK_STUDENT_CHARLES.id;
        } else if (
          tId === 'U2a2f432d824e353e8eb3fbe579def2cf' ||
          tId === MOCK_STUDENT_JOHNNY.id ||
          tId === 'u0000000-0000-0000-0000-000000000004' ||
          matchCandidate.includes('johnny') ||
          matchCandidate.includes('阿堅') ||
          matchCandidate.includes('陳子翔')
        ) {
          matchedId = MOCK_STUDENT_JOHNNY.id;
        } else if (
          tId === 'Uf2457bf35e0d6d3060b60838d9a9c91c' ||
          tId === MOCK_STUDENT.id ||
          matchCandidate.includes('劉心悅') ||
          matchCandidate.includes('心悅') ||
          dName === 'lin' ||
          qId === 'lin'
        ) {
          matchedId = MOCK_STUDENT.id;
        }

        setActiveStudentId(matchedId);
        if (matchedId) {
          console.log(`✅ [DemoContext] 鎖定正式學員 ID: ${matchedId} (來源: ${matchCandidate})`);
          localStorage.setItem(STORAGE_KEYS.STUDENT_ID, matchedId);
          localStorage.setItem('musimate_student_id', matchedId);
        } else {
          console.log('✨ [DemoContext] 未驗證訪客/新生，清除舊暫存並進入選樂器探索模式');
          localStorage.removeItem(STORAGE_KEYS.STUDENT_ID);
          localStorage.removeItem('musimate_student_id');
          localStorage.removeItem('musimate_active_student_id');
        }

        const roleParam = urlParams.get('role');
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
    }

    initLiffAuth();

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

  const isVerifiedStudent = Boolean(
    activeStudentId && ALL_MOCK_STUDENTS.some((s) => s.student.id === activeStudentId)
  );

  // 取得當前學生物件 (若為未驗證訪客則回傳 NEW_STUDENT_INFO，嚴防個資外洩)
  const activeStudentInfo =
    ALL_MOCK_STUDENTS.find((s) => s.student.id === activeStudentId) || NEW_STUDENT_INFO;

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
    const found = ALL_MOCK_STUDENTS.find((s) => s.student.id === studentId);
    if (found) {
      setActiveStudentId(found.student.id);
      setCurrentRole('student');
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.STUDENT_ID, found.student.id);
        localStorage.setItem('musimate_student_id', found.student.id);
        localStorage.setItem('musimate_active_student_id', found.student.id);
        localStorage.setItem(STORAGE_KEYS.ROLE, 'student');
        localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
      }
      console.log(`✅ [DemoContext] 切換學員為: ${found.user.name} (${found.student.id})`);
    } else {
      setActiveStudentId('');
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.STUDENT_ID);
        localStorage.removeItem('musimate_student_id');
      }
    }
  };

  const login = (email: string, pass: string, role: Role) => {
    if (role === 'teacher') {
      if ((email.trim() === 'lin.teacher@harmony.edu' || email.trim() === 'chang.teacher@harmony.edu') && pass === 'teacher123') {
        setCurrentRole('teacher');
        setIsAuthenticated(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.ROLE, 'teacher');
          localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
        }
        return { success: true, message: '登入成功！歡迎林佩芬老師。' };
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
        ? '⚠️ 調課已確認送出！因距開課不足 24 小時，系統已依規定扣除該堂課費用/時數，新時段已同步林佩芬老師。'
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
        isVerifiedStudent,
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
