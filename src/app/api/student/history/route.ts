import { NextResponse } from 'next/server';

/**
 * 違規/曠課罰則計算輔助函式
 * 規則：
 * 開課 24 小時內才請假或是未請假未報到算曠課。
 * 一年內第 1 次扣款 10%，第 2 次 30%，第 3 次 50%，第 4 次以上全額 (100%)。
 * 一年內計算邏輯從第一次曠課日開始起算。
 */
function calculateInfractionPenalty(
  infractionCountInCycle: number
): { penaltyRate: number; penaltyLabel: string } {
  if (infractionCountInCycle <= 1) {
    return { penaltyRate: 0.1, penaltyLabel: '今年第 1 次，扣款 10%' };
  } else if (infractionCountInCycle === 2) {
    return { penaltyRate: 0.3, penaltyLabel: '今年第 2 次，扣款 30%' };
  } else if (infractionCountInCycle === 3) {
    return { penaltyRate: 0.5, penaltyLabel: '今年第 3 次，扣款 50%' };
  } else {
    return { penaltyRate: 1.0, penaltyLabel: `今年第 ${infractionCountInCycle} 次，扣款全額 (100%)` };
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedTerm = parseInt(searchParams.get('term') || '3', 10);

    // Mock terms data (符合使用者真實設計與資料庫架構)
    const termsData: Record<number, any> = {
      3: {
        termNumber: 3,
        teacherName: '張老師',
        instrument: '鋼琴課',
        startDate: '2026/07/01',
        endDate: '2026/09/20',
        totalLessons: 10,
        completedLessons: 7,
        pendingRescheduleLessons: 1,
        rescheduleDeadline: '2026/10/04（該期結束後兩週內）',
        billingDeadline: '2026/09/20',
        billingSummary: {
          dueAmount: 8000,
          paidAmount: 8000,
          status: '已繳清',
          paymentDeadline: '2026/09/20',
          paymentMethod: '銀行轉帳',
          isPaidInFull: true,
        },
        lessons: [
          {
            id: 'l3-01',
            order: 1,
            time: '07/01 (二) 19:00-21:00',
            attendanceStatus: 'checked_in',
            statusLabel: '✅ 已報到',
            statusBg: '#E6F4EA',
            statusColor: '#137333',
            isPaid: true,
          },
          {
            id: 'l3-02',
            order: 2,
            time: '07/08 (二) 19:00-21:00',
            attendanceStatus: 'checked_in',
            statusLabel: '✅ 已報到',
            statusBg: '#E6F4EA',
            statusColor: '#137333',
            isPaid: true,
          },
          {
            id: 'l3-03',
            order: 3,
            time: '07/15 (二) 19:00-21:00',
            attendanceStatus: 'leave',
            statusLabel: '📝 已請假',
            subtext: '請於兩週內預約補課時段',
            statusBg: '#FEF7E0',
            statusColor: '#B06000',
            isPaid: true,
          },
          {
            id: 'l3-04',
            order: 4,
            time: '07/23 (三) 10:00-12:00',
            attendanceStatus: 'rescheduled',
            statusLabel: '🔄 已調課',
            statusBg: '#E8F0FE',
            statusColor: '#1A73E8',
            isPaid: true,
          },
          {
            id: 'l3-05',
            order: 5,
            time: '07/29 (二) 19:00-21:00',
            attendanceStatus: 'absent_unexcused',
            statusLabel: '❌ 未請假未報到',
            subtext: '今年第 1 次，扣款 10%',
            statusBg: '#FCE8E6',
            statusColor: '#C5221F',
            penaltyRate: 0.1,
            isPaid: true,
          },
          {
            id: 'l3-06',
            order: 6,
            time: '08/05 (二) 19:00-21:00',
            attendanceStatus: 'checked_in',
            statusLabel: '✅ 已報到',
            statusBg: '#E6F4EA',
            statusColor: '#137333',
            isPaid: true,
          },
          {
            id: 'l3-07',
            order: 7,
            time: '08/12 (二) 19:00-21:00',
            attendanceStatus: 'checked_in',
            statusLabel: '✅ 已報到',
            statusBg: '#E6F4EA',
            statusColor: '#137333',
            isPaid: true,
          },
          {
            id: 'l3-08',
            order: 8,
            time: '08/19 (二) 19:00-21:00',
            attendanceStatus: 'pending',
            statusLabel: '⏳ 待上課',
            statusBg: '#F1F3F4',
            statusColor: '#5F6368',
            isPaid: true,
          },
          {
            id: 'l3-09',
            order: 9,
            time: '08/26 (二) 19:00-21:00',
            attendanceStatus: 'pending',
            statusLabel: '⏳ 待上課',
            statusBg: '#F1F3F4',
            statusColor: '#5F6368',
            isPaid: true,
          },
          {
            id: 'l3-10',
            order: 10,
            time: '09/02 (二) 19:00-21:00',
            attendanceStatus: 'pending',
            statusLabel: '⏳ 待上課',
            statusBg: '#F1F3F4',
            statusColor: '#5F6368',
            isPaid: true,
          },
        ],
      },
      2: {
        termNumber: 2,
        teacherName: '張老師',
        instrument: '鋼琴課',
        startDate: '2026/04/01',
        endDate: '2026/06/20',
        totalLessons: 10,
        completedLessons: 10,
        pendingRescheduleLessons: 0,
        rescheduleDeadline: '2026/07/04',
        billingDeadline: '2026/06/10',
        billingSummary: {
          dueAmount: 8000,
          paidAmount: 8000,
          status: '已繳清',
          paymentDeadline: '2026/06/10',
          paymentMethod: '銀行轉帳',
          isPaidInFull: true,
        },
        lessons: Array.from({ length: 10 }).map((_, i) => ({
          id: `l2-0${i + 1}`,
          order: i + 1,
          time: `0${4 + Math.floor(i / 4)}/${(i * 7) % 28 + 1} (二) 19:00-21:00`,
          attendanceStatus: 'checked_in',
          statusLabel: '✅ 已報到',
          statusBg: '#E6F4EA',
          statusColor: '#137333',
          isPaid: true,
        })),
      },
      1: {
        termNumber: 1,
        teacherName: '張老師',
        instrument: '鋼琴課',
        startDate: '2026/01/05',
        endDate: '2026/03/25',
        totalLessons: 10,
        completedLessons: 10,
        pendingRescheduleLessons: 0,
        rescheduleDeadline: '2026/04/08',
        billingDeadline: '2026/03/15',
        billingSummary: {
          dueAmount: 8000,
          paidAmount: 8000,
          status: '已繳清',
          paymentDeadline: '2026/03/15',
          paymentMethod: '銀行轉帳',
          isPaidInFull: true,
        },
        lessons: Array.from({ length: 10 }).map((_, i) => ({
          id: `l1-0${i + 1}`,
          order: i + 1,
          time: `0${1 + Math.floor(i / 4)}/${(i * 7) % 28 + 5} (二) 19:00-21:00`,
          attendanceStatus: 'checked_in',
          statusLabel: '✅ 已報到',
          statusBg: '#E6F4EA',
          statusColor: '#137333',
          isPaid: true,
        })),
      },
    };

    // 歷史發票明細清單
    const billingInvoices = [
      { id: 'inv-3', termNumber: 3, amount: 8000, paidDate: '2026/09/05', status: '已核對' },
      { id: 'inv-2', termNumber: 2, amount: 8000, paidDate: '2026/06/10', status: '已核對' },
      { id: 'inv-1', termNumber: 1, amount: 8000, paidDate: '2026/03/15', status: '已核對' },
    ];

    const currentTermData = termsData[requestedTerm] || termsData[3];

    return NextResponse.json({
      success: true,
      currentTerm: requestedTerm,
      totalTerms: 3,
      termData: currentTermData,
      billingInvoices,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || '無法取得歷史紀錄' },
      { status: 500 }
    );
  }
}
