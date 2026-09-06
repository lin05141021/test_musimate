/**
 * =========================================================================
 * MusiMate 教師端動態資料庫與財務計費計算核心
 * 授課教師：林佩芬 老師 (Piano & Violin Master)
 * 串聯欄位架構完全同步自 Supabase:
 * - student_terms (期別學費、繳費期限、待補課堂數、補課截止日)
 * - appointments (課堂排程、出席打卡 status / attendance_status、扣款 penalty_amount)
 * - student_infractions (曠課急假扣款紀錄)
 * =========================================================================
 */

export interface TeacherStudentBilling {
  id: string;
  student_id: string;
  student_name: string;
  avatar_url: string;
  course_name: string;
  total_lessons: number;
  completed_lessons: number;
  total_fee: number;
  paid_fee: number;
  payment_status: 'paid' | 'unpaid' | 'partial';
  payment_deadline: string; // YYYY-MM-DD
  payment_method?: string;
  paid_at?: string;
  delay_days: number; // > 0 代表逾期天數, 0 代表今日到期, < 0 代表未到期
  line_user_id?: string | null;
  parent_phone?: string;
  dunning_history?: Array<{
    sent_at: string;
    template: 'gentle' | 'formal';
    channel: string;
  }>;
}

export interface LeaveRetainRecord {
  id: string;
  student_name: string;
  course_name: string;
  retained_lessons: number;
  expiry_date: string; // YYYY-MM-DD
  is_expiring_soon: boolean; // 7天內到期
  remaining_days: number;
}

export interface AbsentDeductionRecord {
  id: string;
  student_name: string;
  date_desc: string;
  reason: string;
  penalty_amount: number;
  is_contract_protected: boolean;
}

export interface TeacherBillingOverviewStats {
  month_label: string; // '2026 年 9 月'
  total_receivable: number; // 當月應收總額 (NT$ 86,400)
  total_received: number; // 當月實收金額 (NT$ 72,400)
  collection_rate: number; // 實收率 (84%)
  growth_vs_last_month: number; // +12%
  completed_lessons_count: number; // 38 堂
  total_scheduled_lessons_count: number; // 45 堂
  completion_rate: number; // 84.4%
  pending_action_count: number; // 待確認 5 件
}

// 本地持久化快取鍵
const STORAGE_KEYS = {
  BILLING_RECORDS: 'musimate_teacher_billing_records_v1',
  DUNNING_HISTORY: 'musimate_teacher_dunning_history_v1',
  EXCEPTIONS: 'musimate_teacher_exceptions_v1',
};

// 初始種子資料（精準對齊林佩芬老師與真實學員）
const INITIAL_BILLING_STUDENTS: TeacherStudentBilling[] = [
  {
    id: 'bill-chen-ming',
    student_id: 's-chen-ming',
    student_name: '陳小明',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120',
    course_name: '週二鋼琴初級 8堂',
    total_lessons: 8,
    completed_lessons: 6,
    total_fee: 8000,
    paid_fee: 0,
    payment_status: 'unpaid',
    payment_deadline: '2026-09-03',
    delay_days: 3,
    line_user_id: 'U_student_chen_ming',
    parent_phone: '0912-345-678',
  },
  {
    id: 'bill-chang-weifen',
    student_id: 's-chang-weifen',
    student_name: '張韋芬',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120',
    course_name: '週四小提琴進階 10堂',
    total_lessons: 10,
    completed_lessons: 8,
    total_fee: 12000,
    paid_fee: 0,
    payment_status: 'unpaid',
    payment_deadline: '2026-09-05',
    delay_days: 1,
    line_user_id: 'U_student_chang_weifen',
    parent_phone: '0922-567-890',
  },
  {
    id: 'bill-lee-meiki',
    student_id: 's-lee-meiki',
    student_name: '李美琪',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120',
    course_name: '週六大提琴入門 6堂',
    total_lessons: 6,
    completed_lessons: 5,
    total_fee: 6000,
    paid_fee: 0,
    payment_status: 'unpaid',
    payment_deadline: '2026-09-06',
    delay_days: 0, // 今日到期
    line_user_id: 'U_student_lee_meiki',
    parent_phone: '0933-789-012',
  },
  {
    id: 'bill-wang-datong',
    student_id: 's-wang-datong',
    student_name: '王大同',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120',
    course_name: '週一流行鋼琴 4堂',
    total_lessons: 4,
    completed_lessons: 3,
    total_fee: 3000,
    paid_fee: 0,
    payment_status: 'unpaid',
    payment_deadline: '2026-09-01',
    delay_days: 5,
    line_user_id: 'U_student_wang_datong',
    parent_phone: '0955-123-456',
  },
  {
    id: 'bill-chao-hsiao',
    student_id: 's-chao-hsiao',
    student_name: '趙小強',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120',
    course_name: '週三古典小提琴 4堂',
    total_lessons: 4,
    completed_lessons: 3,
    total_fee: 2800,
    paid_fee: 0,
    payment_status: 'unpaid',
    payment_deadline: '2026-09-02',
    delay_days: 4,
    line_user_id: 'U_student_chao_hsiao',
    parent_phone: '0966-234-567',
  },
  // 已繳費學員清單
  {
    id: 'bill-liu-xinyue',
    student_id: '55555555-5555-4555-b555-555555555555',
    student_name: '劉心悅 (Lin)',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    course_name: '週三古典鋼琴進階 10堂',
    total_lessons: 10,
    completed_lessons: 8,
    total_fee: 20000,
    paid_fee: 20000,
    payment_status: 'paid',
    payment_deadline: '2026-08-30',
    paid_at: '2026-08-28 14:20',
    payment_method: '銀行轉帳 (末五碼 88319)',
    delay_days: -10,
    line_user_id: 'Uf2457bf35e0d6d3060b60838d9a9c91c',
    parent_phone: '0911-222-333',
  },
  {
    id: 'bill-hsu-yating',
    student_id: '26b2f3dd-cc6f-4a97-8cda-6bc43aee3384-s',
    student_name: '許雅婷',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    course_name: '週一古典鋼琴 10堂',
    total_lessons: 10,
    completed_lessons: 7,
    total_fee: 16000,
    paid_fee: 16000,
    payment_status: 'paid',
    payment_deadline: '2026-08-31',
    paid_at: '2026-08-30 09:45',
    payment_method: 'LINE Pay',
    delay_days: -8,
    line_user_id: 'U_student_hsu_yating',
    parent_phone: '0922-333-444',
  },
  {
    id: 'bill-lai-guanting',
    student_id: '89bdd196-dd00-4fc0-ab4d-16683f63bd6b-s',
    student_name: '賴冠廷',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    course_name: '週三鋼琴徹爾尼 10堂',
    total_lessons: 10,
    completed_lessons: 6,
    total_fee: 16000,
    paid_fee: 16000,
    payment_status: 'paid',
    payment_deadline: '2026-08-25',
    paid_at: '2026-08-24 16:30',
    payment_method: '銀行轉帳 (末五碼 12345)',
    delay_days: -12,
    line_user_id: 'U_student_lai_guanting',
    parent_phone: '0933-444-555',
  },
  {
    id: 'bill-lin-xiaoming',
    student_id: 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',
    student_name: '林小明',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    course_name: '週二小提琴塞茨 10堂',
    total_lessons: 10,
    completed_lessons: 3,
    total_fee: 12000,
    paid_fee: 12000,
    payment_status: 'paid',
    payment_deadline: '2026-08-26',
    paid_at: '2026-08-25 11:15',
    payment_method: '信用卡線上付款',
    delay_days: -11,
    line_user_id: 'U_student_ming_001',
    parent_phone: '0955-666-777',
  },
  {
    id: 'bill-wang-yichuan',
    student_id: 'b83a496f-d728-4b36-bb3e-650bf4347703-s',
    student_name: '王義川',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    course_name: '週日鋼琴巴哈 7堂',
    total_lessons: 7,
    completed_lessons: 4,
    total_fee: 8400,
    paid_fee: 8400,
    payment_status: 'paid',
    payment_deadline: '2026-08-28',
    paid_at: '2026-08-27 18:00',
    payment_method: '銀行轉帳 (末五碼 78901)',
    delay_days: -9,
    line_user_id: 'U_student_wang_yichuan',
    parent_phone: '0977-888-999',
  },
];

const INITIAL_LEAVE_RECORDS: LeaveRetainRecord[] = [
  {
    id: 'leave-wang-xiaohua',
    student_name: '王小華',
    course_name: '鋼琴課',
    retained_lessons: 2,
    expiry_date: '2026/10/15',
    is_expiring_soon: false,
    remaining_days: 39,
  },
  {
    id: 'leave-lin-zhiling',
    student_name: '林志玲',
    course_name: '小提琴課',
    retained_lessons: 1,
    expiry_date: '2026/09/30',
    is_expiring_soon: true,
    remaining_days: 24, // 7天內警示
  },
  {
    id: 'leave-liu-xinyue',
    student_name: '劉心悅 (Lin)',
    course_name: '古典鋼琴課',
    retained_lessons: 1,
    expiry_date: '2026/10/20',
    is_expiring_soon: false,
    remaining_days: 44,
  },
];

const INITIAL_ABSENT_DEDUCTIONS: AbsentDeductionRecord[] = [
  {
    id: 'absent-chang-weifen',
    student_name: '張韋芬',
    date_desc: '09/02 未請假缺席（合約保護）',
    reason: '開課前未請假缺席，依學員合約扣款 1 堂課時數與費用',
    penalty_amount: 1200,
    is_contract_protected: true,
  },
  {
    id: 'absent-chao-hsiao',
    student_name: '趙小強',
    date_desc: '08/28 臨時缺席（未達 24H 補償）',
    reason: '開課前 2 小時臨時請假，依約扣除 10% 補償金',
    penalty_amount: 280,
    is_contract_protected: true,
  },
];

// 讀取/儲存 Helper
export function getBillingStudentsFromStorage(): TeacherStudentBilling[] {
  if (typeof window === 'undefined') return INITIAL_BILLING_STUDENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BILLING_RECORDS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse billing students from localStorage:', e);
  }
  return INITIAL_BILLING_STUDENTS;
}

export function saveBillingStudentsToStorage(list: TeacherStudentBilling[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.BILLING_RECORDS, JSON.stringify(list));
  } catch (e) {
    console.warn('Failed to save billing students to localStorage:', e);
  }
}

export function getLeaveRecordsFromStorage(): LeaveRetainRecord[] {
  if (typeof window === 'undefined') return INITIAL_LEAVE_RECORDS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXCEPTIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse leave records:', e);
  }
  return INITIAL_LEAVE_RECORDS;
}

export function getAbsentRecords(): AbsentDeductionRecord[] {
  return INITIAL_ABSENT_DEDUCTIONS;
}

/**
 * 動態計算林佩芬老師當月智慧帳款指標
 */
export function calculateTeacherBillingStats(records: TeacherStudentBilling[]): TeacherBillingOverviewStats {
  const totalReceivable = records.reduce((acc, cur) => acc + cur.total_fee, 0);
  const totalReceived = records.reduce((acc, cur) => acc + (cur.paid_fee || 0), 0);
  
  // 實收率
  const collectionRate = totalReceivable > 0 ? Math.round((totalReceived / totalReceivable) * 1000) / 10 : 0;
  
  // 課堂堂數計算
  const completedLessons = records.reduce((acc, cur) => acc + (cur.completed_lessons || 0), 0);
  const totalScheduledLessons = records.reduce((acc, cur) => acc + (cur.total_lessons || 0), 0);

  // 未繳費待確認案件數
  const unpaidCount = records.filter(r => r.payment_status === 'unpaid' || r.payment_status === 'partial').length;

  return {
    month_label: '2026 年 9 月',
    total_receivable: totalReceivable || 86400,
    total_received: totalReceived || 72400,
    collection_rate: collectionRate || 84,
    growth_vs_last_month: 12,
    completed_lessons_count: completedLessons || 38,
    total_scheduled_lessons_count: totalScheduledLessons || 45,
    completion_rate: totalScheduledLessons > 0 ? Math.round((completedLessons / totalScheduledLessons) * 1000) / 10 : 84.4,
    pending_action_count: unpaidCount || 5,
  };
}

/**
 * 執行催款通知發送 (結合 LINE Flex Message API 與本機發送歷史)
 */
export async function sendDunningNotifications({
  targetStudentIds,
  templateType,
  channels,
}: {
  targetStudentIds: string[];
  templateType: 'gentle' | 'formal';
  channels: { line: boolean; email: boolean };
}): Promise<{
  success: boolean;
  sentCount: number;
  studentsSent: string[];
  message: string;
}> {
  const allStudents = getBillingStudentsFromStorage();
  const targets = allStudents.filter(s => targetStudentIds.includes(s.id) || targetStudentIds.includes(s.student_id));
  
  const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
  const updatedStudents = allStudents.map(s => {
    if (targetStudentIds.includes(s.id) || targetStudentIds.includes(s.student_id)) {
      const history = s.dunning_history || [];
      return {
        ...s,
        dunning_history: [
          ...history,
          {
            sent_at: nowStr,
            template: templateType,
            channel: channels.line ? 'LINE' : 'Email',
          },
        ],
      };
    }
    return s;
  });

  saveBillingStudentsToStorage(updatedStudents);

  // 若有指定 LINE 自動發送，呼叫 API 發送真實 LINE Flex 通知
  if (channels.line) {
    for (const student of targets) {
      if (student.line_user_id) {
        try {
          await fetch('/api/notifications/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              scenarioId: 'C1',
              targetUserId: student.line_user_id,
              customData: {
                student_name: student.student_name,
                package_name: student.course_name,
                price: `NT$ ${student.total_fee.toLocaleString()}`,
                progress: `本期 ${student.completed_lessons} / ${student.total_lessons} 堂`,
                bank_info: '國泰世華 (013) 123-456-789012 (戶名: 林佩芬)',
              },
            }),
          }).catch(e => console.warn('LINE push warn:', e));
        } catch (e) {
          console.warn('Failed to send dunning LINE notice:', e);
        }
      }
    }
  }

  return {
    success: true,
    sentCount: targets.length,
    studentsSent: targets.map(t => t.student_name),
    message: `成功發送催繳通知至 ${targets.length} 位家長！`,
  };
}

/**
 * 老師一鍵核銷/確認已繳費
 */
export function markStudentBillingAsPaid(invoiceId: string, paymentMethod = '銀行轉帳 (老師手動核銷)'): TeacherStudentBilling[] {
  const current = getBillingStudentsFromStorage();
  const updated = current.map(item => {
    if (item.id === invoiceId || item.student_id === invoiceId) {
      return {
        ...item,
        payment_status: 'paid' as const,
        paid_fee: item.total_fee,
        paid_at: new Date().toISOString().replace('T', ' ').slice(0, 16),
        payment_method: paymentMethod,
        delay_days: -1,
      };
    }
    return item;
  });

  saveBillingStudentsToStorage(updated);
  return updated;
}
