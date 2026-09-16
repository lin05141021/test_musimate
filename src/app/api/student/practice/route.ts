import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || 'http://localhost:8000';

// 1. 查詢學生打卡歷史與今日次數 (GET)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let studentId = searchParams.get('student_id') || searchParams.get('user_id') || searchParams.get('line_user_id');

  if (!studentId || studentId.includes('陳子翔')) {
    studentId = 'b0000000-0000-0000-0000-000000000001';
  }

  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/v1/practice/student/${studentId}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (backendRes.ok) {
      const json = await backendRes.json();
      return NextResponse.json({
        success: true,
        today_checkins_count: json.today_checkins_count || 0,
        data: json.data || [],
      });
    }
  } catch (error: any) {
    console.error('⚠️ [/api/student/practice] API GET 呼叫異常:', error);
  }

  return NextResponse.json({
    success: true,
    today_checkins_count: 0,
    data: [],
  });
}

// 2. 提交 15s 練習打卡 (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const studentId = body.student_id || 'b0000000-0000-0000-0000-000000000001';

    // 準備 FormData 模擬傳送 15s 音訊
    const formData = new FormData();
    const blob = new Blob(['dummy audio content'], { type: 'audio/mp3' });
    formData.append('audio_file', blob, 'practice_checkin.mp3');

    const backendRes = await fetch(`${BACKEND_URL}/api/v1/practice/submit-checkin`, {
      method: 'POST',
      body: formData,
    });

    if (backendRes.ok) {
      const json = await backendRes.json();
      return NextResponse.json({
        success: true,
        data: json,
      });
    }
  } catch (error: any) {
    console.error('⚠️ [/api/student/practice] API POST 呼叫異常:', error);
  }

  return NextResponse.json(
    { success: false, error: 'Submit practice checkin failed' },
    { status: 500 }
  );
}

// 3. 自主刪除待審核打卡紀錄 (DELETE)
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const logId = searchParams.get('log_id') || searchParams.get('id');

  if (!logId) {
    return NextResponse.json({ success: false, error: 'Missing log_id' }, { status: 400 });
  }

  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/v1/practice/${logId}`, {
      method: 'DELETE',
    });

    if (backendRes.ok) {
      const json = await backendRes.json();
      return NextResponse.json({
        success: true,
        message: json.message || '刪除成功',
      });
    } else {
      const json = await backendRes.json();
      return NextResponse.json(
        { success: false, error: json.detail || '刪除失敗' },
        { status: backendRes.status }
      );
    }
  } catch (error: any) {
    console.error('⚠️ [/api/student/practice] API DELETE 呼叫異常:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
