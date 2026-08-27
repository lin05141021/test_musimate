/**
 * MusiMate LINE LIFF & Web Keyword Intent Matcher
 * 辨識學生在對話框中輸入的自然語言與相似關鍵字，自動匹配並觸發相應的意圖與 LIFF 動作
 */
(function() {
    const INTENT_RULES = [
        {
            name: 'view_schedule',
            keywords: ['課表', '我的課表', '上課時間', '幾點上課', '上課', '課表查詢', '行事曆', '哪一天上課', '看課表', '查課表', '今天有課嗎', '這週有課嗎', '下次上課', '下堂課', '課堂時間', 'schedule', 'timetable'],
            replyText: '🎵 您好！點擊下方按鈕即可立即查看您的專屬學生課表與上課地點：',
            liffUrl: 'https://liff.line.me/2011164851-lGsEnQWB',
            actionLabel: '📅 立即開啟我的課表'
        },
        {
            name: 'leave_and_reschedule',
            keywords: ['請假', '我要請假', '調課', '我要調課', '改時間', '換時間', '改期', '補課', '不能去', '無法上課', '無法出席', '暫停', '生病', '事假', '病假', '延期', '換時段', '調整時段', 'reschedule', 'leave'],
            replyText: '📋 收到您的請假/調課需求！系統提供智慧線上調課與課堂保留時數服務，請點擊下方按鈕進行申請：',
            liffUrl: 'https://liff.line.me/2011164851-lGsEnQWB?action=reschedule',
            actionLabel: '⏱️ 開啟線上調課與請假'
        },
        {
            name: 'new_course_booking',
            keywords: ['新課程', '開始新課程', '預約', '預約新課程', '找老師', '報名', '試上', '體驗課', '想學鋼琴', '想學小提琴', '想學吉他', '新生', '音樂課', '鋼琴課', '小提琴課', '長笛課', '吉他課', '學琴', '報名體驗'],
            replyText: '✨ 歡迎探索 MusiMate 音樂新課程！我們提供專業師資與彈性預約試上體驗：',
            liffUrl: 'https://liff.line.me/2011164851-id3vAnRx',
            actionLabel: '🎹 立即探索並預約新課程'
        },
        {
            name: 'contact_book',
            keywords: ['聯絡簿', '智慧聯絡簿', '作業', '進度', '課堂筆記', '老師交代', '練琴', '打卡', '練習紀錄', '今日作業', '錄音重點'],
            replyText: '📖 MusiMate 智慧聯絡簿已整合 AI 課堂錄音重點摘要與課後練習指引！老師的指導筆記皆已為您歸檔。'
        },
        {
            name: 'tuition_payment',
            keywords: ['繳費', '學費', '付錢', '多少錢', '帳單', '薪資', '收據', '學費繳納', '未繳', '已繳', '匯款', '現金'],
            replyText: '💳 您的學費繳納明細與堂數紀錄已同步於系統中。您可在「我的課表」課堂卡片中查看每堂課的繳費狀態。',
            liffUrl: 'https://liff.line.me/2011164851-lGsEnQWB',
            actionLabel: '💰 查看學費與課表狀態'
        },
        {
            name: 'teacher_profile',
            keywords: ['老師', '師資', '張老師', '張芷嫣', '介紹', '簡介', '學歷', '背景', '名師'],
            replyText: '👩‍🏫 張芷嫣老師主修鋼琴與小提琴（國立師大與維也納音樂大學碩士），教學資歷 10 年。歡迎點擊查看名師詳細檔案：',
            webUrl: 'https://lin05141021.github.io/test_musimate/src/newclass/teacher_info.html',
            actionLabel: '🎻 瀏覽張老師個人專欄'
        }
    ];

    function matchKeywordIntent(userText) {
        if (!userText || typeof userText !== 'string') return null;
        const normalized = userText.trim().toLowerCase();

        for (const rule of INTENT_RULES) {
            for (const kw of rule.keywords) {
                if (normalized.includes(kw.toLowerCase())) {
                    return rule;
                }
            }
        }
        return null;
    }

    if (typeof window !== 'undefined') {
        window.MusiMateKeywordEngine = {
            matchKeywordIntent,
            rules: INTENT_RULES
        };
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { matchKeywordIntent, INTENT_RULES };
    }
})();
