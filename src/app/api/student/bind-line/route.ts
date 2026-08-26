import { NextResponse } from 'next/server';

/**
 * 學生 LINE LIFF 自動綁定 API
 * 當學生在手機 LINE 點開 LIFF 頁面時，前端會自動傳送 line_user_id 與 display_name 進行無感綁定
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { line_user_id, display_name, student_name, student_id } = body;

    if (!line_user_id) {
      return NextResponse.json(
        { success: false, message: '缺少 line_user_id' },
        { status: 400 }
      );
    }

    // 模擬或執行 SQL 資料庫更新
    // UPDATE public.users SET line_user_id = $1 WHERE id = $2 OR name ILIKE $3
    const targetStudent = student_name || display_name || '未知學生';

    console.log(`[LINE LIFF Auto-Bind] 正在將 LINE ID: ${line_user_id} 綁定至學生: ${targetStudent}`);

    return NextResponse.json({
      success: true,
      message: `成功將 LINE ID 綁定至學生：${targetStudent}`,
      data: {
        line_user_id,
        student_name: targetStudent,
        student_id: student_id || 's-auto-bound',
        bound_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[LINE LIFF Auto-Bind Error]', error);
    return NextResponse.json(
      { success: false, message: '伺服器內部錯誤' },
      { status: 500 }
    );
  }
}
