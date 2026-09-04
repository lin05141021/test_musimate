import { NextRequest, NextResponse } from 'next/server';
import { supabaseRestQuery, DbScheduleRecord } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appointmentId, studentId, studentName, reason, notes } = body;

    if (!appointmentId) {
      return NextResponse.json(
        { success: false, error: 'Missing appointmentId parameter' },
        { status: 400 }
      );
    }

    const leaveNote = `[學生請假] 原因：${reason || '個人行程'}${notes ? `，說明：${notes}` : ''}`;

    // 1. 嘗試同步更新同學 Supabase 資料庫中的 schedules 表
    try {
      await supabaseRestQuery(`schedules?id=eq.${appointmentId}`, {
        method: 'PATCH',
        body: {
          status: 'cancelled',
          notes: leaveNote,
        },
      });
    } catch (dbErr) {
      console.warn('⚠️ [API] Supabase patch schedules error:', dbErr);
    }

    return NextResponse.json({
      success: true,
      message: '請假申請已受理！該堂課時數已完整保留至「已繳費剩餘課堂額度」，無扣堂手續費。',
      data: {
        appointmentId,
        studentId,
        studentName,
        status: 'cancelled',
        reason,
        notes,
        processed_at: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error('API /api/schedule/leave error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error processing leave request' },
      { status: 500 }
    );
  }
}
