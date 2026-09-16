import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || 'http://localhost:8000';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let studentId = searchParams.get('student_id') || searchParams.get('user_id') || searchParams.get('line_user_id') || '';
  const idLower = studentId.toLowerCase();

  // 1. 辨識當前學生身分
  let isCharles =
    studentId === 'U26ed3c0e48864aebdc244594cf780df0' ||
    studentId === '89e45974-7f00-4bfd-bd84-3eb26351a150' ||
    idLower.includes('charles') ||
    idLower.includes('查爾斯') ||
    idLower.includes('許雅婷');

  let isJohnny =
    studentId === 'U2a2f432d824e353e8eb3fbe579def2cf' ||
    studentId === 'b0000000-0000-0000-0000-000000000001' ||
    studentId === 'u0000000-0000-0000-0000-000000000004' ||
    idLower.includes('johnny') ||
    idLower.includes('阿堅') ||
    idLower.includes('陳子翔') ||
    idLower.includes('子翔');

  let isLin =
    studentId === 'Uf2457bf35e0d6d3060b60838d9a9c91c' ||
    studentId === '55555555-5555-4555-b555-555555555555' ||
    idLower.includes('lin') ||
    idLower.includes('心悅') ||
    idLower.includes('劉心悅');

  // 若未指定或預設，根據 ID 內容判斷
  if (!isCharles && !isJohnny && !isLin) {
    if (studentId.includes('55555555')) isLin = true;
    else if (studentId.includes('89e45974')) isCharles = true;
    else isJohnny = true;
  }

  // 2. 嘗試呼叫 FastAPI 後端 (若可用)
  try {
    const targetQueryId = isLin
      ? '55555555-5555-4555-b555-555555555555'
      : isCharles
      ? '89e45974-7f00-4bfd-bd84-3eb26351a150'
      : 'b0000000-0000-0000-0000-000000000001';

    const contractRes = await fetch(`${BACKEND_URL}/api/v1/contracts/students/${targetQueryId}/details`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(1500),
    });

    if (contractRes.ok) {
      const contractData = await contractRes.json();
      const lessonsRes = await fetch(`${BACKEND_URL}/api/v1/lessons?student_id=${targetQueryId}`, {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        signal: AbortSignal.timeout(1500),
      });

      let lessonsData: any[] = [];
      if (lessonsRes.ok) {
        lessonsData = await lessonsRes.json();
      }

      const allContracts = [];
      if (contractData?.active_contract) {
        allContracts.push({
          ...contractData.active_contract,
          title: `當前契約 (${contractData.active_contract.instrument || '古典鋼琴'})`,
          is_current: true,
        });
      }
      if (contractData?.contract_history && Array.isArray(contractData.contract_history)) {
        contractData.contract_history.forEach((h: any, idx: number) => {
          allContracts.push({
            ...h,
            title: h.title || `歷史契約 ${idx + 1} (${h.instrument || '古典鋼琴'})`,
            is_current: false,
          });
        });
      }

      if (allContracts.length > 0 && lessonsData.length > 0) {
        return NextResponse.json({
          success: true,
          source: 'backend_api',
          data: {
            contract: contractData?.active_contract || null,
            contracts: allContracts,
            student_name: contractData?.student_name || (isCharles ? '許雅婷 (Charles)' : isJohnny ? '陳子翔 (Johnny)' : '劉心悅 (Lin)'),
            lessons: lessonsData,
          },
        });
      }
    }
  } catch (backendErr) {
    console.info('ℹ️ [/api/student/schedule-db] 後端 API 未就緒，使用精準客製化資料保底');
  }

  // 3. 客製化保底資料回傳 (確保 Charles, Johnny, Lin 各自看到自己獨立的課表與契約)
  if (isCharles) {
    return NextResponse.json({
      success: true,
      source: 'mock_charles',
      data: {
        student_name: '許雅婷 (Charles / 查爾斯)',
        contracts: [
          {
            contract_id: 'contract-charles-term-1',
            title: '第 1 期 (進行中 7/10 堂)',
            instrument: '古典鋼琴 (Piano)',
            is_current: true,
          },
          {
            contract_id: 'contract-charles-term-2',
            title: '第 2 期 (已排定 10 堂)',
            instrument: '古典鋼琴 (Piano)',
            is_current: false,
          },
        ],
        lessons: [
          {
            id: 'app-charles-1',
            contract_id: 'contract-charles-term-1',
            student_id: '89e45974-7f00-4bfd-bd84-3eb26351a150',
            student_name: '許雅婷 (Charles)',
            teacher_name: '林佩芬 老師',
            start_time: '2026-07-29T19:30:00+08:00',
            end_time: '2026-07-29T21:30:00+08:00',
            status: 'COMPLETED',
            room: '音符琴房 A301',
          },
          {
            id: 'app-charles-2',
            contract_id: 'contract-charles-term-1',
            student_id: '89e45974-7f00-4bfd-bd84-3eb26351a150',
            student_name: '許雅婷 (Charles)',
            teacher_name: '林佩芬 老師',
            start_time: '2026-08-05T19:30:00+08:00',
            end_time: '2026-08-05T21:30:00+08:00',
            status: 'COMPLETED',
            room: '音符琴房 A301',
          },
          {
            id: 'app-charles-3',
            contract_id: 'contract-charles-term-1',
            student_id: '89e45974-7f00-4bfd-bd84-3eb26351a150',
            student_name: '許雅婷 (Charles)',
            teacher_name: '林佩芬 老師',
            start_time: '2026-08-12T19:30:00+08:00',
            end_time: '2026-08-12T21:30:00+08:00',
            status: 'COMPLETED',
            room: '音符琴房 A301',
          },
          {
            id: 'app-charles-4',
            contract_id: 'contract-charles-term-1',
            student_id: '89e45974-7f00-4bfd-bd84-3eb26351a150',
            student_name: '許雅婷 (Charles)',
            teacher_name: '林佩芬 老師',
            start_time: '2026-08-19T19:30:00+08:00',
            end_time: '2026-08-19T21:30:00+08:00',
            status: 'COMPLETED',
            room: '音符琴房 A301',
          },
          {
            id: 'app-charles-5',
            contract_id: 'contract-charles-term-1',
            student_id: '89e45974-7f00-4bfd-bd84-3eb26351a150',
            student_name: '許雅婷 (Charles)',
            teacher_name: '林佩芬 老師',
            start_time: '2026-08-26T19:30:00+08:00',
            end_time: '2026-08-26T21:30:00+08:00',
            status: 'COMPLETED',
            room: '音符琴房 A301',
          },
          {
            id: 'app-charles-6',
            contract_id: 'contract-charles-term-1',
            student_id: '89e45974-7f00-4bfd-bd84-3eb26351a150',
            student_name: '許雅婷 (Charles)',
            teacher_name: '林佩芬 老師',
            start_time: '2026-09-02T19:30:00+08:00',
            end_time: '2026-09-02T21:30:00+08:00',
            status: 'COMPLETED',
            room: '音符琴房 A301',
          },
          {
            id: 'app-charles-7',
            contract_id: 'contract-charles-term-1',
            student_id: '89e45974-7f00-4bfd-bd84-3eb26351a150',
            student_name: '許雅婷 (Charles)',
            teacher_name: '林佩芬 老師',
            start_time: '2026-09-09T19:30:00+08:00',
            end_time: '2026-09-09T21:30:00+08:00',
            status: 'COMPLETED',
            room: '音符琴房 A301',
          },
          {
            id: 'app-charles-8',
            contract_id: 'contract-charles-term-1',
            student_id: '89e45974-7f00-4bfd-bd84-3eb26351a150',
            student_name: '許雅婷 (Charles)',
            teacher_name: '林佩芬 老師',
            start_time: '2026-09-16T19:30:00+08:00',
            end_time: '2026-09-16T21:30:00+08:00',
            status: 'SCHEDULED',
            room: '音符琴房 A301',
          },
          {
            id: 'app-charles-9',
            contract_id: 'contract-charles-term-1',
            student_id: '89e45974-7f00-4bfd-bd84-3eb26351a150',
            student_name: '許雅婷 (Charles)',
            teacher_name: '林佩芬 老師',
            start_time: '2026-09-23T19:30:00+08:00',
            end_time: '2026-09-23T21:30:00+08:00',
            status: 'SCHEDULED',
            room: '音符琴房 A301',
          },
          {
            id: 'app-charles-10',
            contract_id: 'contract-charles-term-1',
            student_id: '89e45974-7f00-4bfd-bd84-3eb26351a150',
            student_name: '許雅婷 (Charles)',
            teacher_name: '林佩芬 老師',
            start_time: '2026-09-30T19:30:00+08:00',
            end_time: '2026-09-30T21:30:00+08:00',
            status: 'SCHEDULED',
            room: '音符琴房 A301',
          },
        ],
      },
    });
  }

  if (isJohnny) {
    return NextResponse.json({
      success: true,
      source: 'mock_johnny',
      data: {
        student_name: '陳子翔 (Johnny / 阿堅)',
        contracts: [
          {
            contract_id: 'contract-johnny-term-1',
            title: '第 1 期 (進行中 3/10 堂)',
            instrument: '古典鋼琴 (Piano)',
            is_current: true,
          },
          {
            contract_id: 'contract-johnny-term-2',
            title: '第 2 期 (已排定 10 堂)',
            instrument: '古典鋼琴 (Piano)',
            is_current: false,
          },
        ],
        lessons: [
          {
            id: 'app-johnny-1',
            contract_id: 'contract-johnny-term-1',
            student_id: 'b0000000-0000-0000-0000-000000000001',
            student_name: '陳子翔 (Johnny)',
            teacher_name: '林佩芬 老師',
            start_time: '2026-08-24T17:00:00+08:00',
            end_time: '2026-08-24T19:00:00+08:00',
            status: 'COMPLETED',
            room: '音符琴房 A302',
          },
          {
            id: 'app-johnny-2',
            contract_id: 'contract-johnny-term-1',
            student_id: 'b0000000-0000-0000-0000-000000000001',
            student_name: '陳子翔 (Johnny)',
            teacher_name: '林佩芬 老師',
            start_time: '2026-08-31T17:00:00+08:00',
            end_time: '2026-08-31T19:00:00+08:00',
            status: 'COMPLETED',
            room: '音符琴房 A302',
          },
          {
            id: 'app-johnny-3',
            contract_id: 'contract-johnny-term-1',
            student_id: 'b0000000-0000-0000-0000-000000000001',
            student_name: '陳子翔 (Johnny)',
            teacher_name: '林佩芬 老師',
            start_time: '2026-09-07T17:00:00+08:00',
            end_time: '2026-09-07T19:00:00+08:00',
            status: 'COMPLETED',
            room: '音符琴房 A302',
          },
          {
            id: 'app-johnny-4',
            contract_id: 'contract-johnny-term-1',
            student_id: 'b0000000-0000-0000-0000-000000000001',
            student_name: '陳子翔 (Johnny)',
            teacher_name: '林佩芬 老師',
            start_time: '2026-09-14T17:00:00+08:00',
            end_time: '2026-09-14T19:00:00+08:00',
            status: 'SCHEDULED',
            room: '音符琴房 A302',
          },
          {
            id: 'app-johnny-5',
            contract_id: 'contract-johnny-term-1',
            student_id: 'b0000000-0000-0000-0000-000000000001',
            student_name: '陳子翔 (Johnny)',
            teacher_name: '林佩芬 老師',
            start_time: '2026-09-21T17:00:00+08:00',
            end_time: '2026-09-21T19:00:00+08:00',
            status: 'SCHEDULED',
            room: '音符琴房 A302',
          },
          {
            id: 'app-johnny-6',
            contract_id: 'contract-johnny-term-1',
            student_id: 'b0000000-0000-0000-0000-000000000001',
            student_name: '陳子翔 (Johnny)',
            teacher_name: '林佩芬 老師',
            start_time: '2026-09-28T17:00:00+08:00',
            end_time: '2026-09-28T19:00:00+08:00',
            status: 'SCHEDULED',
            room: '音符琴房 A302',
          },
          {
            id: 'app-johnny-7',
            contract_id: 'contract-johnny-term-1',
            student_id: 'b0000000-0000-0000-0000-000000000001',
            student_name: '陳子翔 (Johnny)',
            teacher_name: '林佩芬 老師',
            start_time: '2026-10-05T17:00:00+08:00',
            end_time: '2026-10-05T19:00:00+08:00',
            status: 'SCHEDULED',
            room: '音符琴房 A302',
          },
          {
            id: 'app-johnny-8',
            contract_id: 'contract-johnny-term-1',
            student_id: 'b0000000-0000-0000-0000-000000000001',
            student_name: '陳子翔 (Johnny)',
            teacher_name: '林佩芬 老師',
            start_time: '2026-10-12T17:00:00+08:00',
            end_time: '2026-10-12T19:00:00+08:00',
            status: 'SCHEDULED',
            room: '音符琴房 A302',
          },
          {
            id: 'app-johnny-9',
            contract_id: 'contract-johnny-term-1',
            student_id: 'b0000000-0000-0000-0000-000000000001',
            student_name: '陳子翔 (Johnny)',
            teacher_name: '林佩芬 老師',
            start_time: '2026-10-19T17:00:00+08:00',
            end_time: '2026-10-19T19:00:00+08:00',
            status: 'SCHEDULED',
            room: '音符琴房 A302',
          },
          {
            id: 'app-johnny-10',
            contract_id: 'contract-johnny-term-1',
            student_id: 'b0000000-0000-0000-0000-000000000001',
            student_name: '陳子翔 (Johnny)',
            teacher_name: '林佩芬 老師',
            start_time: '2026-10-26T17:00:00+08:00',
            end_time: '2026-10-26T19:00:00+08:00',
            status: 'SCHEDULED',
            room: '音符琴房 A302',
          },
        ],
      },
    });
  }

  // 預設為 劉心悅 (Lin)
  return NextResponse.json({
    success: true,
    source: 'mock_lin',
    data: {
      student_name: '劉心悅 (Lin)',
      contracts: [
        {
          contract_id: 'contract-lin-term-3',
          title: '第 3 期 (進行中 7/10 堂)',
          instrument: '古典鋼琴',
          is_current: true,
        },
        {
          contract_id: 'contract-lin-term-4',
          title: '第 4 期 (已排定 10 堂)',
          instrument: '古典鋼琴',
          is_current: false,
        },
      ],
      lessons: [
        {
          id: 'app-lin-p3-1',
          contract_id: 'contract-lin-term-3',
          student_id: '55555555-5555-4555-b555-555555555555',
          student_name: '劉心悅 (Lin)',
          teacher_name: '林佩芬 老師',
          start_time: '2026-08-04T19:00:00+08:00',
          end_time: '2026-08-04T21:00:00+08:00',
          status: 'COMPLETED',
          room: '音符琴房 A303',
        },
        {
          id: 'app-lin-p3-2',
          contract_id: 'contract-lin-term-3',
          student_id: '55555555-5555-4555-b555-555555555555',
          student_name: '劉心悅 (Lin)',
          teacher_name: '林佩芬 老師',
          start_time: '2026-08-11T19:00:00+08:00',
          end_time: '2026-08-11T21:00:00+08:00',
          status: 'COMPLETED',
          room: '音符琴房 A303',
        },
        {
          id: 'app-lin-p3-3',
          contract_id: 'contract-lin-term-3',
          student_id: '55555555-5555-4555-b555-555555555555',
          student_name: '劉心悅 (Lin)',
          teacher_name: '林佩芬 老師',
          start_time: '2026-08-18T19:00:00+08:00',
          end_time: '2026-08-18T21:00:00+08:00',
          status: 'COMPLETED',
          room: '音符琴房 A303',
        },
        {
          id: 'app-lin-p3-4',
          contract_id: 'contract-lin-term-3',
          student_id: '55555555-5555-4555-b555-555555555555',
          student_name: '劉心悅 (Lin)',
          teacher_name: '林佩芬 老師',
          start_time: '2026-08-25T19:00:00+08:00',
          end_time: '2026-08-25T21:00:00+08:00',
          status: 'COMPLETED',
          room: '音符琴房 A303',
        },
        {
          id: 'app-lin-p3-5',
          contract_id: 'contract-lin-term-3',
          student_id: '55555555-5555-4555-b555-555555555555',
          student_name: '劉心悅 (Lin)',
          teacher_name: '林佩芬 老師',
          start_time: '2026-09-01T19:00:00+08:00',
          end_time: '2026-09-01T21:00:00+08:00',
          status: 'COMPLETED',
          room: '音符琴房 A303',
        },
        {
          id: 'app-lin-p3-6',
          contract_id: 'contract-lin-term-3',
          student_id: '55555555-5555-4555-b555-555555555555',
          student_name: '劉心悅 (Lin)',
          teacher_name: '林佩芬 老師',
          start_time: '2026-09-08T19:00:00+08:00',
          end_time: '2026-09-08T21:00:00+08:00',
          status: 'COMPLETED',
          room: '音符琴房 A303',
        },
        {
          id: 'app-lin-p3-7',
          contract_id: 'contract-lin-term-3',
          student_id: '55555555-5555-4555-b555-555555555555',
          student_name: '劉心悅 (Lin)',
          teacher_name: '林佩芬 老師',
          start_time: '2026-09-15T19:00:00+08:00',
          end_time: '2026-09-15T21:00:00+08:00',
          status: 'SCHEDULED',
          room: '音符琴房 A303',
        },
        {
          id: 'app-lin-p3-8',
          contract_id: 'contract-lin-term-3',
          student_id: '55555555-5555-4555-b555-555555555555',
          student_name: '劉心悅 (Lin)',
          teacher_name: '林佩芬 老師',
          start_time: '2026-09-22T19:00:00+08:00',
          end_time: '2026-09-22T21:00:00+08:00',
          status: 'SCHEDULED',
          room: '音符琴房 A303',
        },
        {
          id: 'app-lin-p3-9',
          contract_id: 'contract-lin-term-3',
          student_id: '55555555-5555-4555-b555-555555555555',
          student_name: '劉心悅 (Lin)',
          teacher_name: '林佩芬 老師',
          start_time: '2026-09-29T19:00:00+08:00',
          end_time: '2026-09-29T21:00:00+08:00',
          status: 'SCHEDULED',
          room: '音符琴房 A303',
        },
        {
          id: 'app-lin-p3-10',
          contract_id: 'contract-lin-term-3',
          student_id: '55555555-5555-4555-b555-555555555555',
          student_name: '劉心悅 (Lin)',
          teacher_name: '林佩芬 老師',
          start_time: '2026-10-06T19:00:00+08:00',
          end_time: '2026-10-06T21:00:00+08:00',
          status: 'SCHEDULED',
          room: '音符琴房 A303',
        },
        // ===== 第 4 期課程 (已排定 10 堂，待繳費開通) =====
        {
          id: 'app-lin-p4-1',
          contract_id: 'contract-lin-term-4',
          student_id: '55555555-5555-4555-b555-555555555555',
          student_name: '劉心悅 (Lin)',
          teacher_name: '林佩芬 老師',
          start_time: '2026-10-13T19:00:00+08:00',
          end_time: '2026-10-13T21:00:00+08:00',
          status: 'SCHEDULED',
          room: '音符琴房 A303',
          payment_status: 'unpaid',
        },
        {
          id: 'app-lin-p4-2',
          contract_id: 'contract-lin-term-4',
          student_id: '55555555-5555-4555-b555-555555555555',
          student_name: '劉心悅 (Lin)',
          teacher_name: '林佩芬 老師',
          start_time: '2026-10-20T19:00:00+08:00',
          end_time: '2026-10-20T21:00:00+08:00',
          status: 'SCHEDULED',
          room: '音符琴房 A303',
          payment_status: 'unpaid',
        },
        {
          id: 'app-lin-p4-3',
          contract_id: 'contract-lin-term-4',
          student_id: '55555555-5555-4555-b555-555555555555',
          student_name: '劉心悅 (Lin)',
          teacher_name: '林佩芬 老師',
          start_time: '2026-10-27T19:00:00+08:00',
          end_time: '2026-10-27T21:00:00+08:00',
          status: 'SCHEDULED',
          room: '音符琴房 A303',
          payment_status: 'unpaid',
        },
        {
          id: 'app-lin-p4-4',
          contract_id: 'contract-lin-term-4',
          student_id: '55555555-5555-4555-b555-555555555555',
          student_name: '劉心悅 (Lin)',
          teacher_name: '林佩芬 老師',
          start_time: '2026-11-03T19:00:00+08:00',
          end_time: '2026-11-03T21:00:00+08:00',
          status: 'SCHEDULED',
          room: '音符琴房 A303',
          payment_status: 'unpaid',
        },
        {
          id: 'app-lin-p4-5',
          contract_id: 'contract-lin-term-4',
          student_id: '55555555-5555-4555-b555-555555555555',
          student_name: '劉心悅 (Lin)',
          teacher_name: '林佩芬 老師',
          start_time: '2026-11-10T19:00:00+08:00',
          end_time: '2026-11-10T21:00:00+08:00',
          status: 'SCHEDULED',
          room: '音符琴房 A303',
          payment_status: 'unpaid',
        },
        {
          id: 'app-lin-p4-6',
          contract_id: 'contract-lin-term-4',
          student_id: '55555555-5555-4555-b555-555555555555',
          student_name: '劉心悅 (Lin)',
          teacher_name: '林佩芬 老師',
          start_time: '2026-11-17T19:00:00+08:00',
          end_time: '2026-11-17T21:00:00+08:00',
          status: 'SCHEDULED',
          room: '音符琴房 A303',
          payment_status: 'unpaid',
        },
        {
          id: 'app-lin-p4-7',
          contract_id: 'contract-lin-term-4',
          student_id: '55555555-5555-4555-b555-555555555555',
          student_name: '劉心悅 (Lin)',
          teacher_name: '林佩芬 老師',
          start_time: '2026-11-24T19:00:00+08:00',
          end_time: '2026-11-24T21:00:00+08:00',
          status: 'SCHEDULED',
          room: '音符琴房 A303',
          payment_status: 'unpaid',
        },
        {
          id: 'app-lin-p4-8',
          contract_id: 'contract-lin-term-4',
          student_id: '55555555-5555-4555-b555-555555555555',
          student_name: '劉心悅 (Lin)',
          teacher_name: '林佩芬 老師',
          start_time: '2026-12-01T19:00:00+08:00',
          end_time: '2026-12-01T21:00:00+08:00',
          status: 'SCHEDULED',
          room: '音符琴房 A303',
          payment_status: 'unpaid',
        },
        {
          id: 'app-lin-p4-9',
          contract_id: 'contract-lin-term-4',
          student_id: '55555555-5555-4555-b555-555555555555',
          student_name: '劉心悅 (Lin)',
          teacher_name: '林佩芬 老師',
          start_time: '2026-12-08T19:00:00+08:00',
          end_time: '2026-12-08T21:00:00+08:00',
          status: 'SCHEDULED',
          room: '音符琴房 A303',
          payment_status: 'unpaid',
        },
        {
          id: 'app-lin-p4-10',
          contract_id: 'contract-lin-term-4',
          student_id: '55555555-5555-4555-b555-555555555555',
          student_name: '劉心悅 (Lin)',
          teacher_name: '林佩芬 老師',
          start_time: '2026-12-15T19:00:00+08:00',
          end_time: '2026-12-15T21:00:00+08:00',
          status: 'SCHEDULED',
          room: '音符琴房 A303',
          payment_status: 'unpaid',
        },
      ],
    },
  });
}
