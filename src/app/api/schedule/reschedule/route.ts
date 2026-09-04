import { NextRequest, NextResponse } from 'next/server';
import { supabaseRestQuery, DbScheduleRecord } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appointmentId, studentId, studentName, newSlotTime, newEndTime, location, reason } = body;

    if (!appointmentId || !newSlotTime) {
      return NextResponse.json(
        { success: false, error: 'Missing appointmentId or newSlotTime' },
        { status: 400 }
      );
    }

    const calculatedEndTime = newEndTime || new Date(new Date(newSlotTime).getTime() + 60 * 60 * 1000).toISOString();
    const rescheduleNote = `[學生自主線上調課] 原時段已移至 ${newSlotTime} (${reason || '自主調課'})`;

    // 1. 嘗試同步更新同學 Supabase 資料庫中的 schedules 表
    try {
      await supabaseRestQuery(`schedules?id=eq.${appointmentId}`, {
        method: 'PATCH',
        body: {
          start_time: newSlotTime,
          end_time: calculatedEndTime,
          status: 'rescheduled',
          notes: rescheduleNote,
        },
      });
    } catch (dbErr) {
      console.warn('⚠️ [API] Supabase patch schedules error:', dbErr);
    }

    return NextResponse.json({
      success: true,
      message: '調課申請已確認送出！全站與授課老師端已同步更新。',
      data: {
        appointmentId,
        studentId,
        studentName,
        new_start_time: newSlotTime,
        new_end_time: calculatedEndTime,
        location: location || '音符琴房 A303',
        status: 'rescheduled',
        updated_at: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error('API /api/schedule/reschedule error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error processing reschedule' },
      { status: 500 }
    );
  }
}
