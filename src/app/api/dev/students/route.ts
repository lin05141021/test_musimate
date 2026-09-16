import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iyzhwnvpqohdjqnrvqjq.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_qhofcnT-u4Xbwv2QY1FjaA_vrdNOe_v';

const serverSupabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const DEFAULT_TEACHER = {
  id: 'df637b26-7cab-443b-8801-4361fb35afdd',
  name: '林佩芬 老師',
  slug: 'peifen-piano',
  bio: '國立音樂系碩士，主修古典鋼琴教學與演奏，專精檢定輔導與基礎扎根。',
  hourly_rate: 1400,
};

const SEED_STUDENTS = [
  {
    id: '55555555-5555-4555-b555-555555555555',
    user_id: '55555555-5555-4555-b555-555555555555',
    name: '劉心悅 (Lin)',
    email: 'tel:0912345678',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    line_user_id: 'Uf2457bf35e0d6d3060b60838d9a9c91c',
    default_instrument: '古典鋼琴 (Piano)',
    rate_per_lesson: 1400,
    remaining_lessons: 8,
    teacher: DEFAULT_TEACHER,
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
    remaining_lessons: 10,
    teacher: DEFAULT_TEACHER,
  },
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    user_id: 'b0000000-0000-0000-0000-000000000001',
    name: '陳子翔 (Johnny / 阿堅)',
    email: 'johnny.student@harmony.edu',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    line_user_id: 'U2a2f432d824e353e8eb3fbe579def2cf',
    default_instrument: '古典鋼琴 (Piano)',
    rate_per_lesson: 1400,
    remaining_lessons: 10,
    teacher: DEFAULT_TEACHER,
  },
];

export async function GET() {
  try {
    // 1. 嘗試查詢學生資料表
    const { data: students, error } = await serverSupabase
      .from('students')
      .select('*')
      .order('name', { ascending: true });

    if (error || !students || students.length === 0) {
      return NextResponse.json({
        success: true,
        source: 'seed_fallback',
        total: SEED_STUDENTS.length,
        data: SEED_STUDENTS,
      });
    }

    // 2. 映射學生檔案，精準綁定 3 位真實測試者的 LINE User ID
    const formatted = students.map((s: any) => {
      let lineUserId = s.line_user_id || null;
      let matchedName = s.name || s.parent_name || '學員';

      if (
        s.id === '55555555-5555-4555-b555-555555555555' ||
        s.name?.includes('劉心悅') ||
        s.name?.includes('Lin')
      ) {
        lineUserId = 'Uf2457bf35e0d6d3060b60838d9a9c91c';
        matchedName = '劉心悅 (Lin)';
      } else if (
        s.id === '89e45974-7f00-4bfd-bd84-3eb26351a150' ||
        s.name?.includes('許雅婷') ||
        s.name?.includes('Charles') ||
        s.name?.includes('查爾斯')
      ) {
        lineUserId = 'U26ed3c0e48864aebdc244594cf780df0';
        matchedName = '許雅婷 (Charles / 查爾斯)';
      } else if (
        s.id === 'b0000000-0000-0000-0000-000000000001' ||
        s.id === 'u0000000-0000-0000-0000-000000000004' ||
        s.name?.includes('陳子翔') ||
        s.name?.includes('Johnny') ||
        s.name?.includes('阿堅')
      ) {
        lineUserId = 'U2a2f432d824e353e8eb3fbe579def2cf';
        matchedName = '陳子翔 (Johnny / 阿堅)';
      }

      return {
        id: s.id,
        user_id: s.id,
        name: matchedName,
        email: s.phone ? `tel:${s.phone}` : s.email || '',
        avatar_url: s.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        line_user_id: lineUserId,
        default_instrument: '古典鋼琴 (Piano)',
        rate_per_lesson: 1400,
        remaining_lessons: 8,
        teacher: DEFAULT_TEACHER,
      };
    });

    return NextResponse.json({
      success: true,
      source: 'database',
      total: formatted.length,
      data: formatted,
    });
  } catch (err: any) {
    console.error('❌ [API /api/dev/students] 伺服器異常，回傳種子名單:', err);
    return NextResponse.json({
      success: true,
      source: 'exception_fallback',
      total: SEED_STUDENTS.length,
      data: SEED_STUDENTS,
    });
  }
}
