import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iyzhwnvpqohdjqnrvqjq.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_qhofcnT-u4Xbwv2QY1FjaA_vrdNOe_v';

const serverSupabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// 台灣各家主要銀行清單代碼與帳號格式
const TAIWAN_BANKS = [
  { code: '013', name: '國泰世華銀行 (013)' },
  { code: '822', name: '中國信託商業銀行 (822)' },
  { code: '012', name: '台北富邦銀行 (012)' },
  { code: '808', name: '玉山商業銀行 (808)' },
  { code: '004', name: '臺灣銀行 (004)' },
  { code: '006', name: '合作金庫銀行 (006)' },
  { code: '008', name: '華南商業銀行 (008)' },
  { code: '007', name: '第一商業銀行 (007)' },
  { code: '017', name: '兆豐國際商業銀行 (017)' },
  { code: '812', name: '台新國際商業銀行 (812)' },
  { code: '807', name: '永豐商業銀行 (807)' },
  { code: '803', name: '聯邦商業銀行 (803)' },
  { code: '009', name: '彰化商業銀行 (009)' },
  { code: '011', name: '上海商業儲蓄銀行 (011)' },
  { code: '805', name: '遠東國際商業銀行 (805)' },
  { code: '809', name: '凱基商業銀行 (809)' },
  { code: '806', name: '元大商業銀行 (806)' },
  { code: '005', name: '臺灣土地銀行 (005)' },
  { code: '103', name: '臺灣新光商業銀行 (103)' },
  { code: '053', name: '台中商業銀行 (053)' },
];

/**
 * 依據隱私規格進行受款戶名遮罩：將本名第二個字以英文字母 "O" 替換（如：林O芬、趙O怡、王O）
 */
function maskAccountName(name: string): string {
  const clean = name.replace(/老師/g, '').trim();
  if (clean.length >= 2) {
    return clean[0] + 'O' + clean.slice(2);
  }
  return clean;
}

/**
 * 依據教師 ID / 姓名動態生成台灣各家銀行獨一無二的專屬收款帳號
 */
function getTeacherTaiwanBankAccount(teacherId: string, teacherName: string) {
  const cleanName = teacherName.replace(/老師/g, '').trim();
  const maskedName = maskAccountName(teacherName);

  // 計算字串 Hash 確保每位老師在不同銀行間唯一且固定
  const hash = (teacherId + cleanName)
    .split('')
    .reduce((acc, char, idx) => acc + char.charCodeAt(0) * (idx + 1), 0);

  const bankIndex = Math.abs(hash) % TAIWAN_BANKS.length;
  const bank = TAIWAN_BANKS[bankIndex];

  // 生成各家銀行規格之 12~14 碼標準虛擬/實體格式帳號 (例如: 013-50-1234567)
  const branchCode = String((Math.abs(hash * 3) % 89) + 10).padStart(2, '0');
  const accountMid = String(Math.abs(hash * 7) % 89999 + 10000).padStart(5, '0');
  const accountLast = String(Math.abs(hash * 13) % 89999 + 10000).padStart(5, '0');
  const accountNumber = `${bank.code}-${branchCode}-${accountMid}${accountLast.slice(0, 2)}`;

  return {
    bankName: bank.name,
    accountNumber: accountNumber,
    accountName: maskedName,
  };
}

export async function GET(request: NextRequest) {
  try {
    const studentId = request.nextUrl.searchParams.get('student_id');
    if (!studentId) {
      return NextResponse.json({ success: false, error: 'student_id required' }, { status: 400 });
    }

    // 1. 查詢該學生在 teacher_students 的契約資訊
    const { data: contract, error: contractErr } = await serverSupabase
      .from('teacher_students')
      .select(`
        id,
        hourly_rate,
        remaining_lessons,
        skill_id,
        teachers (
          id,
          name,
          slug,
          hourly_rate,
          bank_account_enc
        )
      `)
      .eq('student_id', studentId)
      .maybeSingle();

    // 2. 查詢該學生最新的續約繳費單 (fin_billing_invoices)
    const { data: invoices } = await serverSupabase
      .from('fin_billing_invoices')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    const teacher = (contract as any)?.teachers;
    const teacherId = teacher?.id || 'a0000000-0000-0000-0000-000000000001';
    const teacherName = teacher?.name || '林佩芬老師';
    const rate = contract?.hourly_rate || teacher?.hourly_rate || 1400;
    const latestInvoice = invoices?.[0];

    // 動態匹配台灣各家獨立銀行帳戶
    const teacherBank = getTeacherTaiwanBankAccount(teacherId, teacherName);

    const payload = {
      contract_no: contract?.id ? `CT-${contract.id.slice(0, 8).toUpperCase()}` : 'CT-202608-0092',
      teacher_name: teacherName,
      bank_name: teacherBank.bankName,
      account_number: teacherBank.accountNumber,
      account_name: teacherBank.accountName,
      rate_per_lesson: rate,
      remaining_lessons: contract?.remaining_lessons ?? 2,
      total_amount: rate * 10,
      invoice_status: latestInvoice?.status || 'PENDING_PAYMENT',
      bank_last_five: latestInvoice?.bank_last_five || null,
      due_date: latestInvoice?.due_date || '2026-09-07',
    };

    return NextResponse.json({
      success: true,
      source: contract ? 'database' : 'fallback',
      data: payload,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { student_id, bank_last_five } = body;

    if (!student_id || !bank_last_five) {
      return NextResponse.json({ success: false, error: 'student_id and bank_last_five required' }, { status: 400 });
    }

    // 尋找契約
    const { data: contract } = await serverSupabase
      .from('teacher_students')
      .select('id, teacher_id, hourly_rate')
      .eq('student_id', student_id)
      .maybeSingle();

    const invoiceNo = `INV-${Date.now().toString().slice(-8)}`;
    const unitPrice = contract?.hourly_rate || 1400;

    // 寫入 fin_billing_invoices
    const { data, error } = await serverSupabase
      .from('fin_billing_invoices')
      .insert([
        {
          invoice_no: invoiceNo,
          teacher_id: contract?.teacher_id || 'a0000000-0000-0000-0000-000000000001',
          student_id,
          contract_id: contract?.id || null,
          lesson_count: 10,
          unit_price: unitPrice,
          total_amount: unitPrice * 10,
          payment_method: 'BANK_TRANSFER',
          status: 'TRANSFERRED_CONFIRMING',
          bank_last_five: bank_last_five,
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        },
      ])
      .select()
      .single();

    if (error) {
      console.warn('⚠️ [API /api/dev/contracts POST] 寫入錯誤:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, source: 'database', data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
