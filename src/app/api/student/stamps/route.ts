import { NextRequest, NextResponse } from 'next/server';
import { supabaseRestQuery } from '@/lib/supabaseClient';

export interface CheckinResponseData {
  student_id: string;
  period_term: number;
  total_slots: number;
  stamped_count: number;
  streak_days: number;
  has_checked_in_today: boolean;
  last_checkin_date: string;
  stamps: {
    slot_index: number;
    color: string;
    rotation: number;
    icon_type: string;
    checked_date: string;
    song_title?: string;
  }[];
  achievements: {
    key: string;
    title: string;
    subtitle: string;
    level: string;
    current_value: number;
    target_value: number;
    bg_color: string;
    icon: string;
  }[];
}

// 預設打卡與成就資料模型
const DEFAULT_CHECKIN_DATA: CheckinResponseData = {
  student_id: '55555555-5555-4555-b555-555555555555',
  period_term: 3,
  total_slots: 60,
  stamped_count: 18,
  streak_days: 7,
  has_checked_in_today: false,
  last_checkin_date: '2026-09-03',
  stamps: [
    { slot_index: 1, color: '#FFDDE2', rotation: -6, icon_type: 'note', checked_date: '08/17' },
    { slot_index: 2, color: '#D1F2EB', rotation: 5, icon_type: 'clef', checked_date: '08/18' },
    { slot_index: 3, color: '#E8D7F5', rotation: -4, icon_type: 'star', checked_date: '08/19' },
    { slot_index: 4, color: '#D4E6F1', rotation: 8, icon_type: 'flame', checked_date: '08/20' },
    { slot_index: 5, color: '#FDEBD0', rotation: -3, icon_type: 'headphone', checked_date: '08/21' },
    { slot_index: 6, color: '#FCF3CF', rotation: 6, icon_type: 'music', checked_date: '08/22' },
    { slot_index: 7, color: '#FFDDE2', rotation: -8, icon_type: 'sparkle', checked_date: '08/23' },
    { slot_index: 8, color: '#D1F2EB', rotation: 3, icon_type: 'note', checked_date: '08/24' },
    { slot_index: 9, color: '#E8D7F5', rotation: -5, icon_type: 'clef', checked_date: '08/25' },
    { slot_index: 10, color: '#D4E6F1', rotation: 7, icon_type: 'star', checked_date: '08/26' },
    { slot_index: 11, color: '#FDEBD0', rotation: -4, icon_type: 'flame', checked_date: '08/27' },
    { slot_index: 12, color: '#FCF3CF', rotation: 5, icon_type: 'headphone', checked_date: '08/28' },
    { slot_index: 13, color: '#FFDDE2', rotation: -7, icon_type: 'music', checked_date: '08/29' },
    { slot_index: 14, color: '#D1F2EB', rotation: 4, icon_type: 'sparkle', checked_date: '08/30' },
    { slot_index: 15, color: '#E8D7F5', rotation: -3, icon_type: 'note', checked_date: '08/31' },
    { slot_index: 16, color: '#D4E6F1', rotation: 6, icon_type: 'clef', checked_date: '09/01' },
    { slot_index: 17, color: '#FDEBD0', rotation: -6, icon_type: 'star', checked_date: '09/02' },
    { slot_index: 18, color: '#FCF3CF', rotation: 4, icon_type: 'flame', checked_date: '09/03' },
  ],
  achievements: [
    {
      key: 'streak',
      title: '🔥 努力堅持',
      subtitle: '連續練習打卡天數',
      level: 'Lv.1',
      current_value: 7,
      target_value: 14,
      bg_color: '#FDEBD0',
      icon: '🔥',
    },
    {
      key: 'rhythm',
      title: '🎵 節奏達人',
      subtitle: '打卡回饋中節奏評分累計',
      level: 'Lv.2',
      current_value: 65,
      target_value: 100,
      bg_color: '#E8D7F5',
      icon: '🎵',
    },
    {
      key: 'perfect',
      title: '⭐ 完美大師',
      subtitle: 'AI回饋高分次數',
      level: 'Lv.1',
      current_value: 3,
      target_value: 5,
      bg_color: '#FCF3CF',
      icon: '⭐',
    },
    {
      key: 'repertoire',
      title: '📚 曲目探索家',
      subtitle: '練習不同曲目數量',
      level: 'Lv.1',
      current_value: 8,
      target_value: 15,
      bg_color: '#D1F2EB',
      icon: '📚',
    },
    {
      key: 'attendance',
      title: '🌟 全勤之星',
      subtitle: '單期出席率',
      level: 'Lv.2',
      current_value: 18,
      target_value: 24,
      bg_color: '#D4E6F1',
      icon: '🌟',
    },
  ],
};

// 取得集章與成就資料
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id') || DEFAULT_CHECKIN_DATA.student_id;

    // 嘗試從 Supabase 讀取 (若存在 practice_checkins 表)
    try {
      const { data: dbCheckins, error } = await supabaseRestQuery(
        `practice_checkins?student_id=eq.${encodeURIComponent(studentId)}`
      );
      if (!error && Array.isArray(dbCheckins) && dbCheckins.length > 0) {
        return NextResponse.json({
          success: true,
          source: 'supabase',
          data: {
            ...DEFAULT_CHECKIN_DATA,
            stamped_count: dbCheckins.length,
          },
        });
      }
    } catch (dbErr) {
      console.warn('⚠️ [API] Supabase checkin query fallback:', dbErr);
    }

    return NextResponse.json({
      success: true,
      source: 'memory_fallback',
      data: DEFAULT_CHECKIN_DATA,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// 執行今日打卡簽到 (嚴格限制一天只能打卡一次)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { student_id, song_title, ai_score, ai_keywords } = body;

    const todayDate = new Date().toISOString().split('T')[0];

    // 檢查是否已打卡 (若同一天打過，拒絕重複打卡)
    if (DEFAULT_CHECKIN_DATA.has_checked_in_today && DEFAULT_CHECKIN_DATA.last_checkin_date === todayDate) {
      return NextResponse.json(
        {
          success: false,
          error: '您今天已經完成打卡囉！一天只能打卡一次，明天再接再厲！',
          has_checked_in_today: true,
        },
        { status: 400 }
      );
    }

    // 更新狀態
    DEFAULT_CHECKIN_DATA.stamped_count = Math.min(60, DEFAULT_CHECKIN_DATA.stamped_count + 1);
    DEFAULT_CHECKIN_DATA.streak_days += 1;
    DEFAULT_CHECKIN_DATA.has_checked_in_today = true;
    DEFAULT_CHECKIN_DATA.last_checkin_date = todayDate;

    // 新增一枚新印章 (第 19 格)
    const newSlotIndex = DEFAULT_CHECKIN_DATA.stamped_count;
    const colors = ['#FFDDE2', '#D1F2EB', '#E8D7F5', '#D4E6F1', '#FDEBD0', '#FCF3CF'];
    const icons = ['note', 'clef', 'star', 'flame', 'headphone', 'music', 'sparkle'];
    const randomColor = colors[(newSlotIndex - 1) % colors.length];
    const randomIcon = icons[(newSlotIndex - 1) % icons.length];
    const randomRotation = ((newSlotIndex * 17) % 15) - 7; // -7° ~ +7°

    DEFAULT_CHECKIN_DATA.stamps.push({
      slot_index: newSlotIndex,
      color: randomColor,
      rotation: randomRotation,
      icon_type: randomIcon,
      checked_date: '今日',
      song_title: song_title || '自主練習',
    });

    // 依 AI 關鍵字推進成就徽章
    DEFAULT_CHECKIN_DATA.achievements[0].current_value = DEFAULT_CHECKIN_DATA.streak_days; // 努力堅持
    if (ai_score && ai_score >= 90) {
      DEFAULT_CHECKIN_DATA.achievements[2].current_value = Math.min(
        5,
        DEFAULT_CHECKIN_DATA.achievements[2].current_value + 1
      ); // 完美大師
    }
    if (ai_keywords && ai_keywords.includes('節奏')) {
      DEFAULT_CHECKIN_DATA.achievements[1].current_value = Math.min(
        100,
        DEFAULT_CHECKIN_DATA.achievements[1].current_value + 15
      ); // 節奏達人
    }

    // 嘗試寫入 Supabase (若有建表)
    try {
      await supabaseRestQuery('practice_checkins', {
        method: 'POST',
        body: {
          student_id: student_id || DEFAULT_CHECKIN_DATA.student_id,
          checkin_date: todayDate,
          slot_index: newSlotIndex,
          notes: song_title,
        },
      });
    } catch (e) {
      // ignore
    }

    return NextResponse.json({
      success: true,
      message: '🎉 今日練習打卡成功！獲得一枚榮譽印章！',
      data: DEFAULT_CHECKIN_DATA,
      new_stamp: {
        slot_index: newSlotIndex,
        color: randomColor,
        rotation: randomRotation,
        icon_type: randomIcon,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
