import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const availableSlots = [
    {
      id: 'slot-01',
      date: '2026/09/16 (三)',
      start_time: '14:00',
      end_time: '15:00',
      teacher_name: '林佩芬 老師',
      location: '琴房 A303',
      available: true,
    },
    {
      id: 'slot-02',
      date: '2026/09/18 (五)',
      start_time: '16:00',
      end_time: '17:00',
      teacher_name: '林佩芬 老師',
      location: '琴房 A303',
      available: true,
    },
    {
      id: 'slot-03',
      date: '2026/09/23 (三)',
      start_time: '10:00',
      end_time: '11:00',
      teacher_name: '林佩芬 老師',
      location: '琴房 A303',
      available: true,
    },
  ];

  return NextResponse.json({
    success: true,
    source: 'available_slots',
    data: {
      teacher_name: '林佩芬 老師',
      instrument: '古典鋼琴 (Piano)',
      available_slots: availableSlots,
      vouchers: [
        {
          id: 'vouch-01',
          code: 'MKUP-2026-LIN-01',
          name: '30 天彈性補課券',
          expires_at: '2026/10/12',
          status: 'ACTIVE',
        }
      ]
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({
      success: true,
      message: '調課/請假申請已成功送出！指導老師將於 24 小時內確認。',
      data: body,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
