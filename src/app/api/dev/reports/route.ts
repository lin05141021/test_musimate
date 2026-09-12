import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const studentId = request.nextUrl.searchParams.get('student_id');

  const mockReports = [
    {
      id: 'rep-001',
      lesson_id: 'lesson-001',
      lesson_index: 1,
      lesson_title: '第 1 堂：車爾尼 Op.599 No.50 視奏驗收',
      date: '2026/09/05',
      summary: '今日心悅在車爾尼 Op.599 No.50 的音準掌握非常穩定，右手高音區觸鍵清晰具顆粒感。在踏板切換時需注意不要踩得太深，避免低音共鳴混濁。',
      technique_tips: [
        '第 9-16 小節雙手反向跳音需保持手腕放鬆，指尖站穩。',
        '第 24 小節華彩琶音請放慢以節拍器 72 BPM 練習，確定每個音均勻無漏音。',
        '左手分解和弦音量控制在 mf 以下，突顯右手主旋律。'
      ],
      assignment: {
        song: '車爾尼 Op.599 No.50 & 巴哈初步 No.1',
        target_bpm: 88,
        daily_minutes: 30,
      },
    }
  ];

  return NextResponse.json({
    success: true,
    source: 'reports',
    data: mockReports,
  });
}
