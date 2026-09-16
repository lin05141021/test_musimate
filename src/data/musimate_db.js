/**
 * ========================================================
 * MusiMate 整合式資料庫與 LINE LIFF 智慧身份連線核心
 * 支援: Supabase PostgreSQL 雲端中央資料庫即時同步
 * 專案 URL: https://iyzhwnvpqohdjqnrvqjq.supabase.co
 * ========================================================
 */

const MusiMateDB = (() => {
    const STORAGE_KEY = 'musimate_supabase_cached_db_v5';
    const RECONCILED_KEY = 'musimate_reconciled_ids';
    const REMAINING_HOURS_PREFIX = 'musimate_remaining_hours_';

    // Supabase 設定 (與同學之後端及前端配置完全對齊)
    const SUPABASE_URL = 'https://iyzhwnvpqohdjqnrvqjq.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_qhofcnT-u4Xbwv2QY1FjaA_vrdNOe_v';

    let supabaseClient = null;
    let isCloudSynced = false;
    let supabaseStudents = [];
    let supabaseTeachers = [];

    // 初始種子與保底快取資料 (包含同學在 Supabase 預設之核心師生與排課)
    const seedData = {
        users: [
            {
                id: 'df637b26-7cab-443b-8801-4361fb35afdd',
                role: 'teacher',
                name: '林佩芬 老師 (Teacher Lin)',
                email: 'teacher_df637b@musimate.com',
                password: 'teacher123',
                avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
                line_user_id: null
            },
            {
                id: 'u-lin-student',
                role: 'student',
                name: '劉心悅 (Lin)',
                email: 'lin.student@harmony.edu',
                avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
                line_user_id: 'Uf2457bf35e0d6d3060b60838d9a9c91c'
            },
            {
                id: '26b2f3dd-cc6f-4a97-8cda-6bc43aee3384-u',
                role: 'student',
                name: '許雅婷 (Charles)',
                email: 'yating.student@harmony.edu',
                avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
                line_user_id: 'U26ed3c0e48864aebdc244594cf780df0'
            },
            {
                id: 'u-kumei-student',
                role: 'student',
                name: '久美',
                email: 'kumei.student@harmony.edu',
                avatar_url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Kumei',
                line_user_id: null
            },
            {
                id: 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',
                role: 'student',
                name: '林小明 (Ming)',
                email: 'ming.student@harmony.edu',
                avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
                line_user_id: 'U_student_ming_001'
            }
        ],
        teachers: [
            {
                id: 'df637b26-7cab-443b-8801-4361fb35afdd',
                user_id: 'df637b26-7cab-443b-8801-4361fb35afdd',
                name: '林佩芬',
                instrument: '古典鋼琴 · 流行爵士鋼琴',
                bio: '國立維也納音樂學院碩士，具備 12 年教學資歷，專注於觸鍵音色與音樂詮釋。'
            }
        ],
        students: [
            { id: 's-lin', user_id: 'u-lin-student', name: '劉心悅 (Lin)', default_instrument: '古典鋼琴 (Piano)', rate_per_lesson: 2000, default_location: '音符琴房 A303', period: 3, line_user_id: 'Uf2457bf35e0d6d3060b60838d9a9c91c' },
            { id: '26b2f3dd-cc6f-4a97-8cda-6bc43aee3384-s', user_id: '26b2f3dd-cc6f-4a97-8cda-6bc43aee3384-u', name: '許雅婷 (Charles)', default_instrument: '古典鋼琴 (Piano)', rate_per_lesson: 1600, default_location: '音符琴房 A303', period: 1, line_user_id: 'U26ed3c0e48864aebdc244594cf780df0' },
            { id: 's-kumei', user_id: 'u-kumei-student', name: '久美', default_instrument: '古典鋼琴 (Piano)', rate_per_lesson: 1600, default_location: '音符琴房 A303', is_new_student: true },
            { id: 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', user_id: 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', name: '林小明 (Ming)', default_instrument: '小提琴 (Violin)', rate_per_lesson: 1200, default_location: '大安琴房 A 室', line_user_id: 'U_student_ming_001' }
        ],
        schedule_slots: [
            { id: 's1', start_time: '2026-09-18T14:00:00+08:00', end_time: '2026-09-18T15:00:00+08:00', location: '音符琴房 A301', is_available: true },
            { id: 's2', start_time: '2026-09-19T14:00:00+08:00', end_time: '2026-09-19T15:00:00+08:00', location: '音符琴房 A303', is_available: true },
            { id: 's3', start_time: '2026-09-21T10:00:00+08:00', end_time: '2026-09-21T11:00:00+08:00', location: '音符琴房 A301', is_available: true },
            { id: 's4', start_time: '2026-09-22T14:00:00+08:00', end_time: '2026-09-22T15:00:00+08:00', location: '音符琴房 A303', is_available: true },
            { id: 's5', start_time: '2026-09-25T14:00:00+08:00', end_time: '2026-09-25T15:00:00+08:00', location: '音符琴房 A301', is_available: true }
        ],
        appointments: [
            // ==========================================
            // 劉心悅 (Lin) - 第 3 期 進行中剩餘課程 (3 堂課)
            // ==========================================
            {
                id: 'app-lin-rem-1',
                student_id: 's-lin',
                student_name: '劉心悅 (Lin)',
                teacher_id: 'df637b26-7cab-443b-8801-4361fb35afdd',
                teacher_name: '林佩芬 老師',
                start_time: '2026-09-12T10:00:00+08:00',
                end_time: '2026-09-12T12:00:00+08:00',
                location: '音符琴房 A303',
                status: 'confirmed',
                instrument: '古典鋼琴 (Piano)',
                payment_status: 'paid',
                payment_type: 'postpaid',
                memo_notes: '第 3 期 · 蕭邦夜曲 Op.9 No.2 踏板與裝飾音'
            },
            {
                id: 'app-lin-rem-2',
                student_id: 's-lin',
                student_name: '劉心悅 (Lin)',
                teacher_id: 'df637b26-7cab-443b-8801-4361fb35afdd',
                teacher_name: '林佩芬 老師',
                start_time: '2026-09-16T10:00:00+08:00',
                end_time: '2026-09-16T12:00:00+08:00',
                location: '音符琴房 A303',
                status: 'confirmed',
                instrument: '古典鋼琴 (Piano)',
                payment_status: 'paid',
                payment_type: 'postpaid',
                memo_notes: '第 3 期 · 貝多芬月光奏鳴曲第三樂章 琶音與強弱對比'
            },
            {
                id: 'app-lin-rem-3',
                student_id: 's-lin',
                student_name: '劉心悅 (Lin)',
                teacher_id: 'df637b26-7cab-443b-8801-4361fb35afdd',
                teacher_name: '林佩芬 老師',
                start_time: '2026-09-18T10:00:00+08:00',
                end_time: '2026-09-18T12:00:00+08:00',
                location: '音符琴房 A303',
                status: 'confirmed',
                instrument: '古典鋼琴 (Piano)',
                payment_status: 'paid',
                payment_type: 'postpaid',
                memo_notes: '第 3 期結業堂 · 徹爾尼 599 第 20 首 & 巴哈初步第 3 首 (含 AI 語音週報)',
                has_voice_report: true,
                voice_report_id: 'lesson-6'
            },

            // ==========================================
            // 劉心悅 (Lin) - 第 4 期 已預約新學期課程 (10 堂課)
            // ==========================================
            { id: 'app-lin-t4-1', student_id: 's-lin', student_name: '劉心悅 (Lin)', teacher_id: 'df637b26-7cab-443b-8801-4361fb35afdd', teacher_name: '林佩芬 老師', start_time: '2026-09-23T19:00:00+08:00', end_time: '2026-09-23T21:00:00+08:00', location: '音符琴房 A303', status: 'confirmed', instrument: '古典鋼琴 (第4期 第1堂)', payment_status: 'paid', payment_type: 'prepaid', memo_notes: '第 4 期 第 1 堂課' },
            { id: 'app-lin-t4-2', student_id: 's-lin', student_name: '劉心悅 (Lin)', teacher_id: 'df637b26-7cab-443b-8801-4361fb35afdd', teacher_name: '林佩芬 老師', start_time: '2026-09-30T19:00:00+08:00', end_time: '2026-09-30T21:00:00+08:00', location: '音符琴房 A303', status: 'confirmed', instrument: '古典鋼琴 (第4期 第2堂)', payment_status: 'paid', payment_type: 'prepaid', memo_notes: '第 4 期 第 2 堂課' },
            { id: 'app-lin-t4-3', student_id: 's-lin', student_name: '劉心悅 (Lin)', teacher_id: 'df637b26-7cab-443b-8801-4361fb35afdd', teacher_name: '林佩芬 老師', start_time: '2026-10-07T19:00:00+08:00', end_time: '2026-10-07T21:00:00+08:00', location: '音符琴房 A303', status: 'confirmed', instrument: '古典鋼琴 (第4期 第3堂)', payment_status: 'paid', payment_type: 'prepaid', memo_notes: '第 4 期 第 3 堂課' },
            { id: 'app-lin-t4-4', student_id: 's-lin', student_name: '劉心悅 (Lin)', teacher_id: 'df637b26-7cab-443b-8801-4361fb35afdd', teacher_name: '林佩芬 老師', start_time: '2026-10-14T19:00:00+08:00', end_time: '2026-10-14T21:00:00+08:00', location: '音符琴房 A303', status: 'confirmed', instrument: '古典鋼琴 (第4期 第4堂)', payment_status: 'paid', payment_type: 'prepaid', memo_notes: '第 4 期 第 4 堂課' },
            { id: 'app-lin-t4-5', student_id: 's-lin', student_name: '劉心悅 (Lin)', teacher_id: 'df637b26-7cab-443b-8801-4361fb35afdd', teacher_name: '林佩芬 老師', start_time: '2026-10-21T19:00:00+08:00', end_time: '2026-10-21T21:00:00+08:00', location: '音符琴房 A303', status: 'confirmed', instrument: '古典鋼琴 (第4期 第5堂)', payment_status: 'paid', payment_type: 'prepaid', memo_notes: '第 4 期 第 5 堂課' },
            { id: 'app-lin-t4-6', student_id: 's-lin', student_name: '劉心悅 (Lin)', teacher_id: 'df637b26-7cab-443b-8801-4361fb35afdd', teacher_name: '林佩芬 老師', start_time: '2026-10-28T19:00:00+08:00', end_time: '2026-10-28T21:00:00+08:00', location: '音符琴房 A303', status: 'confirmed', instrument: '古典鋼琴 (第4期 第6堂)', payment_status: 'paid', payment_type: 'prepaid', memo_notes: '第 4 期 第 6 堂課' },
            { id: 'app-lin-t4-7', student_id: 's-lin', student_name: '劉心悅 (Lin)', teacher_id: 'df637b26-7cab-443b-8801-4361fb35afdd', teacher_name: '林佩芬 老師', start_time: '2026-11-04T19:00:00+08:00', end_time: '2026-11-04T21:00:00+08:00', location: '音符琴房 A303', status: 'confirmed', instrument: '古典鋼琴 (第4期 第7堂)', payment_status: 'paid', payment_type: 'prepaid', memo_notes: '第 4 期 第 7 堂課' },
            { id: 'app-lin-t4-8', student_id: 's-lin', student_name: '劉心悅 (Lin)', teacher_id: 'df637b26-7cab-443b-8801-4361fb35afdd', teacher_name: '林佩芬 老師', start_time: '2026-11-11T19:00:00+08:00', end_time: '2026-11-11T21:00:00+08:00', location: '音符琴房 A303', status: 'confirmed', instrument: '古典鋼琴 (第4期 第8堂)', payment_status: 'paid', payment_type: 'prepaid', memo_notes: '第 4 期 第 8 堂課' },
            { id: 'app-lin-t4-9', student_id: 's-lin', student_name: '劉心悅 (Lin)', teacher_id: 'df637b26-7cab-443b-8801-4361fb35afdd', teacher_name: '林佩芬 老師', start_time: '2026-11-18T19:00:00+08:00', end_time: '2026-11-18T21:00:00+08:00', location: '音符琴房 A303', status: 'confirmed', instrument: '古典鋼琴 (第4期 第9堂)', payment_status: 'paid', payment_type: 'prepaid', memo_notes: '第 4 期 第 9 堂課' },
            { id: 'app-lin-t4-10', student_id: 's-lin', student_name: '劉心悅 (Lin)', teacher_id: 'df637b26-7cab-443b-8801-4361fb35afdd', teacher_name: '林佩芬 老師', start_time: '2026-11-25T19:00:00+08:00', end_time: '2026-11-25T21:00:00+08:00', location: '音符琴房 A303', status: 'confirmed', instrument: '古典鋼琴 (第4期 第10堂)', payment_status: 'paid', payment_type: 'prepaid', memo_notes: '第 4 期 第 10 堂課' },

            // ==========================================
            // 許雅婷 (Charles) - 每週固定預約課程 (4 堂課)
            // ==========================================
            {
                id: 'app-charles-1',
                student_id: '26b2f3dd-cc6f-4a97-8cda-6bc43aee3384-s',
                student_name: '許雅婷 (Charles)',
                teacher_id: 'df637b26-7cab-443b-8801-4361fb35afdd',
                teacher_name: '林佩芬 老師',
                start_time: '2026-09-17T14:00:00+08:00',
                end_time: '2026-09-17T16:00:00+08:00',
                location: '音符琴房 A303',
                status: 'confirmed',
                instrument: '古典鋼琴 (中級)',
                payment_status: 'paid',
                payment_type: 'postpaid',
                memo_notes: '徹爾尼 599 第 15 首'
            },
            {
                id: 'app-charles-2',
                student_id: '26b2f3dd-cc6f-4a97-8cda-6bc43aee3384-s',
                student_name: '許雅婷 (Charles)',
                teacher_id: 'df637b26-7cab-443b-8801-4361fb35afdd',
                teacher_name: '林佩芬 老師',
                start_time: '2026-09-24T14:00:00+08:00',
                end_time: '2026-09-24T16:00:00+08:00',
                location: '音符琴房 A303',
                status: 'confirmed',
                instrument: '古典鋼琴 (中級)',
                payment_status: 'paid',
                payment_type: 'postpaid',
                memo_notes: '巴哈小步舞曲'
            },
            {
                id: 'app-charles-3',
                student_id: '26b2f3dd-cc6f-4a97-8cda-6bc43aee3384-s',
                student_name: '許雅婷 (Charles)',
                teacher_id: 'df637b26-7cab-443b-8801-4361fb35afdd',
                teacher_name: '林佩芬 老師',
                start_time: '2026-10-01T14:00:00+08:00',
                end_time: '2026-10-01T16:00:00+08:00',
                location: '音符琴房 A303',
                status: 'confirmed',
                instrument: '古典鋼琴 (中級)',
                payment_status: 'paid',
                payment_type: 'postpaid',
                memo_notes: '古典鋼琴定期課堂'
            },
            {
                id: 'app-charles-4',
                student_id: '26b2f3dd-cc6f-4a97-8cda-6bc43aee3384-s',
                student_name: '許雅婷 (Charles)',
                teacher_id: 'df637b26-7cab-443b-8801-4361fb35afdd',
                teacher_name: '林佩芬 老師',
                start_time: '2026-10-08T14:00:00+08:00',
                end_time: '2026-10-08T16:00:00+08:00',
                location: '音符琴房 A303',
                status: 'confirmed',
                instrument: '古典鋼琴 (中級)',
                payment_status: 'paid',
                payment_type: 'postpaid',
                memo_notes: '古典鋼琴定期課堂'
            },

            // ==========================================
            // 林小明 (Ming) - 小提琴課程 (2 堂課)
            // ==========================================
            {
                id: 'app-ming-1',
                student_id: 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',
                student_name: '林小明 (Ming)',
                teacher_id: 'df637b26-7cab-443b-8801-4361fb35afdd',
                teacher_name: '林佩芬 老師',
                start_time: '2026-09-19T10:00:00+08:00',
                end_time: '2026-09-19T11:00:00+08:00',
                location: '大安琴房 A 室',
                status: 'confirmed',
                instrument: '小提琴 (Violin)',
                payment_status: 'paid',
                payment_type: 'postpaid'
            },
            {
                id: 'app-ming-2',
                student_id: 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',
                student_name: '林小明 (Ming)',
                teacher_id: 'df637b26-7cab-443b-8801-4361fb35afdd',
                teacher_name: '林佩芬 老師',
                start_time: '2026-09-26T10:00:00+08:00',
                end_time: '2026-09-26T11:00:00+08:00',
                location: '大安琴房 A 室',
                status: 'confirmed',
                instrument: '小提琴 (Violin)',
                payment_status: 'paid',
                payment_type: 'postpaid'
            }
        ],
        lessons: [
            {
                id: 'lesson-6',
                appointment_id: 'app-lin-rem-3',
                student_name: '劉心悅 (Lin)',
                created_at: '2026-09-18T10:00:00+08:00',
                song_title: '徹爾尼 599 第 20 首 & 巴哈初步第 3 首',
                teacher_name: '林佩芬 老師 (Teacher Lin)',
                raw_transcript: '今天小明彈徹爾尼 599 第 20 首，右手顆粒感進步很多，但第 12 小節左手伴奏太重，請放輕手腕帶動。作業練第 20 首速度 80，加上巴哈初步第 3 首前四小節。',
                clean_summary_json: {
                    highlights: [
                        '徹爾尼 599 第 20 首右手顆粒感顯著進步，手指獨立性佳',
                        '音色清晰純淨，樂句整體流暢度大幅提升'
                    ],
                    technical_tips: [
                        '第 12 小節左手伴奏觸鍵偏重，請以放輕手腕自然呼吸帶動，避免手臂下壓用力。',
                        '右手快速音群保持掌關節穩定拱形，指尖垂直觸鍵確保顆粒分明。'
                    ],
                    theory_tips: [
                        '注意主從和聲平衡：右手為主旋律、左手為背景和弦伴奏，兩手強弱需有明顯層次。',
                        '巴哈複調音樂雙手各自獨立，注意二聲部對位線條清晰度。'
                    ],
                    homework: [
                        '徹爾尼 599 第 20 首：配合節拍器由慢練漸進提升至目標速度 BPM 80，每日練習 15 分鐘',
                        '巴哈初步第 3 首：雙手分開單獨慢練第 1 至 4 小節，熟記指法與聲部進行',
                        '針對第 12 小節左手伴奏手腕放鬆度錄製 15 秒打卡音訊供批改'
                    ],
                    encouragement: '右手顆粒感的進步非常亮眼！只要把左手的手腕放鬆、伴奏輕下來，整首曲子的層次就會如同水晶般清澈。繼續加油！',
                    bpm_recommendation: 80
                }
            }
        ]
    };

    // 初始化本機快取 DB
    function getDB() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
            return seedData;
        }
        try {
            return JSON.parse(raw);
        } catch (e) {
            return seedData;
        }
    }

    function saveDB(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    // 動態載入 Supabase JS SDK
    function loadSupabaseSdk() {
        if (window.supabase && typeof window.supabase.createClient === 'function') {
            return Promise.resolve(window.supabase);
        }
        return new Promise((resolve, reject) => {
            const existingScript = document.querySelector('script[src*="supabase-js"]');
            if (existingScript) {
                existingScript.addEventListener('load', () => resolve(window.supabase));
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.onload = () => resolve(window.supabase);
            script.onerror = (err) => reject(err);
            document.head.appendChild(script);
        });
    }

    // 啟動與 Supabase 雲端資料庫雙向同步
    async function initSupabaseCloudSync() {
        try {
            await loadSupabaseSdk();
            if (!window.supabase || typeof window.supabase.createClient !== 'function') {
                console.warn('⚠️ [Supabase] SDK 未能成功掛載，使用本機快取');
                return;
            }

            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('🔥 [Supabase] 已成功連線至同學之中央資料庫 (iyzhwnvpqohdjqnrvqjq.supabase.co)！');

            // 1. 同步 100 位學生資料
            const { data: dbStudents, error: errStudents } = await supabaseClient.from('students').select('*');
            if (!errStudents && Array.isArray(dbStudents) && dbStudents.length > 0) {
                supabaseStudents = dbStudents;
                console.log(`🎓 [Supabase] 已載入 ${dbStudents.length} 位同學預設學員名冊！`);
            }

            // 2. 同步 20 位教師資料
            const { data: dbTeachers, error: errTeachers } = await supabaseClient.from('teachers').select('*');
            if (!errTeachers && Array.isArray(dbTeachers) && dbTeachers.length > 0) {
                supabaseTeachers = dbTeachers;
                console.log(`👨‍🏫 [Supabase] 已載入 ${dbTeachers.length} 位同學預設教師名冊！`);
            }

            // 3. 同步排課總表 (schedules 資料表)
            const { data: dbSchedules, error: errSchedules } = await supabaseClient.from('schedules').select('*');
            if (!errSchedules && Array.isArray(dbSchedules) && dbSchedules.length > 0) {
                console.log(`📅 [Supabase] 已成功讀取 ${dbSchedules.length} 筆真實課表排程！`);

                const localDb = getDB();
                const remoteAppointments = [];
                const remoteSlots = [];

                dbSchedules.forEach((row, idx) => {
                    // 判斷是否為開放時段
                    const isAvailable = row.status === 'available' || row.schedule_type === 'open' || (row.student_name && row.student_name.includes('開放'));
                    
                    let startIso = row.start_time;
                    let endIso = row.end_time;

                    // 根據 day_of_week 自動對齊至當週日期 (2026-08-24 ~ 2026-08-30)
                    const dayMap = { '一': '2026-08-24', '二': '2026-08-25', '三': '2026-08-26', '四': '2026-08-27', '五': '2026-08-28', '六': '2026-08-29', '日': '2026-08-30' };
                    let datePrefix = row.date;
                    if (!datePrefix && row.day_of_week) {
                        for (const [k, v] of Object.entries(dayMap)) {
                            if (row.day_of_week.includes(k)) {
                                datePrefix = v;
                                break;
                            }
                        }
                    }
                    if (!datePrefix) datePrefix = '2026-08-24';

                    // 若格式為純時間 (如 "10:00" 或 "14:00")，補全為 ISO 日期字串
                    if (startIso && !startIso.includes('T')) {
                        startIso = `${datePrefix}T${startIso.length === 5 ? startIso + ':00' : startIso}+08:00`;
                    }
                    if (endIso && !endIso.includes('T')) {
                        endIso = `${datePrefix}T${endIso.length === 5 ? endIso + ':00' : endIso}+08:00`;
                    }

                    if (!startIso) {
                        const slotStr = row.time_slot || '10:00 - 11:00';
                        const times = slotStr.split('-');
                        startIso = `${datePrefix}T${(times[0]||'10:00').trim()}:00+08:00`;
                        endIso = `${datePrefix}T${(times[1]||'11:00').trim()}:00+08:00`;
                    }

                    if (isAvailable) {
                        remoteSlots.push({
                            id: row.id || `slot-supa-${idx}`,
                            start_time: startIso,
                            end_time: endIso,
                            location: row.room || '音符琴房 A303',
                            is_available: true
                        });
                    } else {
                        remoteAppointments.push({
                            id: row.id || `app-supa-${idx}`,
                            student_id: row.student_id || row.id,
                            student_name: row.student_name || '學員',
                            teacher_id: row.teacher_id || 'df637b26-7cab-443b-8801-4361fb35afdd',
                            teacher_name: row.teacher_name || '林佩芬',
                            start_time: startIso,
                            end_time: endIso,
                            location: row.room || '音符琴房 A303',
                            status: row.status || 'confirmed',
                            instrument: row.instrument || '鋼琴 (Piano)',
                            payment_status: row.fee ? 'paid' : 'pay_per_lesson',
                            payment_type: 'postpaid',
                            memo_notes: row.notes || '',
                            attendance: (row.status === 'attended' || row.status === 'completed') ? 'attended' : 'pending'
                        });
                    }
                });

                // 合併遠端與現有課表 (避免重複覆蓋)
                const mergedAppointments = [...remoteAppointments];
                localDb.appointments.forEach(localApp => {
                    if (!mergedAppointments.some(r => r.id === localApp.id || (r.start_time === localApp.start_time && r.student_name === localApp.student_name))) {
                        mergedAppointments.push(localApp);
                    }
                });

                const mergedSlots = [...remoteSlots];
                localDb.schedule_slots.forEach(localSlot => {
                    if (!mergedSlots.some(r => r.id === localSlot.id || r.start_time === localSlot.start_time)) {
                        mergedSlots.push(localSlot);
                    }
                });

                localDb.appointments = mergedAppointments;
                localDb.schedule_slots = mergedSlots;
                saveDB(localDb);

                isCloudSynced = true;
                window.dispatchEvent(new CustomEvent('musimate_db_synced', { detail: { source: 'supabase', count: dbSchedules.length } }));
                console.log('⚡ [Supabase] 本機課表已與同學的 Supabase 即時雙向同軌！');
            }

        } catch (err) {
            console.warn('⚠️ [Supabase] 連線提示:', err);
        }
    }

    // 自動啟動連線
    if (typeof window !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initSupabaseCloudSync);
        } else {
            initSupabaseCloudSync();
        }
    }

    return {
        // 取得 Supabase 原始客戶端
        getSupabase() {
            return supabaseClient;
        },

        // 檢查雲端狀態
        isSynced() {
            return isCloudSynced;
        },

        // 1. 取得所有學員清單 (整合同學 Supabase 100+ 位學生 + 自訂學員 + 本地名冊)
        getStudents() {
            const db = getDB();
            const list = [];
            const seen = new Set();

            // 讀取自訂/動態註冊之學員 (例如久美或其他 LINE 新生)
            const customRaw = localStorage.getItem('musimate_custom_students');
            let customList = [];
            try { customList = customRaw ? JSON.parse(customRaw) : []; } catch(e) {}

            // 1) 載入自訂/動態註冊之學員 (最高優先級)
            customList.forEach(s => {
                if (s && s.name && !seen.has(s.name)) {
                    seen.add(s.name);
                    const customLineId = localStorage.getItem(`line_user_id_${s.student_id}`) || localStorage.getItem(`line_user_id_${s.id}`) || localStorage.getItem(`line_user_id_${s.name}`) || s.line_user_id;
                    list.push({
                        student_id: s.student_id || s.id || `custom-${Date.now()}`,
                        user_id: s.user_id || s.student_id || s.id,
                        name: s.name,
                        avatar_url: s.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(s.name)}`,
                        line_user_id: customLineId || null,
                        default_instrument: s.default_instrument || '古典鋼琴 (Piano)',
                        default_location: s.default_location || '音符琴房 A303',
                        rate_per_lesson: s.rate_per_lesson || 1600
                    });
                }
            });

            // 2) 載入 Supabase 學員名冊
            if (supabaseStudents.length > 0) {
                supabaseStudents.forEach(s => {
                    if (!seen.has(s.name)) {
                        seen.add(s.name);
                        const isLin = s.name.includes('劉心悅') || s.name.includes('Lin');
                        const isMing = s.name === '林小明';
                        const customLineId = localStorage.getItem(`line_user_id_${s.id}`) || localStorage.getItem(`line_user_id_${s.name}`);
                        list.push({
                            student_id: s.id,
                            user_id: s.id,
                            name: s.name,
                            avatar_url: isLin ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' : `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(s.name)}`,
                            line_user_id: customLineId || (isLin ? 'Uf2457bf35e0d6d3060b60838d9a9c91c' : (isMing ? 'U_student_ming_001' : null)),
                            default_instrument: s.instrument ? `${s.instrument} (Piano)` : '鋼琴 (Piano)',
                            default_location: '音符琴房 A303',
                            rate_per_lesson: 2000
                        });
                    }
                });
            }

            // 3) 補入本地種子學生
            db.students.forEach(s => {
                if (!seen.has(s.name)) {
                    seen.add(s.name);
                    const isMing = s.name === '林小明';
                    const isLin = s.name.includes('Lin') || s.user_id === 'u-lin-student';
                    const customLineId = localStorage.getItem(`line_user_id_${s.id}`) || localStorage.getItem(`line_user_id_${s.name}`);
                    list.push({
                        student_id: s.id,
                        user_id: s.user_id,
                        name: s.name,
                        avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
                        line_user_id: customLineId || (isLin ? 'Uf2457bf35e0d6d3060b60838d9a9c91c' : (isMing ? 'U_student_ming_001' : null)),
                        default_instrument: s.default_instrument || '鋼琴 (Piano)',
                        default_location: s.default_location || '音符琴房 A303',
                        rate_per_lesson: s.rate_per_lesson || 1600
                    });
                }
            });

            return list;
        },

        // 註冊/新增自訂學員 (支援 LINE 動態加入的同學如久美)
        registerCustomStudent(student) {
            if (!student || !student.name) return null;
            const db = getDB();
            if (!db.students.some(s => s.name === student.name || s.id === student.id)) {
                db.students.push(student);
                saveDB(db);
            }
            const customRaw = localStorage.getItem('musimate_custom_students');
            let customList = [];
            try { customList = customRaw ? JSON.parse(customRaw) : []; } catch(e) {}
            const existingIdx = customList.findIndex(s => s.name === student.name || (s.line_user_id && s.line_user_id === student.line_user_id));
            if (existingIdx >= 0) {
                customList[existingIdx] = { ...customList[existingIdx], ...student };
            } else {
                customList.push(student);
            }
            localStorage.setItem('musimate_custom_students', JSON.stringify(customList));
            return student;
        },

        // 切換與取得當前作用中學員
        setActiveStudent(studentIdOrName) {
            if (!studentIdOrName) return;
            localStorage.setItem('musimate_active_student_id', studentIdOrName);
        },
        getActiveStudent() {
            const savedId = localStorage.getItem('musimate_active_student_id');
            if (!savedId) return null;
            const students = this.getStudents();
            return students.find(s => s.student_id === savedId || s.id === savedId || s.name === savedId) || null;
        },

        // 2. 取得所有教師清單 (來自 Supabase 20 位教師)
        getTeachers() {
            if (supabaseTeachers.length > 0) {
                return supabaseTeachers;
            }
            return getDB().teachers;
        },

        // 3. 取得老師總課表 (所有預約 + 開放時段)
        getTeacherSchedule(teacherNameOrId) {
            const db = getDB();
            let appts = db.appointments;
            let slots = db.schedule_slots;

            if (teacherNameOrId) {
                appts = appts.filter(a => a.teacher_id === teacherNameOrId || a.teacher_name === teacherNameOrId);
            }

            return {
                appointments: appts,
                schedule_slots: slots
            };
        },

        // 4. 依據學生姓名或 ID 取得預約課表
        getAppointmentsByStudent(studentIdentifier) {
            const db = getDB();
            if (!studentIdentifier) return db.appointments;
            const target = String(studentIdentifier).trim().toLowerCase();

            return db.appointments
                .filter(a => {
                    const sId = (a.student_id || '').toLowerCase();
                    const sName = (a.student_name || '').toLowerCase();

                    // 1. 精準 ID 比對
                    if (sId === target || sName === target) return true;

                    // 2. 許雅婷 (Charles) 多重別名合一比對
                    if ((target.includes('charles') || target.includes('雅婷') || target.includes('查爾斯') || target.includes('26b2f3dd')) &&
                        (sName.includes('charles') || sName.includes('雅婷') || sId.includes('26b2f3dd'))) {
                        return true;
                    }

                    // 3. 劉心悅 (Lin) 多重別名合一比對
                    if ((target.includes('lin') || target.includes('心悅') || target.includes('劉心悅') || target.includes('s-lin')) &&
                        (sName.includes('lin') || sName.includes('心悅') || sName.includes('劉心悅') || sId.includes('s-lin'))) {
                        return true;
                    }

                    // 4. 久美 (Kumei) 比對
                    if ((target.includes('久美') || target.includes('kumei') || target.includes('s-kumei')) &&
                        (sName.includes('久美') || sName.includes('kumei') || sId.includes('s-kumei'))) {
                        return true;
                    }

                    // 5. 林小明 (Ming) 比對
                    if ((target.includes('小明') || target.includes('ming') || target.includes('bbbbbbbb')) &&
                        (sName.includes('小明') || sName.includes('ming') || sId.includes('bbbbbbbb'))) {
                        return true;
                    }

                    // 6. 模糊包含比對
                    return sName.includes(target) || target.includes(sName);
                })
                .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
        },

        // 5. 取得所有開放預約時段
        getAvailableSlots() {
            const db = getDB();
            return db.schedule_slots.filter(s => s.is_available !== false);
        },

        // 6. 新增課堂預約 (直接持久化寫入 Supabase schedules)
        addAppointment(appt) {
            const db = getDB();
            const newAppt = {
                id: appt.id || `app-${Date.now()}-${Math.floor(Math.random()*1000)}`,
                student_id: appt.student_id || '',
                student_name: appt.student_name || '學員',
                teacher_id: appt.teacher_id || 'df637b26-7cab-443b-8801-4361fb35afdd',
                teacher_name: appt.teacher_name || '林佩芬',
                start_time: appt.start_time,
                end_time: appt.end_time,
                status: appt.status || 'confirmed',
                instrument: appt.instrument || '鋼琴 (Piano)',
                location: appt.location || '大安琴房 A 室',
                payment_status: appt.payment_status || 'paid',
                payment_type: appt.payment_type || 'postpaid',
                memo_notes: appt.memo_notes || '',
                attendance: 'pending',
                is_new_badge: true
            };

            db.appointments.push(newAppt);

            // 本地防衝突更新
            db.schedule_slots = db.schedule_slots.map(s => {
                if (s.start_time && appt.start_time && s.start_time.slice(0, 16) === appt.start_time.slice(0, 16)) {
                    return { ...s, is_available: false };
                }
                return s;
            });
            saveDB(db);

            // 🚀 直接寫入 Supabase schedules 資料表
            if (supabaseClient) {
                supabaseClient.from('schedules').insert([{
                    student_name: newAppt.student_name,
                    teacher_name: newAppt.teacher_name,
                    teacher_id: newAppt.teacher_id,
                    student_id: newAppt.student_id || null,
                    start_time: newAppt.start_time,
                    end_time: newAppt.end_time,
                    room: newAppt.location,
                    fee: 1600,
                    status: 'confirmed',
                    notes: newAppt.memo_notes,
                    recurring: Boolean(appt.repeat_weeks && appt.repeat_weeks > 1),
                    schedule_type: 'regular'
                }]).then(res => {
                    if (res.error) {
                        console.warn('⚠️ [Supabase 寫入提示]:', res.error.message);
                    } else {
                        console.log('☁️ [Supabase] 課堂已同步寫入雲端 schedules 資料表！');
                    }
                }).catch(err => console.warn('Supabase insert error:', err));
            }

            return newAppt;
        },

        // 7. 週期批量排課
        addRecurringAppointments(baseAppt, repeatCount = 1) {
            const addedList = [];
            const startDate = new Date(baseAppt.start_time);
            const endDate = new Date(baseAppt.end_time);
            const durationMs = endDate.getTime() - startDate.getTime();

            for (let i = 0; i < repeatCount; i++) {
                const currentStart = new Date(startDate.getTime() + i * 7 * 24 * 60 * 60 * 1000);
                const currentEnd = new Date(currentStart.getTime() + durationMs);

                const y = currentStart.getFullYear();
                const m = String(currentStart.getMonth() + 1).padStart(2, '0');
                const d = String(currentStart.getDate()).padStart(2, '0');
                const sh = String(currentStart.getHours()).padStart(2, '0');
                const sm = String(currentStart.getMinutes()).padStart(2, '0');
                const eh = String(currentEnd.getHours()).padStart(2, '0');
                const em = String(currentEnd.getMinutes()).padStart(2, '0');

                const apptInstance = {
                    ...baseAppt,
                    id: `app-${Date.now()}-${i}`,
                    start_time: `${y}-${m}-${d}T${sh}:${sm}:00+08:00`,
                    end_time: `${y}-${m}-${d}T${eh}:${em}:00+08:00`,
                    repeat_weeks: repeatCount,
                    is_new_badge: true
                };

                const created = this.addAppointment(apptInstance);
                addedList.push(created);
            }
            return addedList;
        },

        // 8. 開放時段 (寫入 Supabase)
        addOpenSlot(slot) {
            const db = getDB();
            const newSlot = {
                id: slot.id || `slot-${Date.now()}`,
                start_time: slot.start_time,
                end_time: slot.end_time,
                location: slot.location || '大安琴房 A 室',
                is_available: true
            };
            db.schedule_slots.push(newSlot);
            saveDB(db);

            if (supabaseClient) {
                supabaseClient.from('schedules').insert([{
                    student_name: '✨ 開放時段',
                    start_time: newSlot.start_time,
                    end_time: newSlot.end_time,
                    room: newSlot.location,
                    status: 'available',
                    schedule_type: 'open'
                }]).then(res => {
                    console.log('☁️ [Supabase] 開放時段已同步發布至同學資料庫！');
                }).catch(e => console.warn('Supabase slot error:', e));
            }

            return newSlot;
        },

        // 9. 更新備忘錄
        updateLessonMemo(appointmentId, notes) {
            const db = getDB();
            const appt = db.appointments.find(a => a.id === appointmentId);
            if (appt) {
                appt.memo_notes = notes;
                saveDB(db);
                if (supabaseClient) {
                    supabaseClient.from('schedules').update({ notes: notes }).eq('id', appointmentId).then(() => {
                        console.log('☁️ [Supabase] 備忘已同步更新');
                    });
                }
            }
            return appt;
        },

        // 10. 課前打卡簽到 (持久化寫入 Supabase)
        markAttendance(appointmentId, status = 'attended') {
            const db = getDB();
            const appt = db.appointments.find(a => a.id === appointmentId);
            if (appt) {
                appt.attendance = status;
                saveDB(db);
                if (supabaseClient) {
                    supabaseClient.from('schedules').update({ status: status }).eq('id', appointmentId).then(() => {
                        console.log('☁️ [Supabase] 簽到狀態已更新');
                    });
                }
            }
            return appt;
        },

        // 11. 老師停課處理
        cancelByTeacher(appointmentId, reason = '老師臨時有事調課') {
            const db = getDB();
            const appt = db.appointments.find(a => a.id === appointmentId);
            if (appt) {
                appt.status = 'teacher_cancelled';
                appt.memo_notes = `【老師停課備忘】${reason}`;
                saveDB(db);
                if (supabaseClient) {
                    supabaseClient.from('schedules').update({ status: 'cancelled', notes: reason }).eq('id', appointmentId).then(() => {
                        console.log('☁️ [Supabase] 停課狀態已更新');
                    });
                }
            }
            return appt;
        },

        // 12. 手動或自動綁定學生 LINE ID
        bindStudentLineUserId(studentNameOrId, lineUserId) {
            if (!studentNameOrId || !lineUserId) return;
            localStorage.setItem(`line_user_id_${studentNameOrId}`, lineUserId);
            console.log(`🔗 已將 LINE ID: ${lineUserId} 成功綁定至學員: ${studentNameOrId}`);
        },

        // 13. LINE LIFF 自動身份辨識 (精準匹配學員，絕不將既有學生拆分成幽靈帳號)
        authLiffUser(liffProfile) {
            if (!liffProfile) return null;
            const { userId, displayName, pictureUrl } = liffProfile;
            const students = this.getStudents();
            const dName = (displayName || '').trim().toLowerCase();

            // 1. 優先嚴格比對 LINE User ID (單一事實來源)
            let matched = students.find(s => s.line_user_id && s.line_user_id === userId);

            // 2. 嚴格比對官方預設學員代號與中英別名
            if (!matched) {
                if (dName.includes('charles') || dName.includes('雅婷') || dName.includes('查爾斯') || userId === 'U26ed3c0e48864aebdc244594cf780df0') {
                    matched = students.find(s => s.student_id === '26b2f3dd-cc6f-4a97-8cda-6bc43aee3384-s' || s.name.includes('許雅婷') || s.name.includes('Charles'));
                } else if (dName.includes('lin') || dName.includes('心悅') || dName.includes('劉心悅') || userId === 'Uf2457bf35e0d6d3060b60838d9a9c91c') {
                    matched = students.find(s => s.student_id === 's-lin' || s.name.includes('劉心悅') || s.name.includes('Lin'));
                } else if (dName.includes('久美') || dName.includes('kumei')) {
                    matched = students.find(s => s.student_id === 's-kumei' || s.name.includes('久美'));
                } else if (dName.includes('小明') || dName.includes('ming')) {
                    matched = students.find(s => s.student_id === 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb' || s.name.includes('林小明'));
                }
            }

            // 3. 一般名稱精準比對
            if (!matched && displayName) {
                matched = students.find(s => s.name && (
                    s.name.trim().toLowerCase() === dName ||
                    s.name.toLowerCase().includes(dName) ||
                    dName.includes(s.name.toLowerCase())
                ));
            }

            // 4. 檢查是否有先前手動切換的作用中學員
            if (!matched) {
                const active = this.getActiveStudent();
                if (active) matched = active;
            }

            // 5. 若確實為未在名冊的新生 (例如全新 LINE 加入者)，動態為其註冊專屬學員檔案
            if (!matched && displayName) {
                const cleanName = displayName.trim();
                const newStudent = {
                    student_id: `stu-line-${userId ? userId.slice(-8) : Date.now()}`,
                    id: `stu-line-${userId ? userId.slice(-8) : Date.now()}`,
                    user_id: userId || `u-${Date.now()}`,
                    name: cleanName,
                    avatar_url: pictureUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(cleanName)}`,
                    line_user_id: userId,
                    default_instrument: '古典鋼琴 (Piano)',
                    default_location: '音符琴房 A303',
                    rate_per_lesson: 1600,
                    is_new_student: true
                };
                this.registerCustomStudent(newStudent);
                matched = newStudent;
            }

            // 6. 保底回退至 劉心悅
            if (!matched) {
                matched = students.find(s => s.name.includes('劉心悅')) || students[0];
            }

            // 永久鎖定該學生的 LINE User ID
            if (matched && userId) {
                matched.line_user_id = userId;
                this.bindStudentLineUserId(matched.name, userId);
                this.bindStudentLineUserId(matched.student_id, userId);
                this.setActiveStudent(matched.student_id);
            }

            return {
                isNewUser: Boolean(matched.is_new_student),
                student: matched,
                user: {
                    id: matched.user_id || matched.student_id,
                    name: matched.name || displayName || '學員',
                    avatar_url: pictureUrl || matched.avatar_url,
                    line_user_id: userId
                }
            };
        },

        // 14. 取得學生剩餘時數
        getRemainingHours(studentId) {
            const key = REMAINING_HOURS_PREFIX + studentId;
            const saved = localStorage.getItem(key);
            if (saved !== null) return Number(saved);
            return 0;
        },

        addRemainingHours(studentId, hours = 1) {
            const current = this.getRemainingHours(studentId);
            const updated = Math.max(0, current + hours);
            localStorage.setItem(REMAINING_HOURS_PREFIX + studentId, updated);
            return updated;
        },

        deductRemainingHours(studentId, hours = 1) {
            const current = this.getRemainingHours(studentId);
            const updated = Math.max(0, current - hours);
            localStorage.setItem(REMAINING_HOURS_PREFIX + studentId, updated);
            return updated;
        }
    };
})();

// 掛載至 window
if (typeof window !== 'undefined') {
    window.MusiMateDB = MusiMateDB;
}
