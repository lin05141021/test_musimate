/**
 * MusiMate LINE Flex Message Notification Templates
 * 
 * 依照 PRD 與使用者精確校正之 5 大色碼體系重構：
 * 1. 課程相關 ➔ #CEAB98 (粉霧暖紅/棕紅)
 * 2. 聯絡簿相關 ➔ #D5CC6A (草木芥末黃)
 * 3. 打卡相關 ➔ #68C5AB (柔和薄荷綠)
 * 4. 繳費相關 ➔ #82AAD8 (晨曦粉霧藍)
 * 5. 新課程 / 系統 ➔ #B58EBE (典雅薰衣紫)
 * 
 * 依指示精簡 C 類別（保留 C1，移除重複之 C2）：
 * A. 課程排程與出席 (A1~A4)
 * B. AI 週報與練習打卡 (B1~B3)
 * C. 堂數續約與繳費核銷 (C1, C2 憑證送審, C3 續約開通)
 */

export const VERCEL_BASE_URL = 'https://test-musimate.vercel.app';

// 精準 5 大校正色碼
export const THEME_COLORS = {
  COURSE: '#CEAB98',     // 課程 (紅/暖棕)
  SUMMARY: '#D5CC6A',    // 聯絡簿 (黃)
  PRACTICE: '#68C5AB',   // 打卡 (綠)
  BILLING: '#82AAD8',    // 繳費 (藍)
  SYSTEM: '#B58EBE',     // 新課程/系統 (紫)
};

export interface NotificationScenario {
  id: string;
  category: 'A' | 'B' | 'C';
  categoryName: string;
  themeColorName: string;
  themeColor: string;
  title: string;
  triggerTiming: string;
  description: string;
  dbFields: Array<{ field: string; label: string; example: string }>;
  defaultData: Record<string, any>;
  buttons: Array<{ label: string; url: string; color?: string; style?: 'primary' | 'secondary' | 'link' }>;
  generateFlex: (data: Record<string, any>) => any;
}

// 輔助函式：產生單行 Icon + Label + Value 欄位
function createFieldRow(icon: string, label: string, value: string, valueColor = '#333333', isBold = false) {
  return {
    type: 'box',
    layout: 'horizontal',
    spacing: 'sm',
    contents: [
      {
        type: 'text',
        text: `${icon} ${label}`,
        size: 'sm',
        color: '#7A7E90',
        flex: 4,
        gravity: 'center',
      },
      {
        type: 'text',
        text: value,
        size: 'sm',
        color: valueColor,
        weight: isBold ? 'bold' : 'regular',
        flex: 6,
        wrap: true,
        gravity: 'center',
      },
    ],
  };
}

// 輔助函式：產生標準卡片 Header (支援自訂漸層色)
function createHeader(categoryName: string, title: string, iconEmoji = '🎵', baseColor = '#CEAB98') {
  return {
    type: 'box',
    layout: 'vertical',
    contents: [
      {
        type: 'box',
        layout: 'horizontal',
        contents: [
          {
            type: 'text',
            text: categoryName,
            size: 'xxs',
            color: '#FFFFFF',
            weight: 'bold',
          },
        ],
        backgroundColor: 'rgba(255, 255, 255, 0.28)',
        cornerRadius: 'xxl',
        paddingAll: '4px',
        paddingStart: '10px',
        paddingEnd: '10px',
        alignItems: 'center',
        justifyContent: 'center',
        width: 'fit-content',
        marginBottom: '6px',
      },
      {
        type: 'text',
        text: `${iconEmoji} ${title}`,
        weight: 'bold',
        size: 'lg',
        color: '#FFFFFF',
        wrap: true,
      },
    ],
    backgroundColor: baseColor,
    paddingAll: '18px',
  };
}

// 輔助函式：產生按鈕
function createButton(label: string, uri: string, color = '#CEAB98', style = 'primary') {
  return {
    type: 'button',
    style: style,
    color: style === 'primary' ? color : undefined,
    height: 'sm',
    action: {
      type: 'uri',
      label: label,
      uri: uri,
    },
  };
}

// =========================================================================
// 10 種精確情境卡片定義與生成器 (校正色碼版)
// =========================================================================

export const NOTIFICATION_SCENARIOS: Record<string, NotificationScenario> = {
  // =======================================================================
  // 🔴 A. 課程排程與出席管理 (紅色系：#CEAB98)
  // =======================================================================

  // A1. 上課提醒
  A1: {
    id: 'A1',
    category: 'A',
    categoryName: '課程排程',
    themeColorName: '課程紅',
    themeColor: THEME_COLORS.COURSE,
    title: '上課提醒',
    triggerTiming: '開課前 24 小時、開課前 2 小時各發送一次',
    description: '提醒學員即將進行之課程時間、琴房地點與本期累積進度',
    dbFields: [
      { field: 'courses.course_name', label: '課程名稱', example: '古典鋼琴個別課' },
      { field: 'lessons.start_time - lessons.end_time', label: '上課時段', example: '2026/09/16 (二) 19:00 - 20:00' },
      { field: 'teachers.name', label: '授課教師', example: '林佩芬 老師' },
      { field: 'teachers.classroom_location', label: '上課地點/琴房', example: '音符音樂教室 A303 琴房' },
      { field: 'enrollments.completed_lessons / enrollments.total_lessons', label: '本期進度', example: '第 4 堂 / 共 10 堂' },
    ],
    defaultData: {
      course_name: '古典鋼琴個別課',
      lesson_time: '2026/09/16 (二) 19:00 - 20:00',
      teacher_name: '林佩芬 老師',
      classroom_location: '音符音樂教室 A303 琴房',
      progress: '第 4 堂 / 共 10 堂',
      lesson_id: 'lesson-1',
    },
    buttons: [
      {
        label: '📍 課前報到打卡',
        url: `${VERCEL_BASE_URL}/student/schedule?action=checkin&lesson_id=lesson-1`,
        color: THEME_COLORS.COURSE,
        style: 'primary',
      },
      {
        label: '📅 查看個人課表',
        url: `${VERCEL_BASE_URL}/student/schedule`,
        color: '#7A7E90',
        style: 'secondary',
      },
    ],
    generateFlex: (data) => {
      const lessonId = data.lesson_id || 'lesson-1';
      return {
        type: 'bubble',
        size: 'mega',
        header: createHeader('課程排程', '上課提醒', '🎵', THEME_COLORS.COURSE),
        body: {
          type: 'box',
          layout: 'vertical',
          spacing: 'md',
          paddingAll: '20px',
          contents: [
            createFieldRow('📖', '課程名稱', data.course_name || '古典鋼琴個別課', '#2B3049', true),
            createFieldRow('⏰', '上課時段', data.lesson_time || '09/16 (二) 19:00-20:00', '#2B3049', true),
            createFieldRow('👩‍🏫', '授課教師', data.teacher_name || '林佩芬 老師'),
            createFieldRow('📍', '上課地點', data.classroom_location || '音符音樂教室 A303 琴房'),
            createFieldRow('📊', '本期進度', data.progress || '第 4 堂 / 共 10 堂', THEME_COLORS.COURSE, true),
          ],
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          spacing: 'sm',
          contents: [
            createButton('📍 課前報到打卡', `${VERCEL_BASE_URL}/student/schedule?action=checkin&lesson_id=${lessonId}`, THEME_COLORS.COURSE, 'primary'),
            createButton('📅 查看個人課表', `${VERCEL_BASE_URL}/student/schedule`, '#7A7E90', 'secondary'),
          ],
          paddingAll: '16px',
          paddingTop: '0px',
        },
      };
    },
  },

  // A2. 請假 / 調課審核結果通知
  A2: {
    id: 'A2',
    category: 'A',
    categoryName: '請假/調課審核',
    themeColorName: '課程紅',
    themeColor: THEME_COLORS.COURSE,
    title: '調課申請結果',
    triggerTiming: '教師於 Web 後台審核通過或拒絕學生之調課/請假申請時即時發送',
    description: '通知調課審核結果（已核准 / 未核准 / 需重新選擇時段）及教師留言',
    dbFields: [
      { field: 'reschedule_requests.status', label: '審核狀態', example: '已核准' },
      { field: 'reschedule_requests.original_time', label: '原上課時間', example: '2026/09/16 (二) 19:00 - 20:00' },
      { field: 'reschedule_requests.new_time', label: '新上課時間', example: '2026/09/17 (三) 10:00 - 11:00' },
      { field: 'reschedule_requests.teacher_note', label: '教師留言', example: '好的，已為您調整至週三上午！' },
    ],
    defaultData: {
      status: '已核准 (時段已更新)',
      isApproved: true,
      original_time: '2026/09/16 (二) 19:00 - 20:00',
      new_time: '2026/09/17 (三) 10:00 - 11:00',
      teacher_note: '好的，已為您安排週三上午上課，請準時出席！',
    },
    buttons: [
      {
        label: '📅 查看最新課表',
        url: `${VERCEL_BASE_URL}/student/schedule`,
        color: THEME_COLORS.COURSE,
        style: 'primary',
      },
    ],
    generateFlex: (data) => {
      const isApproved = data.isApproved !== false;
      return {
        type: 'bubble',
        size: 'mega',
        header: createHeader('調課審核', '調課申請結果', isApproved ? '📋' : '⚠️', THEME_COLORS.COURSE),
        body: {
          type: 'box',
          layout: 'vertical',
          spacing: 'md',
          paddingAll: '20px',
          contents: [
            createFieldRow(
              isApproved ? '✅' : '❌',
              '審核狀態',
              data.status || (isApproved ? '已核准' : '未核准'),
              isApproved ? '#2E7D32' : THEME_COLORS.COURSE,
              true
            ),
            createFieldRow('📅', '原上課時間', data.original_time || '09/16 (二) 19:00-20:00'),
            createFieldRow('✨', '新上課時間', data.new_time || '09/17 (三) 10:00-11:00', THEME_COLORS.COURSE, true),
            {
              type: 'box',
              layout: 'vertical',
              backgroundColor: isApproved ? '#EFF9F6' : '#FAF4F0',
              cornerRadius: 'md',
              paddingAll: '12px',
              contents: [
                {
                  type: 'text',
                  text: `💬 教師留言：${data.teacher_note || '好的，收到！'}`,
                  size: 'xs',
                  color: isApproved ? '#2E7D32' : '#8A5B47',
                  wrap: true,
                },
              ],
            },
          ],
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [
            createButton('📅 查看最新課表', `${VERCEL_BASE_URL}/student/schedule`, THEME_COLORS.COURSE, 'primary'),
          ],
          paddingAll: '16px',
          paddingTop: '0px',
        },
      };
    },
  },

  // A3. 缺席扣款預警通知（開啟申訴）
  A3: {
    id: 'A3',
    category: 'A',
    categoryName: '出席扣款預警',
    themeColorName: '課程紅',
    themeColor: THEME_COLORS.COURSE,
    title: '課堂缺席扣款預警',
    triggerTiming: '開課逾 15 分鐘學生未到且未打卡，教師於後台點擊「回報學生缺席」時發送',
    description: '通知缺席扣款預警，並開啟 24 小時申訴倒數',
    dbFields: [
      { field: 'lessons.start_time', label: '缺席課堂', example: '2026/09/16 (二) 19:00' },
      { field: 'students.violation_count_365d', label: '年度累計違約', example: '第 1 次 (365天內)' },
      { field: 'penalty_rules.penalty_rate', label: '預計扣款比例', example: '10%' },
      { field: 'disputes.appeal_deadline', label: '申訴截止倒數', example: '2026/09/17 19:15 前 (24h內)' },
    ],
    defaultData: {
      lesson_time: '2026/09/16 (二) 19:00',
      violation_count: '第 1 次 (365天內)',
      penalty_rate: '10%',
      appeal_deadline: '2026/09/17 19:15 前 (鎖定 24H 倒數)',
      lesson_id: 'lesson-1',
    },
    buttons: [
      {
        label: '⚖️ 提出申訴 (24h 倒數)',
        url: `${VERCEL_BASE_URL}/student/schedule?action=dispute&lesson_id=lesson-1`,
        color: THEME_COLORS.COURSE,
        style: 'primary',
      },
      {
        label: '💬 聯繫教師',
        url: `${VERCEL_BASE_URL}/student/faq`,
        color: '#7A7E90',
        style: 'secondary',
      },
    ],
    generateFlex: (data) => {
      const lessonId = data.lesson_id || 'lesson-1';
      return {
        type: 'bubble',
        size: 'mega',
        header: createHeader('出席扣款預警', '課堂缺席扣款預警', '⚠️', THEME_COLORS.COURSE),
        body: {
          type: 'box',
          layout: 'vertical',
          spacing: 'md',
          paddingAll: '20px',
          contents: [
            createFieldRow('⏰', '缺席課堂', data.lesson_time || '09/16 (二) 19:00', '#2B3049', true),
            createFieldRow('⚠️', '年度違約', data.violation_count || '第 1 次 (365天內)'),
            createFieldRow('💸', '預計扣款', data.penalty_rate || '10%', THEME_COLORS.COURSE, true),
            createFieldRow('⏳', '申訴截止', data.appeal_deadline || '24 小時內', THEME_COLORS.COURSE, true),
            {
              type: 'box',
              layout: 'vertical',
              backgroundColor: '#FAF4F0',
              cornerRadius: 'md',
              paddingAll: '10px',
              contents: [
                {
                  type: 'text',
                  text: '❗ 如有突發不可抗力之緊急情況，請於 24 小時內點擊下方「提出申訴」上傳證明。',
                  size: 'xxs',
                  color: '#8A5B47',
                  wrap: true,
                },
              ],
            },
          ],
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          spacing: 'sm',
          contents: [
            createButton('⚖️ 提出申訴 (24h 倒數)', `${VERCEL_BASE_URL}/student/schedule?action=dispute&lesson_id=${lessonId}`, THEME_COLORS.COURSE, 'primary'),
            createButton('💬 聯繫教師', `${VERCEL_BASE_URL}/student/faq`, '#7A7E90', 'secondary'),
          ],
          paddingAll: '16px',
          paddingTop: '0px',
        },
      };
    },
  },

  // A4. 缺席扣款結案與補課券發放通知
  A4: {
    id: 'A4',
    category: 'A',
    categoryName: '出席結案',
    themeColorName: '課程紅',
    themeColor: THEME_COLORS.COURSE,
    title: '課堂缺席結案通知',
    triggerTiming: '24 小時申訴期滿未提出申訴，或申訴遭駁回正式結案時發送',
    description: '通知扣除違約補償金結案，並發放剩餘額度補課券代碼',
    dbFields: [
      { field: 'vouchers.deducted_amount', label: '扣除違約補償金', example: 'NT$ 80 (10%)' },
      { field: 'vouchers.code', label: '補課券代碼', example: 'VCH-202609-8831' },
      { field: 'vouchers.expiry_date', label: '補課券有效期限', example: '2026/10/17 (發放日 + 30 天)' },
    ],
    defaultData: {
      deducted_amount: 'NT$ 80 (依 10% 比例扣除補償金)',
      voucher_code: 'VCH-202609-8831',
      expiry_date: '2026/10/17 (發放日 + 30 天整)',
      voucher_id: 'vch-1',
    },
    buttons: [
      {
        label: '🎫 使用補課券預約',
        url: `${VERCEL_BASE_URL}/student/schedule?voucher_id=vch-1`,
        color: THEME_COLORS.COURSE,
        style: 'primary',
      },
    ],
    generateFlex: (data) => {
      const voucherId = data.voucher_id || 'vch-1';
      return {
        type: 'bubble',
        size: 'mega',
        header: createHeader('出席結案', '課堂缺席結案通知', '📋', THEME_COLORS.COURSE),
        body: {
          type: 'box',
          layout: 'vertical',
          spacing: 'md',
          paddingAll: '20px',
          contents: [
            createFieldRow('💸', '扣除補償金', data.deducted_amount || 'NT$ 80 (10%)', THEME_COLORS.COURSE, true),
            createFieldRow('🎫', '補課券代碼', data.voucher_code || 'VCH-202609-8831', '#2B3049', true),
            createFieldRow('📅', '有效期限', data.expiry_date || '發放日 + 30 天'),
            {
              type: 'box',
              layout: 'vertical',
              backgroundColor: '#FAF4F0',
              cornerRadius: 'md',
              paddingAll: '10px',
              contents: [
                {
                  type: 'text',
                  text: '✨ 系統已將剩餘課程額度轉換為補課券，請於效期內登入預約補課時段。',
                  size: 'xxs',
                  color: '#8A5B47',
                  wrap: true,
                },
              ],
            },
          ],
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [
            createButton('🎫 使用補課券預約', `${VERCEL_BASE_URL}/student/schedule?voucher_id=${voucherId}`, THEME_COLORS.COURSE, 'primary'),
          ],
          paddingAll: '16px',
          paddingTop: '0px',
        },
      };
    },
  },

  // =======================================================================
  // 🟡 B1. 聯絡簿相關 (黃色系：#D5CC6A)
  // =======================================================================

  // B1. AI 學習週報已送達
  B1: {
    id: 'B1',
    category: 'B',
    categoryName: '聯絡簿週報',
    themeColorName: '聯絡簿黃',
    themeColor: THEME_COLORS.SUMMARY,
    title: '課堂學習週報',
    triggerTiming: '教師於 Web 後台完成 30 秒語音草稿審核/微調並點擊發送時',
    description: '推播課堂教學摘要、弱點技巧指引與本週練琴作業/目標 BPM',
    dbFields: [
      { field: 'lessons.lesson_date', label: '課堂日期', example: '2026/09/16 (二)' },
      { field: 'lesson_reports.summary', label: '本次教學摘要', example: '巴哈E大調協奏曲 弱起拍音準與換把位' },
      { field: 'lesson_reports.skill_tips', label: '弱點技巧指引', example: '第 32 小節琶音右手指法放鬆，注意第四指落點' },
      { field: 'lesson_reports.homework_piece', label: '本週練琴作業', example: '巴哈E大調協奏曲 第一樂章' },
      { field: 'lesson_reports.target_bpm', label: '目標速度', example: '88 BPM' },
      { field: 'lesson_reports.target_frequency', label: '目標頻率', example: '每週至少 4 天，每次 20 分鐘' },
    ],
    defaultData: {
      lesson_date: '2026/09/16 (二)',
      summary: '巴哈E大調小提琴協奏曲 第一樂章 弱起拍音準與換把位穩定度',
      skill_tips: '第 32 小節琶音右手指法放鬆，注意第四指落點準確度',
      homework_piece: '巴哈E大調協奏曲 第一樂章',
      target_bpm: '88 BPM',
      target_frequency: '每週 4 天 · 每次 20 分鐘',
      report_id: 'lesson-1',
    },
    buttons: [
      {
        label: '🔍 查看完整週報',
        url: `${VERCEL_BASE_URL}/student/summary/lesson-1`,
        color: THEME_COLORS.SUMMARY,
        style: 'primary',
      },
    ],
    generateFlex: (data) => {
      const reportId = data.report_id || 'lesson-1';
      return {
        type: 'bubble',
        size: 'mega',
        header: createHeader('聯絡簿週報', '課堂學習週報', '📖', THEME_COLORS.SUMMARY),
        body: {
          type: 'box',
          layout: 'vertical',
          spacing: 'md',
          paddingAll: '20px',
          contents: [
            createFieldRow('📅', '課堂日期', data.lesson_date || '09/16 (二)'),
            createFieldRow('📖', '作業曲目', data.homework_piece || '巴哈E大調協奏曲', '#2B3049', true),
            createFieldRow('🎯', '目標速度', data.target_bpm || '88 BPM', THEME_COLORS.SUMMARY, true),
            createFieldRow('⏰', '建議頻率', data.target_frequency || '每週 4 天'),
            {
              type: 'separator',
              margin: 'md',
              color: '#F0EBE1',
            },
            {
              type: 'box',
              layout: 'vertical',
              backgroundColor: '#FAF9EA',
              cornerRadius: 'md',
              paddingAll: '10px',
              contents: [
                {
                  type: 'text',
                  text: `💡 技巧指引：${data.skill_tips || '注意指法放鬆與換把位穩定度'}`,
                  size: 'xs',
                  color: '#7D762B',
                  wrap: true,
                },
              ],
            },
          ],
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [
            createButton('🔍 查看完整週報', `${VERCEL_BASE_URL}/student/summary/${reportId}`, THEME_COLORS.SUMMARY, 'primary'),
          ],
          paddingAll: '16px',
          paddingTop: '0px',
        },
      };
    },
  },

  // =======================================================================
  // 🟢 B2 ~ B3. 打卡相關 (綠色系：#68C5AB)
  // =======================================================================

  // B2. 每日練琴打卡提醒
  B2: {
    id: 'B2',
    category: 'B',
    categoryName: '練習打卡',
    themeColorName: '打卡綠',
    themeColor: THEME_COLORS.PRACTICE,
    title: '今天練琴了嗎？',
    triggerTiming: '每日設定時間（如 18:30）排程檢查，當天未上傳練琴音訊者觸發',
    description: '提醒學員今日目標曲目、BPM 與連續打卡天數',
    dbFields: [
      { field: 'practice_records.streak_days', label: '連續打卡天數', example: '已連續 6 天！🔥' },
      { field: 'lesson_reports.homework_piece', label: '當前目標作業', example: '巴哈E大調協奏曲 第一樂章' },
      { field: 'lesson_reports.target_bpm', label: '目標節奏', example: '88 BPM' },
    ],
    defaultData: {
      streak_days: '已連續打卡 6 天！🔥',
      homework_piece: '巴哈E大調協奏曲 第一樂章',
      target_bpm: '88 BPM',
    },
    buttons: [
      {
        label: '🎙️ 立即 15 秒打卡',
        url: `${VERCEL_BASE_URL}/student/practice`,
        color: THEME_COLORS.PRACTICE,
        style: 'primary',
      },
    ],
    generateFlex: (data) => ({
      type: 'bubble',
      size: 'mega',
      header: createHeader('練習打卡', '今天練琴了嗎？', '🎹', THEME_COLORS.PRACTICE),
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: '20px',
        contents: [
          createFieldRow('🔥', '連續打卡', data.streak_days || '已連續 6 天！', THEME_COLORS.PRACTICE, true),
          createFieldRow('📖', '目標曲目', data.homework_piece || '巴哈E大調協奏曲', '#2B3049', true),
          createFieldRow('🎯', '目標節奏', data.target_bpm || '88 BPM', THEME_COLORS.PRACTICE, true),
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#EFF9F6',
            cornerRadius: 'md',
            paddingAll: '10px',
            contents: [
              {
                type: 'text',
                text: '💬 再堅持一天就達成連續 7 天週成就囉！立即錄製 15 秒打卡吧！',
                size: 'xs',
                color: '#2E7D32',
                wrap: true,
              },
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          createButton('🎙️ 立即 15 秒打卡', `${VERCEL_BASE_URL}/student/practice`, THEME_COLORS.PRACTICE, 'primary'),
        ],
        paddingAll: '16px',
        paddingTop: '0px',
      },
    }),
  },

  // B3. 練琴打卡回饋通知
  B3: {
    id: 'B3',
    category: 'B',
    categoryName: '打卡回饋',
    themeColorName: '打卡綠',
    themeColor: THEME_COLORS.PRACTICE,
    title: '練琴回饋已送達',
    triggerTiming: '依小組確認後的機制推播（AI 判定產生或教師審核放行時）',
    description: '即時推播節奏穩定度、實測 BPM 與教師短評回饋',
    dbFields: [
      { field: 'practice_records.piece_name', label: '練習曲目', example: '巴哈E大調協奏曲 第一樂章' },
      { field: 'practice_records.stability_score', label: '節奏穩定度', example: '91% (精準穩定)' },
      { field: 'practice_records.detected_bpm', label: '實際演奏 BPM', example: '86 BPM (目標 88 BPM)' },
      { field: 'practice_feedbacks.feedback_text', label: '教師評語', example: '音準穩定度大幅提升！換把位更加俐落了！' },
    ],
    defaultData: {
      piece_name: '巴哈E大調協奏曲 第一樂章',
      stability_score: '91% (精準穩定 ⭐)',
      detected_bpm: '86 BPM (目標 88 BPM)',
      feedback_text: '音準穩定度大幅提升！換把位更加俐落了，繼續保持！',
      record_id: 'p-rec-1',
    },
    buttons: [
      {
        label: '📊 查看練習紀錄趨勢',
        url: `${VERCEL_BASE_URL}/student/compare/p-rec-1`,
        color: THEME_COLORS.PRACTICE,
        style: 'primary',
      },
    ],
    generateFlex: (data) => {
      const recordId = data.record_id || 'p-rec-1';
      return {
        type: 'bubble',
        size: 'mega',
        header: createHeader('打卡回饋', '練琴回饋已送達', '⭐', THEME_COLORS.PRACTICE),
        body: {
          type: 'box',
          layout: 'vertical',
          spacing: 'md',
          paddingAll: '20px',
          contents: [
            createFieldRow('📖', '練習曲目', data.piece_name || '巴哈E大調協奏曲'),
            createFieldRow('🎯', '節奏穩定', data.stability_score || '91%', THEME_COLORS.PRACTICE, true),
            createFieldRow('⚡', '實測速度', data.detected_bpm || '86 BPM', '#2B3049', true),
            {
              type: 'box',
              layout: 'vertical',
              backgroundColor: '#EFF9F6',
              cornerRadius: 'md',
              paddingAll: '12px',
              contents: [
                {
                  type: 'text',
                  text: `💬 教師評語：${data.feedback_text || '表現優異！'}`,
                  size: 'xs',
                  color: '#2E7D32',
                  wrap: true,
                },
              ],
            },
          ],
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [
            createButton('📊 查看練習紀錄趨勢', `${VERCEL_BASE_URL}/student/compare/${recordId}`, THEME_COLORS.PRACTICE, 'primary'),
          ],
          paddingAll: '16px',
          paddingTop: '0px',
        },
      };
    },
  },

  // =======================================================================
  // 🔵 C. 堂數續約與繳費核銷 (藍色系：#82AAD8，依指示保留 C1，移除 C2)
  // =======================================================================

  // C1. 下一期課程續約預約通知（最後 2 堂提醒）
  C1: {
    id: 'C1',
    category: 'C',
    categoryName: '繳費續約',
    themeColorName: '繳費藍',
    themeColor: THEME_COLORS.BILLING,
    title: '下一期課程續約預約通知',
    triggerTiming: '學生完成第 8 堂課、系統計算剩餘堂數 enrollments.remaining_lessons == 2 時自動推播',
    description: '提醒合約即將屆滿，引導預約新一期課程並保留原上課時段',
    dbFields: [
      { field: 'enrollments.completed_lessons / enrollments.total_lessons', label: '當前進度', example: '第 8 / 10 堂（剩餘 2 堂）' },
      { field: 'packages.package_name', label: '續期合約方案', example: '古典鋼琴個別課 (一期 10 堂)' },
      { field: 'packages.price', label: '續約學費', example: 'NT$ 8,000' },
      { field: 'teachers.bank_code / bank_account', label: '匯款帳號資訊', example: '國泰世華 (013) 123-456-789012' },
    ],
    defaultData: {
      progress: '第 8 / 10 堂（剩餘 2 堂）',
      package_name: '古典鋼琴個別課 (一期 10 堂)',
      price: 'NT$ 8,000',
      bank_info: '國泰世華 (013) 123-456-789012 (戶名: 林佩芬)',
      enrollment_id: 'enr-1',
    },
    buttons: [
      {
        label: '📅 預約新一期課程',
        url: `${VERCEL_BASE_URL}/student/schedule?action=renew`,
        color: THEME_COLORS.BILLING,
        style: 'primary',
      },
    ],
    generateFlex: (data) => {
      return {
        type: 'bubble',
        size: 'mega',
        header: createHeader('繳費續約', '下一期課程續約預約通知', '💰', THEME_COLORS.BILLING),
        body: {
          type: 'box',
          layout: 'vertical',
          spacing: 'md',
          paddingAll: '20px',
          contents: [
            createFieldRow('📊', '當前進度', data.progress || '第 8 / 10 堂（剩餘 2 堂）', THEME_COLORS.BILLING, true),
            createFieldRow('📖', '續約方案', data.package_name || '鋼琴課一期 10 堂'),
            createFieldRow('💵', '續約學費', data.price || 'NT$ 8,000', '#2B3049', true),
            createFieldRow('🏦', '匯款帳號', data.bank_info || '國泰世華 (013) 123-456-789012'),
          ],
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [
            createButton('📅 預約新一期課程', `${VERCEL_BASE_URL}/student/schedule?action=renew`, THEME_COLORS.BILLING, 'primary'),
          ],
          paddingAll: '16px',
          paddingTop: '0px',
        },
      };
    },
  },

  // C2 (原 C3). 繳費截圖已送審（OCR 處理完畢）
  C2: {
    id: 'C2',
    category: 'C',
    categoryName: '繳費核銷',
    themeColorName: '繳費藍',
    themeColor: THEME_COLORS.BILLING,
    title: '繳費憑證已送出',
    triggerTiming: '家長上傳轉帳截圖、OCR 解析完畢後即時推播',
    description: '純狀態通知：通知 OCR 辨識結果（金額、帳號末五碼、交易時間），等待老師一鍵確認',
    dbFields: [
      { field: 'payments.amount', label: '辨識匯款金額', example: 'NT$ 8,000' },
      { field: 'payments.bank_last_five', label: '辨識帳號末五碼', example: '56789' },
      { field: 'payments.transaction_time', label: '交易時間', example: '2026/09/20 14:32' },
      { field: 'notice', label: '說明', example: '系統已辨識完成，正等待老師一鍵確認入帳。' },
    ],
    defaultData: {
      amount: 'NT$ 8,000',
      bank_last_five: '56789',
      transaction_time: '2026/09/20 14:32',
      notice: '系統已成功辨識繳費證明，正等待老師一鍵確認入帳中。',
    },
    buttons: [], // 純狀態通知，不設按鈕避免重複送出
    generateFlex: (data) => ({
      type: 'bubble',
      size: 'mega',
      header: createHeader('繳費核銷', '繳費憑證已送出', '⏳', THEME_COLORS.BILLING),
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: '20px',
        contents: [
          createFieldRow('💵', '辨識金額', data.amount || 'NT$ 8,000', '#2B3049', true),
          createFieldRow('🔢', '帳號末五碼', data.bank_last_five || '56789', THEME_COLORS.BILLING, true),
          createFieldRow('🕒', '交易時間', data.transaction_time || '2026/09/20 14:32'),
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#F2F6FB',
            cornerRadius: 'md',
            paddingAll: '12px',
            contents: [
              {
                type: 'text',
                text: `ℹ️ ${data.notice || '系統已辨識完成，正等待老師一鍵確認入帳。'}`,
                size: 'xs',
                color: '#3B6899',
                wrap: true,
              },
            ],
          },
        ],
      },
    }),
  },

  // C3 (原 C4). 續約完成與新期堂數開通
  C3: {
    id: 'C3',
    category: 'C',
    categoryName: '繳費開通',
    themeColorName: '繳費藍',
    themeColor: THEME_COLORS.BILLING,
    title: '續約成功，新期已開通',
    triggerTiming: '教師於 Web 後台點擊「確認入帳」、信託池建立完成時發送',
    description: '通知新增堂數 (+10 堂) 已入帳，款項進入課程信託池託管',
    dbFields: [
      { field: 'payments.purchased_lessons', label: '新增堂數', example: '+10 堂' },
      { field: 'enrollments.remaining_lessons', label: '新合約總堂數', example: '12 堂 (含前期剩餘 2 堂)' },
      { field: 'payments.confirmed_at', label: '入帳確認時間', example: '2026/09/20 15:10' },
      { field: 'trust_notice', label: '說明', example: '款項已進入課程信託池託管，保障完課權益。' },
    ],
    defaultData: {
      purchased_lessons: '+10 堂課',
      total_remaining_lessons: '12 堂 (含本期剩餘 2 堂)',
      confirmed_at: '2026/09/20 15:10',
      trust_notice: '款項已進入課程信託池託管，保障完課權益。',
    },
    buttons: [
      {
        label: '📅 查看排課課表',
        url: `${VERCEL_BASE_URL}/student/schedule`,
        color: THEME_COLORS.BILLING,
        style: 'primary',
      },
    ],
    generateFlex: (data) => ({
      type: 'bubble',
      size: 'mega',
      header: createHeader('繳費開通', '續約成功，新期已開通', '✅', THEME_COLORS.BILLING),
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: '20px',
        contents: [
          createFieldRow('✨', '新增堂數', data.purchased_lessons || '+10 堂', THEME_COLORS.BILLING, true),
          createFieldRow('📊', '總剩餘堂數', data.total_remaining_lessons || '12 堂', '#2B3049', true),
          createFieldRow('🕒', '確認時間', data.confirmed_at || '2026/09/20 15:10'),
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#F2F6FB',
            cornerRadius: 'md',
            paddingAll: '12px',
            contents: [
              {
                type: 'text',
                text: `🛡️ ${data.trust_notice || '款項已進入課程信託池託管，保障完課權益。'}`,
                size: 'xs',
                color: '#3B6899',
                wrap: true,
              },
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          createButton('📅 查看排課課表', `${VERCEL_BASE_URL}/student/schedule`, THEME_COLORS.BILLING, 'primary'),
        ],
        paddingAll: '16px',
        paddingTop: '0px',
      },
    }),
  },
};
