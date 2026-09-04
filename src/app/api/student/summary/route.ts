import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId') || '55555555-5555-4555-b555-555555555555';

    // 嘗試查詢 Supabase
    const { data, error } = await supabase
      .from('lesson_records')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return NextResponse.json({
        success: true,
        data,
        source: 'supabase',
      });
    }

    // 備用示範清單 (最新在最前，最早在最後)
    const fallbackList = [
      { id: 'lesson-5', song_title: '德布西：《貝加馬斯克組曲》第三首〈月光〉', created_at: '2026-09-02T10:00:00+08:00' },
      { id: 'lesson-4', song_title: '莫札特：G大調第三號小提琴協奏曲 第一樂章', created_at: '2026-08-29T15:30:00+08:00' },
      { id: 'lesson-3', song_title: '貝多芬：第十四號鋼琴奏鳴曲《月光》第三樂章', created_at: '2026-08-26T10:00:00+08:00' },
      { id: 'lesson-2', song_title: '蕭邦：降E大調夜曲 Op.9 No.2', created_at: '2026-08-19T10:00:00+08:00' },
      { id: 'lesson-1', song_title: '巴哈：E大調小提琴協奏曲 第一樂章', created_at: '2026-08-15T10:00:00+08:00' },
    ];

    return NextResponse.json({
      success: true,
      data: fallbackList,
      source: 'fallback_model',
      notice: error ? error.message : 'Supabase table not found or empty',
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
    });
  }
}
