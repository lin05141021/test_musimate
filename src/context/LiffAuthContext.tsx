'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StudentProfile, TeacherProfile } from '@/types';

interface StudentWithTeacher extends StudentProfile {
  teacher?: TeacherProfile;
}

interface LiffAuthContextType {
  isLiffReady: boolean;
  isDevMock: boolean;
  currentStudent: StudentProfile | null;
  currentTeacher: TeacherProfile | null;
  lineUserId: string | null;
  setMockStudent: (student: StudentProfile) => void;
  mockStudents: StudentWithTeacher[];
  isLoadedFromApi: boolean;
}

export const FALLBACK_STUDENTS: StudentWithTeacher[] = [
  {
    id: '55555555-5555-4555-b555-555555555555',
    user_id: '55555555-5555-4555-b555-555555555555',
    name: '劉心悅 (Lin)',
    email: 'tel:0912345678',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    line_user_id: 'Uf2457bf35e0d6d3060b60838d9a9c91c',
    default_instrument: '古典鋼琴 (Piano)',
    rate_per_lesson: 1400,
    teacher: {
      id: 'df637b26-7cab-443b-8801-4361fb35afdd',
      name: '林佩芬 老師',
      slug: 'peifen-piano',
      bio: '國立音樂系碩士，主修古典鋼琴教學與演奏，專精檢定輔導與基礎扎根。',
      hourly_rate: 1400,
    },
  },
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    user_id: 'b0000000-0000-0000-0000-000000000001',
    name: '陳子翔',
    email: 'tel:09222002000',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    line_user_id: 'LINE_STU_001',
    default_instrument: '古典鋼琴 (Piano)',
    rate_per_lesson: 1400,
    teacher: {
      id: 'df637b26-7cab-443b-8801-4361fb35afdd',
      name: '林佩芬 老師',
      slug: 'peifen-piano',
      bio: '國立音樂系碩士，主修古典鋼琴教學與演奏。',
      hourly_rate: 1400,
    },
  },
];

export const MOCK_STUDENTS = FALLBACK_STUDENTS;

export const MOCK_TEACHER: TeacherProfile = {
  id: 'df637b26-7cab-443b-8801-4361fb35afdd',
  name: '林佩芬 老師',
  slug: 'peifen-piano',
  bio: '國立音樂系碩士，主修古典鋼琴教學與演奏。',
  hourly_rate: 1400,
};

const LiffAuthContext = createContext<LiffAuthContextType | undefined>(undefined);

export function LiffAuthProvider({ children }: { children: ReactNode }) {
  const [isLiffReady, setIsLiffReady] = useState(false);
  const [isDevMock, setIsDevMock] = useState(true);
  const [studentsList, setStudentsList] = useState<StudentWithTeacher[]>(FALLBACK_STUDENTS);
  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(FALLBACK_STUDENTS[0]);
  const [currentTeacher, setCurrentTeacher] = useState<TeacherProfile | null>(FALLBACK_STUDENTS[0].teacher || null);
  const [lineUserId, setLineUserId] = useState<string | null>(FALLBACK_STUDENTS[0].line_user_id || null);
  const [isLoadedFromApi, setIsLoadedFromApi] = useState(false);

  useEffect(() => {
    const isDev = process.env.NODE_ENV === 'development';
    setIsDevMock(isDev);

    async function loadStudentsFromApi() {
      try {
        const res = await fetch('/api/dev/students');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && json.data.length > 0) {
            const parsed: StudentWithTeacher[] = json.data;
            const targetStudent = parsed.find(s => s.name.includes('劉心悅') || s.id.includes('55555555')) || parsed[0];
            setStudentsList(parsed);
            setCurrentStudent(targetStudent);
            setCurrentTeacher(targetStudent.teacher || MOCK_TEACHER);
            setLineUserId(targetStudent.line_user_id || 'Uf2457bf35e0d6d3060b60838d9a9c91c');
            setIsLoadedFromApi(true);
            console.log('📡 [API Endpoint] 成功載入學生與契約指導教師:', targetStudent);
          }
        }
      } catch (err) {
        console.info('ℹ️ 呼叫 /api/dev/students API 失敗，使用預設種子名單保底:', err);
      }
    }

    loadStudentsFromApi();

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const mockUserId = urlParams.get('mock_user') || urlParams.get('student_id');
      if (mockUserId) {
        const found = studentsList.find(s => s.id === mockUserId || s.user_id === mockUserId || s.name.includes(mockUserId));
        if (found) {
          setCurrentStudent(found);
          setCurrentTeacher(found.teacher || MOCK_TEACHER);
          setLineUserId(found.line_user_id || null);
        }
      }
      setIsLiffReady(true);
    }
  }, []);

  const setMockStudent = (student: StudentWithTeacher) => {
    setCurrentStudent(student);
    if (student.teacher) {
      setCurrentTeacher(student.teacher);
    }
    setLineUserId(student.line_user_id || null);
  };

  return (
    <LiffAuthContext.Provider
      value={{
        isLiffReady,
        isDevMock,
        currentStudent,
        currentTeacher,
        lineUserId,
        setMockStudent,
        mockStudents: studentsList,
        isLoadedFromApi,
      }}
    >
      {children}
    </LiffAuthContext.Provider>
  );
}

export function useLiffAuth() {
  const context = useContext(LiffAuthContext);
  if (!context) {
    throw new Error('useLiffAuth must be used within a LiffAuthProvider');
  }
  return context;
}
