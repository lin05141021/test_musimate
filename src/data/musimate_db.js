/**
 * ========================================================
 * MusiMate 整合式資料庫與 LINE LIFF 智慧身份連線核心
 * 支援: Supabase PostgreSQL 雲端中央資料庫即時同步
 * 專案 URL: https://iyzhwnvpqohdjqnrvqjq.supabase.co
 * ========================================================
 */

const MusiMateDB = (() => {
    const STORAGE_KEY = 'musimate_supabase_cached_db_v2';
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
                id: 'fd510464-adb3-4006-82c6-c88eb97c8c62',
                role: 'teacher',
                name: 'Charles Lin (查爾斯老師)',
                email: 'chl@gmail.com',
                password: 'teacher123',
                avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                line_user_id: null
            },
            {
                id: 'u0000000-0000-0000-0000-000000000001',
                role: 'teacher',
                name: '張芷嫣 老師 (Teacher Chang)',
                email: 'chang.teacher@harmony.edu',
                password: 'teacher123',
                avatar_url: '../../UI/teacher_avatar.png',
                line_user_id: null
            },
            {
                id: 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',
                role: 'student',
                name: '林小明 (Ming)',
                email: 'ming.student@harmony.edu',
                avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
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
                name: '許雅婷',
                email: 'yating.student@harmony.edu',
                avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
                line_user_id: null
            },
            {
                id: '89bdd196-dd00-4fc0-ab4d-16683f63bd6b-u',
                role: 'student',
                name: '賴冠廷',
                email: 'guanting.student@harmony.edu',
                avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
                line_user_id: null
            },
            {
                id: '8e00b084-4da3-4791-9085-aeafbaa88037-u',
                role: 'student',
                name: '劉冠廷',
                email: 'kt.student@harmony.edu',
                avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                line_user_id: null
            },
            {
                id: 'b83a496f-d728-4b36-bb3e-650bf4347703-u',
                role: 'student',
                name: '王義川',
                email: 'yichuan.student@harmony.edu',
                avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
                line_user_id: null
            }
        ],
        teachers: [
            {
                id: 'df637b26-7cab-443b-8801-4361fb35afdd',
                user_id: 'df637b26-7cab-443b-8801-4361fb35afdd',
                name: '林佩芬',
                instrument: '古典鋼琴 · 流行爵士鋼琴',
                bio: '國立維也納音樂學院碩士，具備 12 年教學資歷，專注於觸鍵音色與音樂詮釋。'
            },
            {
                id: 'fd510464-adb3-4006-82c6-c88eb97c8c62',
                user_id: 'fd510464-adb3-4006-82c6-c88eb97c8c62',
                name: 'Charles Lin',
                instrument: '鋼琴 (Piano)',
                bio: '專業鋼琴演奏與 AI 音樂教學。'
            },
            {
                id: 't0000000-0000-0000-0000-000000000001',
                user_id: 'u0000000-0000-0000-0000-000000000001',
                name: '張芷嫣 老師',
                instrument: '鋼琴 (Piano) · 小提琴 (Violin)',
                bio: '國立維也納音樂大學與師大音樂系碩士，主修鋼琴與小提琴。音樂教學資歷 10 年。'
            }
        ],
        students: [
            { id: 's-lin', user_id: 'u-lin-student', name: '劉心悅 (Lin)', default_instrument: '鋼琴 (Piano)', rate_per_lesson: 2000, default_location: '音符琴房 A303' },
            { id: 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', user_id: 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', name: '林小明', default_instrument: '小提琴 (Violin)', rate_per_lesson: 1200, default_location: '大安琴房 A 室' },
            { id: '26b2f3dd-cc6f-4a97-8cda-6bc43aee3384-s', user_id: '26b2f3dd-cc6f-4a97-8cda-6bc43aee3384-u', name: '許雅婷', default_instrument: '鋼琴 (Piano)', rate_per_lesson: 1600, default_location: '大安琴房 A 室' },
            { id: '89bdd196-dd00-4fc0-ab4d-16683f63bd6b-s', user_id: '89bdd196-dd00-4fc0-ab4d-16683f63bd6b-u', name: '賴冠廷', default_instrument: '鋼琴 (Piano)', rate_per_lesson: 1600, default_location: '大安琴房 A 室' },
            { id: '8e00b084-4da3-4791-9085-aeafbaa88037-s', user_id: '8e00b084-4da3-4791-9085-aeafbaa88037-u', name: '劉冠廷', default_instrument: '鋼琴 (Piano)', rate_per_lesson: 1600, default_location: '大安琴房 A 室' },
            { id: 'b83a496f-d728-4b36-bb3e-650bf4347703-s', user_id: 'b83a496f-d728-4b36-bb3e-650bf4347703-u', name: '王義川', default_instrument: '鋼琴 (Piano)', rate_per_lesson: 1200, default_location: '大安琴房 A 室' }
        ],
        schedule_slots: [
            { id: 's1', start_time: '2026-08-24T10:00:00+08:00', end_time: '2026-08-24T11:00:00+08:00', location: '音符琴房 A301', is_available: true },
            { id: 's2', start_time: '2026-08-25T14:00:00+08:00', end_time: '2026-08-25T15:00:00+08:00', location: '音符琴房 A303', is_available: true },
            { id: 's3', start_time: '2026-08-27T10:00:00+08:00', end_time: '2026-08-27T11:00:00+08:00', location: '音符琴房 A301', is_available: true },
            { id: 's4', start_time: '2026-08-27T14:00:00+08:00', end_time: '2026-08-27T15:00:00+08:00', location: '音符琴房 A303', is_available: true },
            { id: 's5', start_time: '2026-08-28T10:00:00+08:00', end_time: '2026-08-28T11:00:00+08:00', location: '音符琴房 A301', is_available: true }
        ],
        appointments: [
            { id: 'app-yating', student_id: '26b2f3dd-cc6f-4a97-8cda-6bc43aee3384-s', student_name: '許雅婷', teacher_id: 'df637b26-7cab-443b-8801-4361fb35afdd', start_time: '2026-08-24T10:00:00+08:00', end_time: '2026-08-24T11:00:00+08:00', location: '大安琴房 A 室', status: 'confirmed', instrument: '鋼琴 (Piano)', payment_status: 'paid', payment_type: 'prepaid', memo_notes: '哈農練習曲與莫札特奏鳴曲' },
            { id: 'app-ming', student_id: 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', student_name: '林小明', teacher_id: 'df637b26-7cab-443b-8801-4361fb35afdd', start_time: '2026-08-25T14:00:00+08:00', end_time: '2026-08-25T15:00:00+08:00', location: '大安琴房 A 室', status: 'confirmed', instrument: '小提琴 (Violin)', payment_status: 'paid', payment_type: 'prepaid', memo_notes: '塞茲小提琴協奏曲 第一樂章' },
            { id: 'app-lin', student_id: 's-lin', student_name: '劉心悅 (Lin)', teacher_id: 'df637b26-7cab-443b-8801-4361fb35afdd', start_time: '2026-08-26T10:00:00+08:00', end_time: '2026-08-26T12:00:00+08:00', location: '音符琴房 A303', status: 'confirmed', instrument: '鋼琴 (Piano)', payment_status: 'pay_per_lesson', payment_type: 'postpaid', memo_notes: '蕭邦夜曲 Op.9 No.2 踏板與裝飾音' },
            { id: 'app-guanting', student_id: '89bdd196-dd00-4fc0-ab4d-16683f63bd6b-s', student_name: '賴冠廷', teacher_id: 'df637b26-7cab-443b-8801-4361fb35afdd', start_time: '2026-08-26T14:00:00+08:00', end_time: '2026-08-26T15:00:00+08:00', location: '大安琴房 A 室', status: 'confirmed', instrument: '鋼琴 (Piano)', payment_status: 'paid', payment_type: 'prepaid', memo_notes: '徹爾尼 599' },
            { id: 'app-kt', student_id: '8e00b084-4da3-4791-9085-aeafbaa88037-s', student_name: '劉冠廷', teacher_id: 'df637b26-7cab-443b-8801-4361fb35afdd', start_time: '2026-08-28T19:00:00+08:00', end_time: '2026-08-28T20:00:00+08:00', location: '大安琴房 A 室', status: 'confirmed', instrument: '鋼琴 (Piano)', payment_status: 'pay_per_lesson', payment_type: 'postpaid', memo_notes: '流行鋼琴伴奏' },
            { id: 'app-yichuan', student_id: 'b83a496f-d728-4b36-bb3e-650bf4347703-s', student_name: '王義川', teacher_id: 'df637b26-7cab-443b-8801-4361fb35afdd', start_time: '2026-08-30T10:00:00+08:00', end_time: '2026-08-30T11:00:00+08:00', location: '大安琴房 A 室', status: 'confirmed', instrument: '鋼琴 (Piano)', payment_status: 'paid', payment_type: 'prepaid', memo_notes: '巴哈創意曲' }
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

        // 1. 取得所有學員清單 (優先整合同學 Supabase 100 位學生 + 本地名冊)
        getStudents() {
            const db = getDB();
            const list = [];
            const seen = new Set();
            const globalTestLineId = localStorage.getItem('custom_test_line_user_id');

            // 1) 優先載入 Supabase 100 位學生
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
                            line_user_id: customLineId || (isLin ? (globalTestLineId || 'Uf2457bf35e0d6d3060b60838d9a9c91c') : (isMing ? 'U_student_ming_001' : null)),
                            default_instrument: s.instrument ? `${s.instrument} (Piano)` : '鋼琴 (Piano)',
                            default_location: '音符琴房 A303',
                            rate_per_lesson: 2000
                        });
                    }
                });
            }

            // 2) 補入本地種子學生
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
                        line_user_id: customLineId || (isLin ? (globalTestLineId || 'Uf2457bf35e0d6d3060b60838d9a9c91c') : (isMing ? (globalTestLineId || 'U_student_ming_001') : null)),
                        default_instrument: s.default_instrument || '鋼琴 (Piano)',
                        default_location: s.default_location || '音符琴房 A303',
                        rate_per_lesson: s.rate_per_lesson || 1600
                    });
                }
            });

            return list;
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
            return db.appointments
                .filter(a => 
                    a.student_id === studentIdentifier || 
                    a.student_name === studentIdentifier || 
                    (a.student_name && a.student_name.includes(studentIdentifier))
                )
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
            localStorage.setItem('custom_test_line_user_id', lineUserId);
            console.log(`🔗 已將 LINE ID: ${lineUserId} 成功綁定至學員: ${studentNameOrId}`);
        },

        // 13. LINE LIFF 自動身份辨識
        authLiffUser(liffProfile) {
            const { userId, displayName, pictureUrl } = liffProfile;
            const students = this.getStudents();

            // 1. 優先找已綁定此 userId 的學生
            let matched = students.find(s => s.line_user_id === userId);

            // 2. 若無，比對名稱
            if (!matched && displayName) {
                matched = students.find(s => s.name && (
                    s.name.toLowerCase().includes(displayName.toLowerCase()) ||
                    displayName.toLowerCase().includes(s.name.toLowerCase())
                ));
            }

            // 3. 若仍無，預設綁定至全組統一 Demo 學員：劉心悅 (Lin)
            if (!matched) {
                matched = students.find(s => s.name.includes('劉心悅') || s.name.includes('Lin')) || students.find(s => s.name === '林小明') || students[0];
            }

            // 自動記錄綁定
            if (matched && userId) {
                this.bindStudentLineUserId(matched.name, userId);
                this.bindStudentLineUserId(matched.student_id, userId);
            }

            return {
                isNewUser: false,
                student: matched,
                user: {
                    id: matched.user_id || matched.student_id,
                    name: (matched.name && matched.name.includes('劉心悅')) ? '劉心悅 (Lin)' : (matched.name || displayName || '劉心悅 (Lin)'),
                    avatar_url: pictureUrl || matched.avatar_url,
                    line_user_id: userId
                }
            };
        },

        // 13. 取得學生剩餘時數
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
