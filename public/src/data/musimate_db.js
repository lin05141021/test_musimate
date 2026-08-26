/**
 * ========================================================
 * MusiMate 整合式資料庫與 LINE LIFF 智慧身份連線核心
 * 對齊: supabase/schema.sql 與真實業務欄位
 * ========================================================
 */

const MusiMateDB = (() => {
    const STORAGE_KEY = 'musimate_full_database_v1';
    const RECONCILED_KEY = 'musimate_reconciled_ids';
    const REMAINING_HOURS_PREFIX = 'musimate_remaining_hours_';

    // 初始種子資料 (對齊 supabase/schema.sql)
    const seedData = {
        users: [
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
                id: 'u0000000-0000-0000-0000-000000000002',
                role: 'student',
                name: '小明 (Ming)',
                email: 'ming.student@harmony.edu',
                avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
                line_user_id: null
            },
            {
                id: 'u0000000-0000-0000-0000-000000000003',
                role: 'student',
                name: 'Charles (查爾斯)',
                email: 'charles.student@harmony.edu',
                avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                line_user_id: null // 待首次 LINE LIFF 登入時自動比對綁定
            },
            {
                id: 'u0000000-0000-0000-0000-000000000004',
                role: 'student',
                name: 'Johnny (強尼)',
                email: 'johnny.student@harmony.edu',
                avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
                line_user_id: null // 待首次 LINE LIFF 登入時自動比對綁定
            },
            {
                id: 'u0000000-0000-0000-0000-000000000005',
                role: 'student',
                name: 'Lin (林同學)',
                email: 'lin.student@harmony.edu',
                avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
                line_user_id: 'Uf2457bf35e0d6d3060b60838d9a9c91c' // 已綁定
            },
            {
                id: 'u0000000-0000-0000-0000-000000000006',
                role: 'student',
                name: '小華 (Hua)',
                email: 'hua.student@harmony.edu',
                avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
                line_user_id: null
            }
        ],
        teachers: [
            {
                id: 't0000000-0000-0000-0000-000000000001',
                user_id: 'u0000000-0000-0000-0000-000000000001',
                instrument: '鋼琴 (Piano) · 小提琴 (Violin)',
                bio: '國立維也納音樂大學與師大音樂系碩士，主修鋼琴與小提琴。音樂教學資歷 10 年，指導逾 30 位學員錄取國立音樂專班及在鋼琴大賽中屢獲佳績。'
            }
        ],
        students: [
            { id: 's0000000-0000-0000-0000-000000000002', user_id: 'u0000000-0000-0000-0000-000000000002', teacher_id: 't0000000-0000-0000-0000-000000000001', default_instrument: '小提琴 (Violin)', rate_per_lesson: 1200 },
            { id: 's0000000-0000-0000-0000-000000000003', user_id: 'u0000000-0000-0000-0000-000000000003', teacher_id: 't0000000-0000-0000-0000-000000000001', default_instrument: '鋼琴 (Piano)', rate_per_lesson: 2000 }, // Charles
            { id: 's0000000-0000-0000-0000-000000000004', user_id: 'u0000000-0000-0000-0000-000000000004', teacher_id: 't0000000-0000-0000-0000-000000000001', default_instrument: '鋼琴 (Piano)', rate_per_lesson: 2000 }, // Johnny
            { id: 's0000000-0000-0000-0000-000000000005', user_id: 'u0000000-0000-0000-0000-000000000005', teacher_id: 't0000000-0000-0000-0000-000000000001', default_instrument: '鋼琴 (Piano)', rate_per_lesson: 2000 }, // Lin
            { id: 's0000000-0000-0000-0000-000000000006', user_id: 'u0000000-0000-0000-0000-000000000006', teacher_id: 't0000000-0000-0000-0000-000000000001', default_instrument: '鋼琴 (Piano)', rate_per_lesson: 1500 }  // 小華
        ],
        schedule_slots: [
            { id: 's1', start_time: '2026-08-24T10:00:00+08:00', end_time: '2026-08-24T11:00:00+08:00', location: '音符琴房 A301', is_available: true },
            { id: 's2', start_time: '2026-08-25T14:00:00+08:00', end_time: '2026-08-25T15:00:00+08:00', location: '音符琴房 A303', is_available: true },
            { id: 's3', start_time: '2026-08-27T10:00:00+08:00', end_time: '2026-08-27T11:00:00+08:00', location: '音符琴房 A301', is_available: true },
            { id: 's4', start_time: '2026-08-27T14:00:00+08:00', end_time: '2026-08-27T15:00:00+08:00', location: '音符琴房 A303', is_available: true },
            { id: 's5', start_time: '2026-08-28T10:00:00+08:00', end_time: '2026-08-28T11:00:00+08:00', location: '音符琴房 A301', is_available: true },
            { id: 's6', start_time: '2026-08-28T15:00:00+08:00', end_time: '2026-08-28T16:00:00+08:00', location: '音符琴房 A301', is_available: true },
            { id: 's7', start_time: '2026-08-29T19:00:00+08:00', end_time: '2026-08-29T20:00:00+08:00', location: '張老師家中', is_available: true },
            { id: 's8', start_time: '2026-08-30T14:00:00+08:00', end_time: '2026-08-30T15:00:00+08:00', location: '音符琴房 A303', is_available: true }
        ],
        appointments: [
            // Charles: 8/26起 每週一三 19:30-21:30 共10堂 (已預付 paid)
            { id: 'app-c1', student_id: 's0000000-0000-0000-0000-000000000003', student_name: 'Charles (查爾斯)', teacher_id: 't0000000-0000-0000-0000-000000000001', start_time: '2026-08-24T19:30:00+08:00', end_time: '2026-08-24T21:30:00+08:00', location: '音符琴房 A301', status: 'confirmed', instrument: '鋼琴 (Piano)', payment_status: 'paid', payment_type: 'prepaid', memo_notes: '巴哈創意曲 No.8 觸鍵訓練', attendance: 'attended' },
            { id: 'app-c2', student_id: 's0000000-0000-0000-0000-000000000003', student_name: 'Charles (查爾斯)', teacher_id: 't0000000-0000-0000-0000-000000000001', start_time: '2026-08-26T19:30:00+08:00', end_time: '2026-08-26T21:30:00+08:00', location: '音符琴房 A301', status: 'confirmed', instrument: '鋼琴 (Piano)', payment_status: 'paid', payment_type: 'prepaid', memo_notes: '貝多芬奏鳴曲 呈示部練習', attendance: 'pending' },
            { id: 'app-c3', student_id: 's0000000-0000-0000-0000-000000000003', student_name: 'Charles (查爾斯)', teacher_id: 't0000000-0000-0000-0000-000000000001', start_time: '2026-08-31T19:30:00+08:00', end_time: '2026-08-31T21:30:00+08:00', location: '音符琴房 A301', status: 'confirmed', instrument: '鋼琴 (Piano)', payment_status: 'paid', payment_type: 'prepaid', memo_notes: '', attendance: 'pending' },
            
            // Johnny: 每週一 17:00-19:00 與 每週四 19:30-21:30 (單堂後付 pay_per_lesson)
            { id: 'app-j1', student_id: 's0000000-0000-0000-0000-000000000004', student_name: 'Johnny (強尼)', teacher_id: 't0000000-0000-0000-0000-000000000001', start_time: '2026-08-24T17:00:00+08:00', end_time: '2026-08-24T19:00:00+08:00', location: '音符琴房 A302', status: 'confirmed', instrument: '鋼琴 (Piano)', payment_status: 'pay_per_lesson', payment_type: 'postpaid', memo_notes: '哈農練習曲第 1-5 首手腕放鬆', attendance: 'attended' },
            { id: 'app-j2', student_id: 's0000000-0000-0000-0000-000000000004', student_name: 'Johnny (強尼)', teacher_id: 't0000000-0000-0000-0000-000000000001', start_time: '2026-08-27T19:30:00+08:00', end_time: '2026-08-27T21:30:00+08:00', location: '音符琴房 A302', status: 'confirmed', instrument: '鋼琴 (Piano)', payment_status: 'pay_per_lesson', payment_type: 'postpaid', memo_notes: '徹爾尼 599 第 30 條', attendance: 'pending' },
            
            // Lin: 8/25起 每週三六 10:00-12:00 (單堂後付 pay_per_lesson)
            { id: 'app-l1', student_id: 's0000000-0000-0000-0000-000000000005', student_name: 'Lin (林同學)', teacher_id: 't0000000-0000-0000-0000-000000000001', start_time: '2026-08-26T10:00:00+08:00', end_time: '2026-08-26T12:00:00+08:00', location: '音符琴房 A303', status: 'confirmed', instrument: '鋼琴 (Piano)', payment_status: 'pay_per_lesson', payment_type: 'postpaid', memo_notes: '蕭邦夜曲 Op.9 No.2 踏板與裝飾音', attendance: 'pending' },
            { id: 'app-l2', student_id: 's0000000-0000-0000-0000-000000000005', student_name: 'Lin (林同學)', teacher_id: 't0000000-0000-0000-0000-000000000001', start_time: '2026-08-29T10:00:00+08:00', end_time: '2026-08-29T12:00:00+08:00', location: '音符琴房 A303', status: 'confirmed', instrument: '鋼琴 (Piano)', payment_status: 'pay_per_lesson', payment_type: 'postpaid', memo_notes: '', attendance: 'pending' },
            { id: 'app-l3', student_id: 's0000000-0000-0000-0000-000000000005', student_name: 'Lin (林同學)', teacher_id: 't0000000-0000-0000-0000-000000000001', start_time: '2026-09-02T10:00:00+08:00', end_time: '2026-09-02T12:00:00+08:00', location: '音符琴房 A303', status: 'confirmed', instrument: '鋼琴 (Piano)', payment_status: 'pay_per_lesson', payment_type: 'postpaid', memo_notes: '', attendance: 'pending' },
            
            // 小明 (小提琴) 與 小華 (鋼琴)
            { id: 'app-m1', student_id: 's0000000-0000-0000-0000-000000000002', student_name: '小明 (Ming)', teacher_id: 't0000000-0000-0000-0000-000000000001', start_time: '2026-08-25T10:00:00+08:00', end_time: '2026-08-25T11:00:00+08:00', location: '音符琴房 A301', status: 'confirmed', instrument: '小提琴 (Violin)', payment_status: 'paid', payment_type: 'prepaid', memo_notes: '塞茲小提琴協奏曲 第一樂章換把位', attendance: 'attended' },
            { id: 'app-h1', student_id: 's0000000-0000-0000-0000-000000000006', student_name: '小華 (Hua)', teacher_id: 't0000000-0000-0000-0000-000000000001', start_time: '2026-08-26T15:00:00+08:00', end_time: '2026-08-26T16:00:00+08:00', location: '張老師家中', status: 'confirmed', instrument: '鋼琴 (Piano)', payment_status: 'paid', payment_type: 'prepaid', memo_notes: '莫札特小奏鳴曲 K.545', attendance: 'pending' }
        ]
    };

    // 初始化讀取或存檔
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

    return {
        /**
         * 1. LINE LIFF 智慧身份比對與新人自動建檔引擎
         */
        authLiffUser(liffProfile) {
            const db = getDB();
            const { userId, displayName, pictureUrl } = liffProfile;

            // 維度 1：以 line_user_id 查詢 (最優先：已綁定舊生直接登入)
            let user = db.users.find(u => u.line_user_id === userId);
            if (user) {
                const student = db.students.find(s => s.user_id === user.id);
                return { isNewUser: false, user, student, matchType: 'line_user_id' };
            }

            // 維度 2：以姓名比對 (舊生首次登入認領，如 Charles 或 Johnny)
            user = db.users.find(u => 
                u.name.toLowerCase().includes(displayName.toLowerCase()) || 
                displayName.toLowerCase().includes(u.name.toLowerCase())
            );

            if (user) {
                user.line_user_id = userId;
                if (pictureUrl) user.avatar_url = pictureUrl;
                saveDB(db);
                const student = db.students.find(s => s.user_id === user.id);
                return { isNewUser: false, user, student, matchType: 'auto_claimed_name' };
            }

            // 維度 3：完全查無此人 ➔ 自動建立新人！
            const newUserId = 'u-' + Date.now();
            const newStudentId = 's-' + Date.now();
            const newUser = {
                id: newUserId,
                role: 'student',
                name: displayName,
                email: `${newUserId}@liff.musimate.com`,
                avatar_url: pictureUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                line_user_id: userId
            };
            const newStudent = {
                id: newStudentId,
                user_id: newUserId,
                teacher_id: 't0000000-0000-0000-0000-000000000001',
                default_instrument: '鋼琴 (Piano)',
                rate_per_lesson: 2000
            };

            db.users.push(newUser);
            db.students.push(newStudent);
            saveDB(db);

            return { isNewUser: true, user: newUser, student: newStudent, matchType: 'auto_registered_new' };
        },

        // 取得所有學生清單 (供老師端下拉選單動態生成)
        getStudents() {
            const db = getDB();
            return db.students.map(s => {
                const u = db.users.find(user => user.id === s.user_id) || {};
                return {
                    student_id: s.id,
                    user_id: s.user_id,
                    name: u.name || '未知學生',
                    avatar_url: u.avatar_url,
                    line_user_id: u.line_user_id,
                    default_instrument: s.default_instrument || '鋼琴 (Piano)',
                    default_location: '音符琴房 A303',
                    rate_per_lesson: s.rate_per_lesson || 2000
                };
            });
        },

        // 依據 LINE User ID 自動識別學生
        getStudentByLineUserId(lineUserId) {
            if (!lineUserId) return null;
            const students = this.getStudents();
            return students.find(s => s.line_user_id === lineUserId);
        },

        // 綁定學生的 LINE User ID
        bindStudentLineUserId(studentId, lineUserId) {
            const db = getDB();
            const student = db.students.find(s => s.id === studentId);
            if (student) {
                const user = db.users.find(u => u.id === student.user_id);
                if (user) user.line_user_id = lineUserId;
                saveDB(db);
                return true;
            }
            return false;
        },

        // 依據學生 ID 取得預約課表
        getAppointmentsByStudent(studentId) {
            const db = getDB();
            return db.appointments
                .filter(a => a.student_id === studentId || (a.student_name && a.student_name.includes(studentId)))
                .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
        },

        // 取得老師總課表 (所有預約 + 開放時段)
        getTeacherSchedule() {
            const db = getDB();
            return {
                appointments: db.appointments,
                schedule_slots: db.schedule_slots
            };
        },

        // 取得張老師所有開放時段
        getAvailableSlots() {
            const db = getDB();
            return db.schedule_slots.filter(s => s.is_available !== false);
        },

        // 取得學生「已繳費尚未排課」之剩餘時數 (小時制)
        getRemainingHours(studentId) {
            const key = REMAINING_HOURS_PREFIX + studentId;
            const saved = localStorage.getItem(key);
            if (saved !== null) return Number(saved);
            return 0; // 預設 0 小時
        },

        // 增加學生已繳費未排課時數 (例如請假或老師停課時)
        addRemainingHours(studentId, hours = 1) {
            const current = this.getRemainingHours(studentId);
            const updated = Math.max(0, current + hours);
            localStorage.setItem(REMAINING_HOURS_PREFIX + studentId, updated);
            return updated;
        },

        // 扣除學生已繳費未排課時數 (例如加選或補課時折抵)
        deductRemainingHours(studentId, hours = 1) {
            const current = this.getRemainingHours(studentId);
            const updated = Math.max(0, current - hours);
            localStorage.setItem(REMAINING_HOURS_PREFIX + studentId, updated);
            return updated;
        },

        // 新增預約 (支援單堂或自選折抵)
        addAppointment(appt) {
            const db = getDB();
            const newAppt = {
                id: appt.id || `app-${Date.now()}-${Math.floor(Math.random()*1000)}`,
                student_id: appt.student_id,
                student_name: appt.student_name,
                teacher_id: appt.teacher_id || 't0000000-0000-0000-0000-000000000001',
                start_time: appt.start_time,
                end_time: appt.end_time,
                status: appt.status || 'confirmed',
                instrument: appt.instrument || '鋼琴 (Piano)',
                location: appt.location || '音符琴房 A303',
                payment_status: appt.payment_status || 'pay_per_lesson',
                payment_type: appt.payment_type || 'postpaid',
                memo_notes: appt.memo_notes || '',
                attendance: 'pending',
                is_new_badge: true
            };
            db.appointments.push(newAppt);

            // 標記該時段為已佔用
            db.schedule_slots = db.schedule_slots.map(s => {
                if (s.start_time.slice(0, 16) === appt.start_time.slice(0, 16)) {
                    return { ...s, is_available: false };
                }
                return s;
            });

            saveDB(db);
            return newAppt;
        },

        // 週期性批量新增課表 (例如連續排 4 堂、10 堂)
        addRecurringAppointments(baseAppt, repeatCount = 1) {
            const addedList = [];
            const startDate = new Date(baseAppt.start_time);
            const endDate = new Date(baseAppt.end_time);
            const durationMs = endDate.getTime() - startDate.getTime();

            for (let i = 0; i < repeatCount; i++) {
                const currentStart = new Date(startDate.getTime() + i * 7 * 24 * 60 * 60 * 1000);
                const currentEnd = new Date(currentStart.getTime() + durationMs);

                // 格式化為 ISO 帶 +08:00
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
                    is_new_badge: true
                };

                const created = this.addAppointment(apptInstance);
                addedList.push(created);
            }
            return addedList;
        },

        // 新增開放時段 (老師端)
        addOpenSlot(slot) {
            const db = getDB();
            const newSlot = {
                id: slot.id || `slot-${Date.now()}`,
                start_time: slot.start_time,
                end_time: slot.end_time,
                location: slot.location || '音符琴房 A303',
                is_available: true
            };
            db.schedule_slots.push(newSlot);
            saveDB(db);
            return newSlot;
        },

        // 調課 (學生或老師)：新時段佔用，原時段自動釋放回開放池
        rescheduleAppointment(appointmentId, newSlot) {
            const db = getDB();
            const appt = db.appointments.find(a => a.id === appointmentId);
            if (appt) {
                const oldStartTime = appt.start_time;
                const oldEndTime = appt.end_time;
                const oldLocation = appt.location;

                // 1. 更新預約課程之新時間
                appt.start_time = newSlot.start_time;
                appt.end_time = newSlot.end_time;
                appt.location = newSlot.location || appt.location;
                appt.status = 'confirmed';

                // 2. 舊時段釋放為開放時段
                const existingOldSlot = db.schedule_slots.find(s => s.start_time.slice(0, 16) === oldStartTime.slice(0, 16));
                if (existingOldSlot) {
                    existingOldSlot.is_available = true;
                } else {
                    db.schedule_slots.push({
                        id: `slot-rel-${Date.now()}`,
                        start_time: oldStartTime,
                        end_time: oldEndTime,
                        location: oldLocation || '音符琴房 A303',
                        is_available: true
                    });
                }

                // 3. 新時段標記為佔用
                db.schedule_slots = db.schedule_slots.map(s => {
                    if (s.start_time.slice(0, 16) === newSlot.start_time.slice(0, 16)) {
                        return { ...s, is_available: false };
                    }
                    return s;
                });

                saveDB(db);
            }
            return appt;
        },

        // 學生請假 (原時段自動釋放為開放時段，並記錄已繳費未排時數)
        requestLeave(appointmentId) {
            const db = getDB();
            const appt = db.appointments.find(a => a.id === appointmentId);
            if (appt) {
                appt.status = 'rescheduled'; // 標記已請假 (待安排補課)

                // 計算該堂課時數 (小時)
                const start = new Date(appt.start_time);
                const end = new Date(appt.end_time);
                const hours = Math.max(1, Math.round((end - start) / (1000 * 60 * 60)));

                // 增加學生已繳費未排時數
                if (appt.student_id) {
                    this.addRemainingHours(appt.student_id, hours);
                }

                // 將該時段自動釋放回開放時段池 (提供其他人或補課自選)
                const existingSlot = db.schedule_slots.find(s => s.start_time.slice(0, 16) === appt.start_time.slice(0, 16));
                if (existingSlot) {
                    existingSlot.is_available = true;
                } else {
                    db.schedule_slots.push({
                        id: `slot-freed-${Date.now()}`,
                        start_time: appt.start_time,
                        end_time: appt.end_time,
                        location: appt.location || '音符琴房 A303',
                        is_available: true
                    });
                }

                saveDB(db);
            }
            return appt;
        },

        // 老師主動停課 / 老師請假 (自動返還時數並釋放時段)
        cancelByTeacher(appointmentId, reason = '老師臨時有事調課') {
            const db = getDB();
            const appt = db.appointments.find(a => a.id === appointmentId);
            if (appt) {
                appt.status = 'teacher_cancelled';
                appt.memo_notes = `【老師停課備忘】${reason}`;

                const start = new Date(appt.start_time);
                const end = new Date(appt.end_time);
                const hours = Math.max(1, Math.round((end - start) / (1000 * 60 * 60)));

                if (appt.student_id) {
                    this.addRemainingHours(appt.student_id, hours);
                }

                // 釋放時段
                const existingSlot = db.schedule_slots.find(s => s.start_time.slice(0, 16) === appt.start_time.slice(0, 16));
                if (existingSlot) {
                    existingSlot.is_available = true;
                }

                saveDB(db);
            }
            return appt;
        },

        // 標記學生打卡簽到出席
        markAttendance(appointmentId, status = 'attended') {
            const db = getDB();
            const appt = db.appointments.find(a => a.id === appointmentId);
            if (appt) {
                appt.attendance = status;
                saveDB(db);
            }
            return appt;
        },

        // 儲存課堂備忘或聯絡簿摘要
        updateLessonMemo(appointmentId, notes) {
            const db = getDB();
            const appt = db.appointments.find(a => a.id === appointmentId);
            if (appt) {
                appt.memo_notes = notes;
                saveDB(db);
            }
            return appt;
        },

        // 刪除單堂課表排程
        deleteAppointment(appointmentId) {
            const db = getDB();
            db.appointments = db.appointments.filter(a => a.id !== appointmentId);
            saveDB(db);
        },

        // 老師登入驗證
        verifyTeacherLogin(email, password) {
            const db = getDB();
            const teacherUser = db.users.find(u => u.role === 'teacher' && u.email.toLowerCase() === email.toLowerCase());
            if (teacherUser) {
                if (teacherUser.password && teacherUser.password !== password) {
                    return { success: false, message: '密碼輸入不正確，請重新確認。' };
                }
                return { success: true, user: teacherUser, message: '登入成功！正在前往老師課表管理工作台...' };
            }
            // 若為首次註冊或測試老師
            if (email.includes('teacher') || email.includes('chang')) {
                return { success: true, user: db.users[0], message: '登入成功！' };
            }
            return { success: false, message: '查無此老師帳號，請先點擊註冊。' };
        },

        // 建立新老師帳號
        registerTeacherAccount(data) {
            const db = getDB();
            const newId = 'u-' + Date.now();
            const newTeacherUser = {
                id: newId,
                role: 'teacher',
                name: data.name || '音樂導師',
                email: data.email,
                password: data.password || 'teacher123',
                avatar_url: data.avatar_url || '../../UI/teacher_avatar.png',
                line_user_id: null
            };
            db.users.push(newTeacherUser);
            saveDB(db);
            return newTeacherUser;
        },

        // 取得智慧薪資財務統計 (結合已核銷與待確認)
        getFinanceSummary() {
            const reconciledList = JSON.parse(localStorage.getItem(RECONCILED_KEY) || '[]');
            
            // 基礎假資料基準
            let totalReceivable = 86400;
            let paidAmount = 62000;
            let pendingAmount = 8400;
            let unpaidAmount = 16000;

            // 依據已核銷 ID 動態增減
            if (reconciledList.includes('tx-lin')) {
                paidAmount += 2000;
                pendingAmount = Math.max(0, pendingAmount - 2000);
            }
            if (reconciledList.includes('tx-mei')) {
                paidAmount += 1200;
                pendingAmount = Math.max(0, pendingAmount - 1200);
            }
            if (reconciledList.includes('tx-wang-p')) {
                paidAmount += 3000;
                pendingAmount = Math.max(0, pendingAmount - 3000);
            }

            const total = paidAmount + pendingAmount + unpaidAmount;
            const paidPct = Math.round((paidAmount / total) * 100);
            const pendingPct = Math.round((pendingAmount / total) * 100);
            const unpaidPct = 100 - paidPct - pendingPct;

            return {
                totalReceivable: total,
                paidAmount,
                pendingAmount,
                unpaidAmount,
                paidPct,
                pendingPct,
                unpaidPct
            };
        },

        // 依學生計算該月學費貢獻度排行 (供 money_fromstudent.html 渲染)
        getStudentContributionList() {
            const db = getDB();
            const students = this.getStudents();

            // 統計每個學生的已繳堂數與總金額
            const list = students.map(s => {
                const appts = db.appointments.filter(a => a.student_id === s.student_id && a.payment_status === 'paid');
                const lessonCount = Math.max(appts.length, 4); // 基礎展示堂數
                const rate = s.rate_per_lesson || 1200;
                const totalAmount = lessonCount * rate;

                return {
                    student_id: s.student_id,
                    name: s.name,
                    instrument_course: s.default_instrument.includes('鋼琴') ? '週六鋼琴個別課' : '週二小提琴精修課',
                    lesson_count: lessonCount,
                    rate_per_lesson: rate,
                    total_amount: totalAmount,
                    status: 'paid'
                };
            });

            // 依據總貢獻金額由高到低排序
            return list.sort((a, b) => b.total_amount - a.total_amount);
        }
    };
})();

// 掛載至 window
if (typeof window !== 'undefined') {
    window.MusiMateDB = MusiMateDB;
}
