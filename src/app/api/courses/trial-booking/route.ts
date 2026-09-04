import { NextRequest, NextResponse } from 'next/server';
import { supabaseRestQuery, DbScheduleRecord } from '@/lib/supabaseClient';

export interface TrialBookingPayload {
  student_name: string;
  teacher_name: string;
  instrument: string;
  time_slot: string;
  phone?: string;
  notes?: string;
  line_user_id?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TrialBookingPayload;
    const { student_name, teacher_name, instrument, time_slot, phone, notes, line_user_id } = body;

    if (!student_name || !teacher_name || !time_slot) {
      return NextResponse.json(
        { error: '請填寫完整預約資訊（學生姓名、指定導師、預約時段）' },
        { status: 400 }
      );
    }

    const bookingId = `TB-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
    const createdAt = new Date().toISOString();

    // 1. 嘗試將預約記錄寫入 Supabase 資料庫 (若有連接)
    let dbSuccess = false;
    try {
      const schedulePayload: DbScheduleRecord = {
        id: bookingId,
        student_id: '55555555-5555-4555-b555-555555555555',
        student_name: student_name || '劉心悅',
        teacher_id: 'u0000000-0000-0000-0000-000000000001',
        teacher_name,
        start_time: time_slot.includes('14:00') ? '2026-08-27T14:00:00+08:00' : new Date().toISOString(),
        end_time: time_slot.includes('14:30') ? '2026-08-27T14:30:00+08:00' : new Date().toISOString(),
        status: 'confirmed',
        schedule_type: 'trial',
        room: '音符琴房 A303',
        notes: `[新生試聽預約] 科目: ${instrument || '鋼琴'} | 電話: ${phone || '未提供'} | 備註: ${notes || '無'}`,
      };

      const { data: dbResult, error: dbError } = await supabaseRestQuery<DbScheduleRecord>('schedules', {
        method: 'POST',
        body: schedulePayload,
      });

      if (!dbError && dbResult) {
        dbSuccess = true;
      }
    } catch (dbErr) {
      console.warn('⚠️ [API] Supabase trial booking insert fallback:', dbErr);
    }

    // 2. 回傳預約成功結果
    return NextResponse.json({
      success: true,
      booking_id: bookingId,
      message: `已成功預約 ${teacher_name} 老師的【${instrument || '鋼琴'}】免費試上課程！`,
      details: {
        booking_id: bookingId,
        student_name: student_name || '劉心悅',
        teacher_name,
        instrument: instrument || '鋼琴',
        time_slot,
        fee: '免費 (原價 NT$ 800)',
        location: 'MusiMate 音符音樂中心 A303 琴房',
        created_at: createdAt,
        persisted_to_db: dbSuccess,
      },
    });
  } catch (error: any) {
    console.error('❌ [API] Error handling trial booking:', error);
    return NextResponse.json(
      { error: '預約失敗，請稍後再試或聯繫客服' },
      { status: 500 }
    );
  }
}
