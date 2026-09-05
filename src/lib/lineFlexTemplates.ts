/**
 * MusiMate LINE Flex Message Notification Templates
 * 
 * 依照 PRD 與 UI 規範打造之 14 種 LINE Flex Message 卡片生成器
 * 品牌漸層 Header (#C8A2D0 -> #A8D8EA)、結構化 Body 欄位、品牌色彩按鈕 Footer
 */

export const VERCEL_BASE_URL = 'https://test-musimate.vercel.app';

export interface NotificationScenario {
  id: string;
  category: 'A' | 'B' | 'C' | 'D';
  categoryName: string;
  title: string;
  triggerTiming: string;
  description: string;
  defaultData: Record<string, any>;
  generateFlex: (data: Record<string, any>) => any;
  targetUrl?: string;
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

// 輔助函式：產生標準卡片 Header
function createHeader(categoryName: string, title: string, iconEmoji = '🎵') {
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
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
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
    background: {
      type: 'linearGradient',
      angle: '45deg',
      startColor: '#C8A2D0',
      endColor: '#A8D8EA',
    },
    paddingAll: '18px',
  };
}

// 輔助函式：產生按鈕
function createButton(label: string, uri: string, color = '#9B7EC8', style = 'primary') {
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
// 14 種情境卡片定義與生成器
// =========================================================================

export const NOTIFICATION_SCENARIOS: Record<string, NotificationScenario> = {
  // -------------------------------------------------------------
  // A. 課程相關通知
  // -------------------------------------------------------------
  A1: {
    id: 'A1',
    category: 'A',
    categoryName: '課程提醒',
    title: '上課提醒',
    triggerTiming: '課前 24 小時 + 1 小時 各發一次',
    description: '提醒學員即將進行之課程時間與琴房地點',
    defaultData: {
      datetime: '09/16 (二) 19:00-21:00',
      teacher: '林佩芬 老師',
      course: '鋼琴個別課 (第 4 堂)',
      location: '音符音樂教室 A303 琴房',
    },
    targetUrl: `${VERCEL_BASE_URL}/student/schedule`,
    generateFlex: (data) => ({
      type: 'bubble',
      size: 'mega',
      header: createHeader('課程提醒', '上課提醒', '🎵'),
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: '20px',
        contents: [
          createFieldRow('📅', '日期時間', data.datetime || '09/16 (二) 19:00-21:00', '#2B3049', true),
          createFieldRow('👩‍🏫', '授課老師', data.teacher || '林佩芬 老師'),
          createFieldRow('📖', '上課課程', data.course || '鋼琴個別課'),
          createFieldRow('📍', '教室地點', data.location || '音符音樂教室 A303 琴房'),
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          createButton('✅ 查看課表', `${VERCEL_BASE_URL}/student/schedule`, '#9B7EC8'),
        ],
        paddingAll: '16px',
        paddingTop: '0px',
      },
    }),
  },

  A2: {
    id: 'A2',
    category: 'A',
    categoryName: '課程異動',
    title: '課程異動通知',
    triggerTiming: '老師請假或停課時 即時發送',
    description: '通知學員課程異動並引導線上調課/補課',
    defaultData: {
      changeType: '停課 / 需調課',
      originalTime: '09/16 (二) 19:00-21:00',
      teacher: '林佩芬 老師',
      reason: '老師臨時有事，請登入系統重新選擇合適的調課/補課時段。',
    },
    targetUrl: `${VERCEL_BASE_URL}/student/schedule?action=reschedule`,
    generateFlex: (data) => ({
      type: 'bubble',
      size: 'mega',
      header: createHeader('課程異動', '課程異動通知', '🔔'),
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: '20px',
        contents: [
          createFieldRow('⚠️', '異動類型', data.changeType || '停課 / 需調課', '#E8734A', true),
          createFieldRow('📅', '原定時間', data.originalTime || '09/16 (二) 19:00-21:00'),
          createFieldRow('👩‍🏫', '授課老師', data.teacher || '林佩芬 老師'),
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#FDF1EC',
            cornerRadius: 'md',
            paddingAll: '12px',
            contents: [
              {
                type: 'text',
                text: `💬 異動說明：${data.reason || '老師臨時有事，請調整上課時間'}`,
                size: 'xs',
                color: '#B85536',
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
          createButton('✅ 我要調課', `${VERCEL_BASE_URL}/student/schedule?action=reschedule`, '#E8734A'),
        ],
        paddingAll: '16px',
        paddingTop: '0px',
      },
    }),
  },

  A3: {
    id: 'A3',
    category: 'A',
    categoryName: '智慧聯絡簿',
    title: '課堂筆記已更新',
    triggerTiming: '老師完成課堂筆記後 即時發送',
    description: '通知學員課堂摘要已上傳，包含 AI 綜合評分與重點練習叮嚀',
    defaultData: {
      lessonDate: '09/16 (二)',
      courseName: '鋼琴課 — 巴哈E大調小提琴協奏曲',
      teacher: '林佩芬 老師',
      score: '92 分 (表現優異 ⭐)',
      feedback: '觸鍵音色更加純淨，右手指法請注意第 32 小節琶音',
    },
    targetUrl: `${VERCEL_BASE_URL}/student/summary/lesson-1`,
    generateFlex: (data) => ({
      type: 'bubble',
      size: 'mega',
      header: createHeader('智慧聯絡簿', '課堂筆記已更新', '📓'),
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: '20px',
        contents: [
          createFieldRow('📅', '課堂日期', data.lessonDate || '09/16 (二)'),
          createFieldRow('📖', '課程曲目', data.courseName || '鋼琴課 — 巴哈E大調小提琴協奏曲'),
          createFieldRow('👩‍🏫', '授課老師', data.teacher || '林佩芬 老師'),
          createFieldRow('⭐', 'AI 評分', data.score || '92 分', '#49BB87', true),
          {
            type: 'separator',
            margin: 'md',
            color: '#F0EBE1',
          },
          {
            type: 'text',
            text: `📝 老師叮嚀：${data.feedback || '表現優異，請保持每日練習！'}`,
            size: 'xs',
            color: '#666666',
            wrap: true,
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          createButton('✅ 查看聯絡簿', `${VERCEL_BASE_URL}/student/summary/lesson-1`, '#9B7EC8'),
        ],
        paddingAll: '16px',
        paddingTop: '0px',
      },
    }),
  },

  A4: {
    id: 'A4',
    category: 'A',
    categoryName: '課程確認',
    title: '課程已排定',
    triggerTiming: '排課系統確認後 即時發送',
    description: '新期數課程排定完成確認',
    defaultData: {
      course: '古典鋼琴進階班 — 10 堂課',
      period: '2026/09/01 - 2026/11/30',
      teacher: '林佩芬 老師',
      timeSlot: '每週二 19:00-21:00',
    },
    targetUrl: `${VERCEL_BASE_URL}/student/schedule`,
    generateFlex: (data) => ({
      type: 'bubble',
      size: 'mega',
      header: createHeader('課程確認', '新課程已排定', '✅'),
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: '20px',
        contents: [
          createFieldRow('📖', '課程名稱', data.course || '鋼琴課 — 10 堂', '#2B3049', true),
          createFieldRow('📅', '修業期間', data.period || '2026/09/01 - 2026/11/30'),
          createFieldRow('👩‍🏫', '指導老師', data.teacher || '林佩芬 老師'),
          createFieldRow('⏰', '固定時段', data.timeSlot || '每週二 19:00-21:00', '#9B7EC8', true),
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          createButton('✅ 查看完整課表', `${VERCEL_BASE_URL}/student/schedule`, '#49BB87'),
        ],
        paddingAll: '16px',
        paddingTop: '0px',
      },
    }),
  },

  A5: {
    id: 'A5',
    category: 'A',
    categoryName: '請假審核',
    title: '請假申請結果',
    triggerTiming: '老師/系統審核完成後 即時發送',
    description: '通知請假申請審核通過或未通過之結果',
    defaultData: {
      originalLesson: '09/16 (二) 19:00-21:00',
      status: '已核准 (符合 24H 提前申請，退回 100% 額度)',
      isApproved: true,
      teacherReply: '好的，心悅注意安全！請至課表預約補課時段。',
    },
    targetUrl: `${VERCEL_BASE_URL}/student/schedule`,
    generateFlex: (data) => {
      const isApproved = data.isApproved !== false;
      return {
        type: 'bubble',
        size: 'mega',
        header: createHeader('請假審核', '請假申請結果', isApproved ? '📋' : '⚠️'),
        body: {
          type: 'box',
          layout: 'vertical',
          spacing: 'md',
          paddingAll: '20px',
          contents: [
            createFieldRow('📅', '請假課程', data.originalLesson || '09/16 (二) 19:00-21:00'),
            createFieldRow(
              isApproved ? '✅' : '❌',
              '審核結果',
              data.status || (isApproved ? '已核准' : '未核准'),
              isApproved ? '#49BB87' : '#E8734A',
              true
            ),
            {
              type: 'box',
              layout: 'vertical',
              backgroundColor: isApproved ? '#ECFAF3' : '#FDF1EC',
              cornerRadius: 'md',
              paddingAll: '12px',
              contents: [
                {
                  type: 'text',
                  text: `💬 老師回覆：${data.teacherReply || '好的，收到！'}`,
                  size: 'xs',
                  color: isApproved ? '#2E7D32' : '#B85536',
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
            createButton('✅ 查看課表', `${VERCEL_BASE_URL}/student/schedule`, '#9B7EC8'),
          ],
          paddingAll: '16px',
          paddingTop: '0px',
        },
      };
    },
  },

  A6: {
    id: 'A6',
    category: 'A',
    categoryName: '調課確認',
    title: '調課申請結果',
    triggerTiming: '老師/系統確認調課後 即時發送',
    description: '通知調課成功確認及新上課時段',
    defaultData: {
      originalTime: '09/16 (二) 19:00-21:00',
      newTime: '09/17 (三) 10:00-12:00',
      status: '✅ 已確認成功排入課表',
      isConfirmed: true,
    },
    targetUrl: `${VERCEL_BASE_URL}/student/schedule`,
    generateFlex: (data) => ({
      type: 'bubble',
      size: 'mega',
      header: createHeader('調課確認', '調課申請結果', '📋'),
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: '20px',
        contents: [
          createFieldRow('📅', '原定時間', data.originalTime || '09/16 (二) 19:00-21:00'),
          createFieldRow('✨', '新時段', data.newTime || '09/17 (三) 10:00-12:00', '#9B7EC8', true),
          createFieldRow('📋', '確認狀態', data.status || '已確認', '#49BB87', true),
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          createButton('✅ 查看課表', `${VERCEL_BASE_URL}/student/schedule`, '#49BB87'),
        ],
        paddingAll: '16px',
        paddingTop: '0px',
      },
    }),
  },

  // -------------------------------------------------------------
  // B. 繳費相關通知
  // -------------------------------------------------------------
  B1: {
    id: 'B1',
    category: 'B',
    categoryName: '繳費提醒',
    title: '學費繳費提醒',
    triggerTiming: '到期前 7 天 + 3 天 + 當天 各發一次',
    description: '提醒學員學費即將到期並引導上傳轉帳證明',
    defaultData: {
      item: '鋼琴個別課 第 3 期 (共 10 堂)',
      amount: 'NT$ 8,000',
      dueDate: '2026/09/20',
      remainingDays: '還有 3 天',
    },
    targetUrl: `${VERCEL_BASE_URL}/student/billing`,
    generateFlex: (data) => ({
      type: 'bubble',
      size: 'mega',
      header: createHeader('繳費提醒', '學費繳費提醒', '💰'),
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: '20px',
        contents: [
          createFieldRow('📖', '繳費項目', data.item || '鋼琴課第3期 10堂'),
          createFieldRow('💵', '應繳金額', data.amount || 'NT$ 8,000', '#2B3049', true),
          createFieldRow('📅', '繳費期限', data.dueDate || '2026/09/20'),
          createFieldRow('⏰', '剩餘天數', data.remainingDays || '還有 3 天', '#E8734A', true),
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          createButton('✅ 上傳繳費證明', `${VERCEL_BASE_URL}/student/billing`, '#9B7EC8'),
        ],
        paddingAll: '16px',
        paddingTop: '0px',
      },
    }),
  },

  B2: {
    id: 'B2',
    category: 'B',
    categoryName: '繳費核對',
    title: '繳費核對完成',
    triggerTiming: 'AI / 行政核對完畢後 即時發送',
    description: '確認繳費證明審核通過，款項已成功入帳',
    defaultData: {
      item: '鋼琴個別課 第 3 期 (共 10 堂)',
      amount: 'NT$ 8,000',
      status: '資料正確，款項已確認入帳 ✅',
    },
    targetUrl: `${VERCEL_BASE_URL}/student/history`,
    generateFlex: (data) => ({
      type: 'bubble',
      size: 'mega',
      header: createHeader('繳費核對', '繳費核對完成', '✅'),
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: '20px',
        contents: [
          createFieldRow('📖', '項目名稱', data.item || '鋼琴課第3期 10堂'),
          createFieldRow('💵', '入帳金額', data.amount || 'NT$ 8,000', '#2B3049', true),
          createFieldRow('✅', '核對結果', data.status || '資料正確，已確認入帳', '#49BB87', true),
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          createButton('📜 查看繳費紀錄', `${VERCEL_BASE_URL}/student/history`, '#49BB87'),
        ],
        paddingAll: '16px',
        paddingTop: '0px',
      },
    }),
  },

  B3: {
    id: 'B3',
    category: 'B',
    categoryName: '逾期催繳',
    title: '學費已逾期提醒',
    triggerTiming: '超過期限後 第 1 天 + 第 3 天 各發一次',
    description: '學費逾期警示通知，提供立即補繳與聯繫客服途徑',
    defaultData: {
      item: '鋼琴個別課 第 3 期 (共 10 堂)',
      amount: 'NT$ 8,000',
      dueDate: '2026/09/20',
      overdueDays: '已逾期 3 天',
    },
    targetUrl: `${VERCEL_BASE_URL}/student/billing`,
    generateFlex: (data) => ({
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '⚠️ 逾期催繳通知',
            weight: 'bold',
            size: 'lg',
            color: '#FFFFFF',
          },
        ],
        backgroundColor: '#E8734A',
        paddingAll: '18px',
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: '20px',
        contents: [
          createFieldRow('📖', '逾期項目', data.item || '鋼琴課第3期 10堂'),
          createFieldRow('💵', '應補金額', data.amount || 'NT$ 8,000', '#E8734A', true),
          createFieldRow('📅', '原繳期限', data.dueDate || '2026/09/20'),
          createFieldRow('❗', '逾期天數', data.overdueDays || '已逾期 3 天', '#E8734A', true),
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          createButton('💳 立即上傳繳費', `${VERCEL_BASE_URL}/student/billing`, '#E8734A'),
          createButton('💬 聯繫系統客服', `${VERCEL_BASE_URL}/student/faq`, '#7A7E90', 'secondary'),
        ],
        paddingAll: '16px',
        paddingTop: '0px',
      },
    }),
  },

  // -------------------------------------------------------------
  // C. 練習 / 打卡相關通知
  // -------------------------------------------------------------
  C1: {
    id: 'C1',
    category: 'C',
    categoryName: '練習打卡',
    title: '今天練習了嗎？',
    triggerTiming: '每日 預設 18:00 (若當天已打卡則不發)',
    description: '每日練習陪伴與連續打卡鼓勵通知',
    defaultData: {
      streak: '已連續打卡 6 天！🔥',
      encourage: '再堅持一天就達成連續 7 天週成就囉！加油！',
    },
    targetUrl: `${VERCEL_BASE_URL}/student/practice`,
    generateFlex: (data) => ({
      type: 'bubble',
      size: 'mega',
      header: createHeader('練習陪伴', '今天練習了嗎？', '🎵'),
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: '20px',
        contents: [
          createFieldRow('🔥', '連續打卡', data.streak || '已連續 6 天！', '#E8734A', true),
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#FAF7F2',
            cornerRadius: 'md',
            paddingAll: '12px',
            contents: [
              {
                type: 'text',
                text: `💬 ${data.encourage || '再堅持一天就達成7天成就囉！'}`,
                size: 'xs',
                color: '#555555',
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
          createButton('🎵 開始練習打卡', `${VERCEL_BASE_URL}/student/practice`, '#49BB87'),
        ],
        paddingAll: '16px',
        paddingTop: '0px',
      },
    }),
  },

  C2: {
    id: 'C2',
    category: 'C',
    categoryName: 'AI 診斷',
    title: '練習診斷報告出爐',
    triggerTiming: '學員上傳練習錄音後，AI 分析完畢即時發送',
    description: '音準、節奏、流暢度 AI 智能分析即時回饋',
    defaultData: {
      song: '巴哈E大調小提琴協奏曲 — 第一樂章',
      rhythm: '91% (精準穩定)',
      pitch: '85% (良好)',
      overallScore: '92 分 ⭐',
    },
    targetUrl: `${VERCEL_BASE_URL}/student/compare/p-rec-1`,
    generateFlex: (data) => ({
      type: 'bubble',
      size: 'mega',
      header: createHeader('AI 診斷報告', '練習診斷報告出爐', '🤖'),
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: '20px',
        contents: [
          createFieldRow('📖', '分析曲目', data.song || '巴哈E大調小提琴協奏曲'),
          createFieldRow('🎯', '節奏準度', data.rhythm || '91%', '#49BB87', true),
          createFieldRow('🎵', '音準準度', data.pitch || '85%', '#9B7EC8', true),
          createFieldRow('⭐', '綜合評分', data.overallScore || '92 分', '#2B3049', true),
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          createButton('📊 查看完整診斷報告', `${VERCEL_BASE_URL}/student/compare/p-rec-1`, '#9B7EC8'),
        ],
        paddingAll: '16px',
        paddingTop: '0px',
      },
    }),
  },

  C3: {
    id: 'C3',
    category: 'C',
    categoryName: '成就解鎖',
    title: '恭喜解鎖新成就！',
    triggerTiming: '學員達成學習里程碑條件時 即時發送',
    description: '獎勵學員持續練習並提升等級',
    defaultData: {
      badgeName: '努力堅持 🎖️',
      description: '連續練習打卡滿 7 天！',
      level: 'Lv.1 ➔ Lv.2 音樂探險家',
    },
    targetUrl: `${VERCEL_BASE_URL}/student/stamps`,
    generateFlex: (data) => ({
      type: 'bubble',
      size: 'mega',
      header: createHeader('成就榮譽', '恭喜解鎖新成就！', '🏆'),
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: '20px',
        contents: [
          createFieldRow('🎖️', '成就名稱', data.badgeName || '努力堅持', '#E5A100', true),
          createFieldRow('📝', '達成說明', data.description || '連續練習打卡 7 天'),
          createFieldRow('⭐', '等級提升', data.level || 'Lv.1 → Lv.2', '#49BB87', true),
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          createButton('🎖️ 查看成就徽章', `${VERCEL_BASE_URL}/student/stamps`, '#E5A100'),
        ],
        paddingAll: '16px',
        paddingTop: '0px',
      },
    }),
  },

  // -------------------------------------------------------------
  // D. 系統通知
  // -------------------------------------------------------------
  D1: {
    id: 'D1',
    category: 'D',
    categoryName: '系統公告',
    title: '系統公告',
    triggerTiming: '管理員於後台手動發布',
    description: '全體或個別學員之節慶停課、教室營運公告',
    defaultData: {
      content: '中秋節期間（9/28 - 9/30）教室暫停實體課程，10/1 起恢復正常上課，祝各位師生佳節愉快！',
      publishTime: '2026/09/20',
    },
    targetUrl: `${VERCEL_BASE_URL}/student/faq`,
    generateFlex: (data) => ({
      type: 'bubble',
      size: 'mega',
      header: createHeader('系統公告', '重要營運公告', '📢'),
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: '20px',
        contents: [
          {
            type: 'text',
            text: data.content || '中秋節期間暫停上課',
            size: 'sm',
            color: '#333333',
            wrap: true,
            lineSpacing: '4px',
          },
          {
            type: 'separator',
            margin: 'md',
            color: '#F0EBE1',
          },
          createFieldRow('📅', '發布日期', data.publishTime || '2026/09/20'),
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          createButton('ℹ️ 查看常見問題', `${VERCEL_BASE_URL}/student/faq`, '#7A7E90', 'secondary'),
        ],
        paddingAll: '16px',
        paddingTop: '0px',
      },
    }),
  },

  D2: {
    id: 'D2',
    category: 'D',
    categoryName: '老師訊息',
    title: '老師留言',
    triggerTiming: '老師於系統留言或課後叮嚀時 即時推播',
    description: '老師直接透過系統推播之個人化留言',
    defaultData: {
      teacher: '林佩芬 老師',
      message: '心悅你好，下次上課請記得帶巴哈E大調的指法樂譜喔！這週練習辛苦了～',
    },
    targetUrl: `${VERCEL_BASE_URL}/student/summary/lesson-1`,
    generateFlex: (data) => ({
      type: 'bubble',
      size: 'mega',
      header: createHeader('老師叮嚀', '老師專屬留言', '💬'),
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: '20px',
        contents: [
          createFieldRow('👩‍🏫', '留言老師', data.teacher || '林佩芬 老師', '#2B3049', true),
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#F6F2FB',
            cornerRadius: 'md',
            paddingAll: '12px',
            contents: [
              {
                type: 'text',
                text: `💬 ${data.message || '下次上課請帶樂譜喔！'}`,
                size: 'xs',
                color: '#4A3268',
                wrap: true,
                lineSpacing: '4px',
              },
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          createButton('📓 查看聯絡簿', `${VERCEL_BASE_URL}/student/summary/lesson-1`, '#9B7EC8'),
        ],
        paddingAll: '16px',
        paddingTop: '0px',
      },
    }),
  },
};
