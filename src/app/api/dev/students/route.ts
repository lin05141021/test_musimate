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

export async function GET() {
  try {
    // 1. 嘗試查詢學生資料表
    const { data: students, error } = await serverSupabase
      .from('students')
      .select('*')
      .order('name', { ascending: true });

    if (error || !students || students.length === 0) {
      console.warn('⚠️ [API /api/dev/students] 資料庫查詢異常，使用預設林佩芬與劉心悅檔案:', error);
      return NextResponse.json({
        success: true,
        source: 'seed_fallback',
        total: 1,
        data: [
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
          }
        ],
      });
    }

    // 2. 映射學生檔案，確保劉心悅綁定林佩芬老師
    const formatted = students.map((s: any) => {
      const isTargetStudent = s.name?.includes('劉心悅') || s.name?.includes('Lin') || s.id?.includes('55555555');
      return {
        id: s.id,
        user_id: s.id,
        name: s.name || s.parent_name || '學員',
        email: s.phone ? `tel:${s.phone}` : s.email || '',
        avatar_url: s.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        line_user_id: s.line_user_id || (isTargetStudent ? 'Uf2457bf35e0d6d3060b60838d9a9c91c' : null),
        default_instrument: '古典鋼琴 (Piano)',
        rate_per_lesson: 1400,
        remaining_lessons: 8,
        teacher: DEFAULT_TEACHER,
      };
    });

    // 確保劉心悅排在首位
    formatted.sort((a: any, b: any) => (a.name.includes('劉心悅') || a.id.includes('55555555') ? -1 : 1));

    return NextResponse.json({
      success: true,
      source: 'database',
      total: formatted.length,
      data: formatted,
    });
  } catch (err: any) {
    console.error('❌ [API /api/dev/students] 伺服器異常:', err);
    return NextResponse.json({
      success: false,
      source: 'exception',
      data: [],
      error: err.message,
    }, { status: 500 });
  }
}
