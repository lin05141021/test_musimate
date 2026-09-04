/**
 * MusiMate Supabase Client & REST Integration
 * 連線至同學之中央真實資料庫:
 * URL: https://iyzhwnvpqohdjqnrvqjq.supabase.co
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iyzhwnvpqohdjqnrvqjq.supabase.co';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_qhofcnT-u4Xbwv2QY1FjaA_vrdNOe_v';

export interface DbScheduleRecord {
  id?: string;
  teacher_id?: string;
  teacher_name?: string;
  student_id?: string;
  student_name?: string;
  start_time: string;
  end_time: string;
  date?: string;
  day_of_week?: string;
  time_slot?: string;
  duration?: string | number;
  room?: string;
  fee?: number | string;
  status?: string;
  schedule_type?: string;
  recurring?: boolean;
  notes?: string;
  created_at?: string;
}

export interface DbStudentRecord {
  id: string;
  name: string;
  instrument?: string;
  teacher_id?: string;
  email?: string;
  phone?: string;
}

export interface DbTeacherRecord {
  id: string;
  name: string;
  instrument?: string;
  bio?: string;
  gender?: string;
  email?: string;
}

/**
 * 萬用原生 Supabase REST 查詢工具 (零第三方套件相依，Node/Edge/Browser 皆可通用)
 */
export async function supabaseRestQuery<T = any>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
  } = {}
): Promise<{ data: T | null; error: any }> {
  try {
    const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
    const res = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
        ...(options.headers || {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!res.ok) {
      const errText = await res.text();
      return { data: null, error: new Error(`HTTP ${res.status}: ${errText}`) };
    }

    const data = await res.json();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * 取得 100 位同學預設學員清單
 */
export async function getSupabaseStudents(): Promise<DbStudentRecord[]> {
  const { data, error } = await supabaseRestQuery<DbStudentRecord[]>('students?select=*');
  if (error || !data) {
    console.warn('⚠️ [Supabase REST] 讀取學員失敗:', error);
    return [];
  }
  return data;
}

/**
 * 取得 20 位同學預設教師清單
 */
export async function getSupabaseTeachers(): Promise<DbTeacherRecord[]> {
  const { data, error } = await supabaseRestQuery<DbTeacherRecord[]>('teachers?select=*');
  if (error || !data) {
    console.warn('⚠️ [Supabase REST] 讀取教師失敗:', error);
    return [];
  }
  return data;
}

/**
 * 取得所有排程課表
 */
export async function getSupabaseSchedules(teacherId?: string): Promise<DbScheduleRecord[]> {
  let endpoint = 'schedules?select=*';
  if (teacherId) {
    endpoint += `&teacher_id=eq.${encodeURIComponent(teacherId)}`;
  }
  const { data, error } = await supabaseRestQuery<DbScheduleRecord[]>(endpoint);
  if (error || !data) {
    console.warn('⚠️ [Supabase REST] 讀取課表失敗:', error);
    return [];
  }
  return data;
}

/**
 * 寫入課表至同學資料庫
 */
export async function insertSupabaseSchedule(record: DbScheduleRecord): Promise<DbScheduleRecord | null> {
  const { data, error } = await supabaseRestQuery<DbScheduleRecord[]>('schedules', {
    method: 'POST',
    body: [record],
  });
  if (error || !data || data.length === 0) {
    console.warn('⚠️ [Supabase REST] 寫入課表失敗:', error);
    return null;
  }
  return data[0];
}
