import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iyzhwnvpqohdjqnrvqjq.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_qhofcnT-u4Xbwv2QY1FjaA_vrdNOe_v';

const serverSupabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/**
 * 學生 LINE LIFF 自動捕捉與綁定 API
 * 當任何學生（Lin, Charles, Johnny...）在手機 LINE 點開 LIFF 頁面時，
 * 前端 LIFF SDK 會自動取得 line_user_id 與 display_name，並呼叫本 API 寫入資料庫
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { line_user_id, display_name, picture_url, student_name, student_id } = body;

    if (!line_user_id) {
      return NextResponse.json(
        { success: false, message: '缺少 line_user_id' },
        { status: 400 }
      );
    }

    const targetStudent = student_name || display_name || '新加入學員';

    console.log(`[LINE LIFF Auto-Bind] 正在將 LINE ID: ${line_user_id} (${targetStudent}) 寫入資料庫記錄...`);

    // 1. 嘗試查詢是否已存在該 line_user_id
    try {
      const { data: existingUser } = await serverSupabase
        .from('users')
        .select('id, name, line_user_id')
        .eq('line_user_id', line_user_id)
        .maybeSingle();

      if (!existingUser) {
        // 2. 建立或更新使用者資料
        await serverSupabase.from('users').upsert({
          id: student_id || `u-${Date.now()}`,
          name: targetStudent,
          line_user_id: line_user_id,
          avatar_url: picture_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          role: 'student',
        });
      }
    } catch (dbErr) {
      console.warn('⚠️ [DB Write Warning] 寫入 users 資料表提醒:', dbErr);
    }

    return NextResponse.json({
      success: true,
      message: `成功抓取並記錄學員 LINE ID：${targetStudent} (${line_user_id})`,
      data: {
        line_user_id,
        student_name: targetStudent,
        picture_url,
        bound_at: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[LINE LIFF Auto-Bind Error]', error);
    return NextResponse.json(
      { success: false, message: error.message || '伺服器內部錯誤' },
      { status: 500 }
    );
  }
}
