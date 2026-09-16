import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || 'http://localhost:8000';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let studentId = searchParams.get('student_id') || searchParams.get('user_id') || searchParams.get('line_user_id');

  if (!studentId || studentId.includes('陳子翔')) {
    studentId = 'b0000000-0000-0000-0000-000000000001';
  }

  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/v1/reports/history/${studentId}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!backendRes.ok) {
      console.warn(`⚠️ [/api/student/summary] Backend HTTP ${backendRes.status}`);
      return NextResponse.json({ success: true, data: [] });
    }

    const json = await backendRes.json();
    const rawReports = json.reports || [];

    // 格式化為前端 UI 所需之 LessonReportItem[] 介面
    const formattedData = rawReports.map((r: any, idx: number) => {
      const tips = (r.technique_guidance || '')
        .split('\n')
        .map((s: string) => s.trim().replace(/^[-•✦]\s*/, ''))
        .filter(Boolean);

      const firstAssign = r.assignments && r.assignments.length > 0 ? r.assignments[0] : null;

      return {
        id: r.id || r.lesson_id,
        lesson_id: r.lesson_id,
        lesson_index: rawReports.length - idx,
        lesson_title: firstAssign?.piece_name ? `鋼琴課 · ${firstAssign.piece_name}` : '鋼琴課堂學習週報',
        date: r.lesson_date || '2026/09/13',
        summary: r.summary_text || '本堂課練習狀況良好。',
        technique_tips: tips.length > 0 ? tips : ['保持手腕放鬆與指尖獨立度', '慢練注意拍頭清晰'],
        assignment: {
          song: firstAssign?.piece_name || '徹爾尼 Op.599 No.19',
          target_bpm: firstAssign?.target_bpm || 72,
          daily_minutes: 15,
        },
        audio_url: r.raw_audio_url || 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg',
        whisper_transcript: r.whisper_transcript || '',
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedData,
    });
  } catch (error: any) {
    console.error('⚠️ [/api/student/summary] API 呼叫異常:', error);
    return NextResponse.json({ success: true, data: [] });
  }
}
