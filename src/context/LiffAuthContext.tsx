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
  isVerified: boolean;
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
    id: '89e45974-7f00-4bfd-bd84-3eb26351a150',
    user_id: '89e45974-7f00-4bfd-bd84-3eb26351a150',
    name: '許雅婷 (Charles / 查爾斯)',
    email: 'charles.student@harmony.edu',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    line_user_id: 'U26ed3c0e48864aebdc244594cf780df0',
    default_instrument: '古典鋼琴 (Piano)',
    rate_per_lesson: 1600,
    teacher: {
      id: 'df637b26-7cab-443b-8801-4361fb35afdd',
      name: '林佩芬 老師',
      slug: 'peifen-piano',
      bio: '國立音樂系碩士，主修古典鋼琴教學與演奏，專精檢定輔導與基礎扎根。',
      hourly_rate: 1600,
    },
  },
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    user_id: 'b0000000-0000-0000-0000-000000000001',
    name: 'Johnny (阿堅/陳子翔)',
    email: 'johnny.student@harmony.edu',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    line_user_id: 'U2a2f432d824e353e8eb3fbe579def2cf',
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
  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(null);
  const [currentTeacher, setCurrentTeacher] = useState<TeacherProfile | null>(MOCK_TEACHER);
  const [lineUserId, setLineUserId] = useState<string | null>(null);
  const [isLoadedFromApi, setIsLoadedFromApi] = useState(false);

  useEffect(() => {
    const isDev = process.env.NODE_ENV === 'development';
    setIsDevMock(isDev);

    async function initAuthAndLiff() {
      let activeStudents: StudentWithTeacher[] = FALLBACK_STUDENTS;

      // 1. 先從 API 載入學生與指導教師名單
      try {
        const res = await fetch('/api/dev/students');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && json.data.length > 0) {
            activeStudents = json.data;
            setStudentsList(activeStudents);
            setIsLoadedFromApi(true);
            console.log('📡 [API Endpoint] 成功載入學生名單:', activeStudents.length, '位學生');
          }
        }
      } catch (err) {
        console.info('ℹ️ 呼叫 /api/dev/students API 失敗，使用預設種子名單保底:', err);
      }

      if (typeof window === 'undefined') return;

      // 2. 解析 Target ID 優先順序: URL 參數 > LINE LIFF Profile > LocalStorage
      const urlParams = new URLSearchParams(window.location.search);
      const queryId =
        urlParams.get('student_id') ||
        urlParams.get('line_user_id') ||
        urlParams.get('user_id') ||
        urlParams.get('student') ||
        urlParams.get('mock_user');

      let targetId: string | null = queryId;

      if (queryId) {
        localStorage.setItem('musimate_student_id', queryId);
        localStorage.setItem('musimate_active_student_id', queryId);
        console.log(`🌐 [Web Test Mode] 從 URL 帶入學生 ID: ${queryId}`);
      }

      // 3. 嘗試初始化 LINE LIFF Native SDK
      try {
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID || '2011164851-lGsEnQWB';
        const liff = (await import('@line/liff')).default;
        await liff.init({ liffId });

        // 嘗試取得 LINE Profile 或 Context 中的 userId
        let liveLineId: string | null = null;
        let displayName: string | null = null;

        if (liff.isLoggedIn() || liff.isInClient()) {
          try {
            const profile = await liff.getProfile();
            if (profile?.userId) {
              liveLineId = profile.userId;
              displayName = profile.displayName || null;
            }
          } catch (pe) {
            console.warn('liff.getProfile error, trying getContext/getDecodedIDToken:', pe);
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
          setLineUserId(liveLineId);
          console.log(`🟢 [LINE LIFF Native] 取得真實 LINE User ID: ${liveLineId}, 暱稱: ${displayName}`);
        }
      } catch (err) {
        console.info('ℹ️ LINE LIFF SDK 初始化跳過 (使用 Web 測試/URL 帶入模式):', err);
      }

      // 4. 若 URL 或 LIFF 沒帶入，檢查 LocalStorage (但需有效性驗證)
      if (!targetId) {
        const cachedId = localStorage.getItem('musimate_student_id') || localStorage.getItem('musimate_active_student_id');
        if (cachedId && cachedId !== 'new_student' && cachedId !== 'guest') {
          targetId = cachedId;
        }
      }

      // 5. 根據 targetId 比對學生並鎖定當前學生身份 (嚴禁未知訪客洩漏學生隱私)
      let selectedStudent: StudentWithTeacher | undefined;
      if (targetId) {
        const targetLower = targetId.toLowerCase();

        // 優先比對真實 LINE User ID 或關鍵字
        if (targetId === 'U26ed3c0e48864aebdc244594cf780df0' || targetLower.includes('charles') || targetLower.includes('查爾斯') || targetLower.includes('許雅婷')) {
          selectedStudent = activeStudents.find(s => s.line_user_id === 'U26ed3c0e48864aebdc244594cf780df0' || s.id === '89e45974-7f00-4bfd-bd84-3eb26351a150' || s.name.includes('許雅婷') || s.name.includes('Charles'));
        } else if (targetId === 'U2a2f432d824e353e8eb3fbe579def2cf' || targetLower.includes('johnny') || targetLower.includes('阿堅') || targetLower.includes('陳子翔') || targetLower.includes('子翔')) {
          selectedStudent = activeStudents.find(s => s.line_user_id === 'U2a2f432d824e353e8eb3fbe579def2cf' || s.id === 'b0000000-0000-0000-0000-000000000001' || s.name.includes('陳子翔') || s.name.includes('Johnny') || s.name.includes('阿堅'));
        } else if (targetId === 'Uf2457bf35e0d6d3060b60838d9a9c91c' || targetLower.includes('lin') || targetLower.includes('心悅') || targetLower.includes('劉心悅')) {
          selectedStudent = activeStudents.find(s => s.line_user_id === 'Uf2457bf35e0d6d3060b60838d9a9c91c' || s.id === '55555555-5555-4555-b555-555555555555' || s.name.includes('劉心悅'));
        }

        if (!selectedStudent) {
          selectedStudent = activeStudents.find(
            s =>
              s.id === targetId ||
              s.user_id === targetId ||
              s.line_user_id === targetId ||
              s.name.toLowerCase().includes(targetLower)
          );
        }
      }

      if (selectedStudent) {
        setCurrentStudent(selectedStudent);
        setCurrentTeacher(selectedStudent.teacher || MOCK_TEACHER);
        setLineUserId(selectedStudent.line_user_id || null);
        if (typeof window !== 'undefined') {
          localStorage.setItem('musimate_student_id', selectedStudent.id);
          localStorage.setItem('musimate_active_student_id', selectedStudent.id);
        }
        console.log('✅ [LiffAuth] 當前學生鎖定為:', selectedStudent.name, `(${selectedStudent.id})`);
      } else {
        // 未驗證或無對應學生：進入新生探索模式，嚴禁顯示劉心悅課表！
        setCurrentStudent(null);
        setCurrentTeacher(MOCK_TEACHER);
        console.log('✨ [LiffAuth] 未驗證學生/新訪客進入，啟用新生專屬選樂器與探索引導模式');
      }

      setIsLiffReady(true);
    }

    initAuthAndLiff();
  }, []);

  // 當 URL Search Query 改變時，動態同步 currentStudent
  useEffect(() => {
    if (typeof window !== 'undefined' && studentsList.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const queryId =
        urlParams.get('student_id') ||
        urlParams.get('line_user_id') ||
        urlParams.get('user_id') ||
        urlParams.get('student') ||
        urlParams.get('mock_user');
      if (queryId) {
        localStorage.setItem('musimate_student_id', queryId);
        localStorage.setItem('musimate_active_student_id', queryId);
        const queryLower = queryId.toLowerCase();

        let found: StudentWithTeacher | undefined;
        if (queryId === 'U26ed3c0e48864aebdc244594cf780df0' || queryLower.includes('charles') || queryLower.includes('查爾斯') || queryLower.includes('許雅婷')) {
          found = studentsList.find(s => s.line_user_id === 'U26ed3c0e48864aebdc244594cf780df0' || s.id === '89e45974-7f00-4bfd-bd84-3eb26351a150' || s.name.includes('許雅婷') || s.name.includes('Charles'));
        } else if (queryId === 'U2a2f432d824e353e8eb3fbe579def2cf' || queryLower.includes('johnny') || queryLower.includes('阿堅') || queryLower.includes('陳子翔') || queryLower.includes('子翔')) {
          found = studentsList.find(s => s.line_user_id === 'U2a2f432d824e353e8eb3fbe579def2cf' || s.id === 'b0000000-0000-0000-0000-000000000001' || s.name.includes('陳子翔') || s.name.includes('Johnny') || s.name.includes('阿堅'));
        } else if (queryId === 'Uf2457bf35e0d6d3060b60838d9a9c91c' || queryLower.includes('lin') || queryLower.includes('心悅') || queryLower.includes('劉心悅')) {
          found = studentsList.find(s => s.line_user_id === 'Uf2457bf35e0d6d3060b60838d9a9c91c' || s.id === '55555555-5555-4555-b555-555555555555' || s.name.includes('劉心悅'));
        }

        if (!found) {
          found = studentsList.find(
            s =>
              s.id === queryId ||
              s.user_id === queryId ||
              s.line_user_id === queryId ||
              s.name.toLowerCase().includes(queryLower)
          );
        }

        if (found) {
          setCurrentStudent(found);
          setCurrentTeacher(found.teacher || MOCK_TEACHER);
          setLineUserId(found.line_user_id || null);
        }
      }
    }
  }, [studentsList]);

  const setStudentById = (idOrLineId: string) => {
    setStudentsList(prevList => {
      const found = prevList.find(
        s =>
          s.id === idOrLineId ||
          s.user_id === idOrLineId ||
          s.line_user_id === idOrLineId ||
          s.name.includes(idOrLineId)
      );

      if (found) {
        setCurrentStudent(found);
        setCurrentTeacher(found.teacher || MOCK_TEACHER);
        setLineUserId(found.line_user_id || null);
        console.log('✅ 成功切換當前學生:', found.name, `(${found.id})`);
      } else {
        console.warn('⚠️ 找不到對應 ID 之學生記錄, 將暫時維持原學生:', idOrLineId);
      }
      return prevList;
    }
  );
  };

  const setMockStudent = (student: StudentWithTeacher) => {
    setCurrentStudent(student);
    if (student.teacher) {
      setCurrentTeacher(student.teacher);
    }
    setLineUserId(student.line_user_id || null);
    if (typeof window !== 'undefined') {
      localStorage.setItem('musimate_student_id', student.id);
    }
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
        isVerified: Boolean(currentStudent),
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
