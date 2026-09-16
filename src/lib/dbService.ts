import { supabase } from './supabase';
import { LessonItem, PracticeLog, StudentProfile } from '@/types';
import { MOCK_STUDENTS, MOCK_TEACHER } from '@/context/LiffAuthContext';

/**
 * MusiMate 學生端 Supabase 資料庫查詢與狀態操作服務
 * 支援: 1. 本地/雲端 Supabase 連線 2. 離線/未連線自動降級至 Mock 種子資料
 */
export const dbService = {
  // 1. 查詢學生即將進行之課堂
  async getStudentLessons(studentId: string): Promise<LessonItem[]> {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('student_id', studentId)
        .order('start_time', { ascending: true });

      if (error || !data || data.length === 0) {
        throw error || new Error('No live DB data');
      }

      return data.map((l, idx) => ({
        id: l.id,
        student_id: l.student_id,
        teacher_id: l.teacher_id,
        teacher_name: MOCK_TEACHER.name,
        start_time: l.start_time,
        end_time: l.end_time,
        location: l.location || '音符琴房 A301',
        status: l.status,
        instrument: '鋼琴 (Piano)',
        memo_notes: l.memo_notes,
        student_checkin_at: l.student_checkin_at,
        lesson_index: idx + 1,
        total_lessons: data.length,
      }));
    } catch (err) {
      console.info('ℹ️ Supabase 未連線或無資料，使用本地種子資料:', err);
      // 回傳本地模擬課堂
      return [
        {
          id: 'app-c1',
          student_id: studentId,
          teacher_id: MOCK_TEACHER.id,
          teacher_name: MOCK_TEACHER.name,
          start_time: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          end_time: new Date(Date.now() + 70 * 60 * 1000).toISOString(),
          location: '音符琴房 A301',
          status: 'SCHEDULED',
          instrument: '鋼琴 (Piano)',
          memo_notes: '巴哈創意曲 No.8 觸鍵訓練與速度穩定度',
          lesson_index: 9,
          total_lessons: 10,
        },
        {
          id: 'app-c2',
          student_id: studentId,
          teacher_id: MOCK_TEACHER.id,
          teacher_name: MOCK_TEACHER.name,
          start_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
          location: '音符琴房 A301',
          status: 'SCHEDULED',
          instrument: '鋼琴 (Piano)',
          memo_notes: '貝多芬第 1 號奏鳴曲 呈示部復習 (本期結業驗收)',
          lesson_index: 10,
          total_lessons: 10,
        },
      ];
    }
  },

  // 2. 學生抵達打卡 (STUDENT_ARRIVED)
  async checkInLesson(lessonId: string): Promise<boolean> {
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('lessons')
        .update({
          status: 'STUDENT_ARRIVED',
          student_checkin_at: now,
        })
        .eq('id', lessonId);

      if (error) throw error;
      console.log('✅ [Supabase] 學生打卡成功寫入資料庫:', lessonId);
      return true;
    } catch (err) {
      console.warn('⚠️ [Supabase] 打卡寫入失敗 (使用本機快取模式):', err);
      return true;
    }
  },

  // 3. 提交 15s 練琴打卡記錄
  async submitPracticeLog(log: Omit<PracticeLog, 'id'>): Promise<PracticeLog> {
    const newId = `log-${Date.now()}`;
    try {
      const { data, error } = await supabase
        .from('practice_logs')
        .insert([
          {
            student_id: log.student_id,
            song_title: log.song_title,
            duration_seconds: log.duration_seconds,
            audio_url: log.audio_url,
            bpm: log.bpm,
            bpm_stability_score: log.bpm_stability_score,
            pitch_accuracy_score: log.pitch_accuracy_score,
            ai_feedback_draft: log.ai_feedback_draft,
            status: 'PENDING_TEACHER_REVIEW',
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { ...data, id: data.id };
    } catch (err) {
      console.warn('⚠️ [Supabase] 練琴打卡寫入失敗 (使用本機模擬):', err);
      return { ...log, id: newId };
    }
  },
};
