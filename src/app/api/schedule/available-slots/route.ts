import { NextRequest, NextResponse } from 'next/server';
import { supabaseRestQuery, DbScheduleRecord } from '@/lib/supabaseClient';

interface AvailableSlotResponse {
  slot_id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  clash_reason?: string;
  location?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const teacherId = searchParams.get('teacherId');
  const studentId = searchParams.get('studentId');

  if (!teacherId) {
    return NextResponse.json({ error: 'Missing teacherId parameter' }, { status: 400 });
  }

  // 1. 優先從同學的 Supabase 資料庫讀取真實開放時段
  try {
    const { data: dbSchedules, error } = await supabaseRestQuery<DbScheduleRecord[]>('schedules?select=*');
    if (!error && Array.isArray(dbSchedules) && dbSchedules.length > 0) {
      const openSlots = dbSchedules.filter(
        (s) =>
          s.status === 'available' ||
          s.schedule_type === 'open' ||
          (s.student_name && s.student_name.includes('開放'))
      );

      if (openSlots.length > 0) {
        const availableSlots: AvailableSlotResponse[] = openSlots.map((s, idx) => ({
          slot_id: s.id || `slot-db-${idx}`,
          start_time: s.start_time,
          end_time: s.end_time,
          is_available: true,
          location: s.room || '音符琴房 A303',
        }));

        return NextResponse.json({
          success: true,
          source: 'supabase',
          teacher_id: teacherId,
          student_id: studentId,
          available_slots: availableSlots,
          total_db_records: dbSchedules.length,
        });
      }
    }
  } catch (err) {
    console.warn('⚠️ [API] Supabase available-slots query fallback:', err);
  }

  // 2. 本地演算法動態產生可用預約時段 (Fallback)
  const now = new Date();
  const getSlotDate = (days: number, hours: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    d.setHours(hours, 0, 0, 0);
    return d.toISOString();
  };

  const allTeacherSlots = [
    { id: 'slot-1', teacher_id: teacherId, start_time: getSlotDate(1, 14), end_time: getSlotDate(1, 15), is_available: true },
    { id: 'slot-2', teacher_id: teacherId, start_time: getSlotDate(1, 16), end_time: getSlotDate(1, 17), is_available: true },
    { id: 'slot-3', teacher_id: teacherId, start_time: getSlotDate(2, 10), end_time: getSlotDate(2, 11), is_available: true },
    { id: 'slot-4', teacher_id: teacherId, start_time: getSlotDate(2, 15), end_time: getSlotDate(2, 16), is_available: false },
    { id: 'slot-5', teacher_id: teacherId, start_time: getSlotDate(3, 19), end_time: getSlotDate(3, 20), is_available: true },
    { id: 'slot-6', teacher_id: teacherId, start_time: getSlotDate(4, 14), end_time: getSlotDate(4, 15), is_available: true },
  ];

  const existingAppointments = [
    { id: 'app-confidential-1', student_id: 'other-student-99', teacher_id: teacherId, start_time: getSlotDate(2, 15), end_time: getSlotDate(2, 16), status: 'confirmed' },
    { id: 'app-student-current', student_id: studentId || 'current-student', teacher_id: teacherId, start_time: getSlotDate(1, 10), end_time: getSlotDate(1, 11), status: 'confirmed' },
  ];

  const availableSlots: AvailableSlotResponse[] = [];

  for (const slot of allTeacherSlots) {
    if (!slot.is_available) continue;

    const slotStart = new Date(slot.start_time).getTime();
    const slotEnd = new Date(slot.end_time).getTime();

    const isOccupied = existingAppointments.some((app) => {
      if (app.status !== 'confirmed') return false;
      const appStart = new Date(app.start_time).getTime();
      const appEnd = new Date(app.end_time).getTime();
      return Math.max(slotStart, appStart) < Math.min(slotEnd, appEnd);
    });

    if (!isOccupied) {
      availableSlots.push({
        slot_id: slot.id,
        start_time: slot.start_time,
        end_time: slot.end_time,
        is_available: true,
      });
    }
  }

  return NextResponse.json({
    success: true,
    source: 'local-fallback',
    teacher_id: teacherId,
    student_id: studentId,
    available_slots: availableSlots,
    filtered_privacy_count: allTeacherSlots.length - availableSlots.length,
  });
}
