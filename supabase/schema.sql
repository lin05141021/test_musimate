-- ========================================================
-- 音樂教室 AI 小幫手 - Supabase PostgreSQL Schema DDL
-- ========================================================

-- 啟用 UUID 擴充套件
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. 用戶主表 (users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role VARCHAR(20) NOT NULL CHECK (role IN ('teacher', 'student')),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    line_user_id VARCHAR(100) UNIQUE, -- [新增欄位] LINE User ID (供 LINE LIFF / Bot 自動辨識綁定，首次登入由 LIFF 補上)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 老師詳細資料表 (teachers)
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    instrument VARCHAR(100) NOT NULL,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_teacher_user UNIQUE (user_id)
);

-- 3. 學生詳細資料表 (students)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_student_user UNIQUE (user_id)
);

-- 4. 老師開放時間段 (schedule_slots)
CREATE TABLE IF NOT EXISTS public.schedule_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    location VARCHAR(200) DEFAULT '音符琴房 A303', -- [新增欄位] 開放時段上課地點/琴房
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_slot_time CHECK (end_time > start_time)
);

-- 5. 課程預約紀錄 (appointments)
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'rescheduled')),
    instrument VARCHAR(100) DEFAULT '鋼琴 (Piano)', -- [新增欄位] 上課科目/樂器 (例如: 鋼琴 Piano)
    location VARCHAR(200) DEFAULT '音符琴房 A303',   -- [新增欄位] 上課地點/琴房 (例如: 音符琴房 A303, 張老師家中)
    payment_status VARCHAR(30) DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'unpaid', 'pay_per_lesson')), -- [新增欄位] 繳費狀態: paid(已繳費) / unpaid(未繳費) / pay_per_lesson(每堂完成後才繳費)
    payment_type VARCHAR(20) DEFAULT 'prepaid' CHECK (payment_type IN ('prepaid', 'postpaid')), -- [新增欄位] 繳費模式: prepaid(包堂預付) / postpaid(單堂後付)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_appointment_time CHECK (end_time > start_time)
);

-- 6. 調課申請紀錄 (reschedule_requests)
CREATE TABLE IF NOT EXISTS public.reschedule_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    requested_slot_id UUID NOT NULL REFERENCES public.schedule_slots(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. 課堂錄音與 AI 摘要紀錄 (lesson_records)
CREATE TABLE IF NOT EXISTS public.lesson_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    audio_url TEXT,
    raw_transcript TEXT NOT NULL,
    clean_summary_json JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. 老師範例影片庫 (teacher_demo_videos)
CREATE TABLE IF NOT EXISTS public.teacher_demo_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    video_url TEXT NOT NULL,
    midi_data JSONB,
    tags TEXT[] DEFAULT '{}',
    pitch_tolerance INT DEFAULT 5, -- 容錯率
    tempo_tolerance INT DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. 學生練習影片與 AI 反饋 (student_practice_videos)
CREATE TABLE IF NOT EXISTS public.student_practice_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    demo_video_id UUID REFERENCES public.teacher_demo_videos(id) ON DELETE SET NULL,
    video_url TEXT NOT NULL,
    ai_feedback_json JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- 建立資料庫索引 (Indexes for Optimization)
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_slots_teacher_time ON public.schedule_slots(teacher_id, start_time, is_available);
CREATE INDEX IF NOT EXISTS idx_appointments_teacher_time ON public.appointments(teacher_id, start_time, end_time, status);
CREATE INDEX IF NOT EXISTS idx_appointments_student ON public.appointments(student_id);

-- ========================================================
-- Row Level Security (RLS) 安全存取策略
-- ========================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reschedule_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_demo_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_practice_videos ENABLE ROW LEVEL SECURITY;

-- 策略：通用公開讀取用戶與老師資料
CREATE POLICY "Public profiles are viewable by everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Teacher bios are viewable by everyone" ON public.teachers FOR SELECT USING (true);
CREATE POLICY "Students can view student records" ON public.students FOR SELECT USING (true);

-- 策略： schedule_slots 僅允許顯示開放之空檔給所有人，隱藏已被私下預約的隱私
CREATE POLICY "Available slots are viewable by logged in users" 
ON public.schedule_slots FOR SELECT 
USING (is_available = true);

CREATE POLICY "Teachers can manage their own slots" 
ON public.schedule_slots FOR ALL 
USING (auth.uid() IN (SELECT user_id FROM public.teachers WHERE id = teacher_id));

-- 策略： appointments 僅限本人 (學生或老師) 檢視與變更，嚴格隱藏其他學生隱私
CREATE POLICY "Users can view their own appointments" 
ON public.appointments FOR SELECT 
USING (
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()) OR
    teacher_id IN (SELECT id FROM public.teachers WHERE user_id = auth.uid())
);

-- 策略： reschedule_requests 僅限申請人與授課老師管理
CREATE POLICY "Users can view related reschedule requests" 
ON public.reschedule_requests FOR SELECT 
USING (
    appointment_id IN (
        SELECT id FROM public.appointments 
        WHERE student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
           OR teacher_id IN (SELECT id FROM public.teachers WHERE user_id = auth.uid())
    )
);

-- 策略： lesson_records 僅限課程參與者讀取
CREATE POLICY "Lesson records viewable by participants" 
ON public.lesson_records FOR SELECT 
USING (
    appointment_id IN (
        SELECT id FROM public.appointments 
        WHERE student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
           OR teacher_id IN (SELECT id FROM public.teachers WHERE user_id = auth.uid())
    )
);

-- 策略： Demo 影片庫讀取
CREATE POLICY "Demo videos viewable by student and teacher" 
ON public.teacher_demo_videos FOR SELECT USING (true);

-- 策略： 練習影片讀取與寫入
CREATE POLICY "Practice videos viewable by student and teacher" 
ON public.student_practice_videos FOR SELECT 
USING (
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()) OR
    student_id IN (SELECT s.id FROM public.students s JOIN public.teachers t ON s.teacher_id = t.id WHERE t.user_id = auth.uid())
);

-- ========================================================
-- 預設 Seed Data (展示專用數據)
-- ========================================================

-- 1. Users (含張老師、小明、Charles、Johnny、Lin)
INSERT INTO public.users (id, role, name, email, avatar_url, line_user_id) VALUES
('u0000000-0000-0000-0000-000000000001', 'teacher', '張老師 (Teacher Chang)', 'chang.teacher@harmony.edu', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', NULL),
('u0000000-0000-0000-0000-000000000002', 'student', '小明 (Ming)', 'ming.student@harmony.edu', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80', NULL),
('u0000000-0000-0000-0000-000000000003', 'student', 'Charles', 'charles.student@harmony.edu', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', NULL), -- line_user_id 留空，待 LIFF 登入自動補上
('u0000000-0000-0000-0000-000000000004', 'student', 'Johnny', 'johnny.student@harmony.edu', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', NULL), -- line_user_id 留空，待 LIFF 登入自動補上
('u0000000-0000-0000-0000-000000000005', 'student', 'Lin', 'lin.student@harmony.edu', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', 'Uf2457bf35e0d6d3060b60838d9a9c91c') -- 已透過 LINE LIFF 成功綁定
ON CONFLICT (id) DO NOTHING;

-- 2. Teacher & Student Relationships
INSERT INTO public.teachers (id, user_id, instrument, bio) VALUES
('t0000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000001', '小提琴 (Violin) & 鋼琴 (Piano)', '國立音樂學院碩士，10年專業小提琴與古典鋼琴教學經驗。')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.students (id, user_id, teacher_id) VALUES
('s0000000-0000-0000-0000-000000000002', 'u0000000-0000-0000-0000-000000000002', 't0000000-0000-0000-0000-000000000001'),
('s0000000-0000-0000-0000-000000000003', 'u0000000-0000-0000-0000-000000000003', 't0000000-0000-0000-0000-000000000001'), -- Charles
('s0000000-0000-0000-0000-000000000004', 'u0000000-0000-0000-0000-000000000004', 't0000000-0000-0000-0000-000000000001'), -- Johnny
('s0000000-0000-0000-0000-000000000005', 'u0000000-0000-0000-0000-000000000005', 't0000000-0000-0000-0000-000000000001')  -- Lin
ON CONFLICT (id) DO NOTHING;

-- 3. Initial Demo Video
INSERT INTO public.teacher_demo_videos (id, teacher_id, title, video_url, midi_data, tags, pitch_tolerance, tempo_tolerance) VALUES
('v0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000001', '巴哈：E大調小提琴協奏曲 第一樂章範例', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', '{"bpm": 96, "key": "E Major"}', ARRAY['小提琴', '巴哈', '弓法練習'], 5, 8)
ON CONFLICT (id) DO NOTHING;

-- 4. 學生課程預約資料 (Charles: 明天起每週一三 19:30-21:30 共10堂，已繳費 paid)
INSERT INTO public.appointments (student_id, teacher_id, start_time, end_time, status, instrument, payment_status, payment_type) VALUES
('s0000000-0000-0000-0000-000000000003', 't0000000-0000-0000-0000-000000000001', '2026-08-26 19:30:00+08', '2026-08-26 21:30:00+08', 'confirmed', '鋼琴 (Piano)', 'paid', 'prepaid'),
('s0000000-0000-0000-0000-000000000003', 't0000000-0000-0000-0000-000000000001', '2026-08-31 19:30:00+08', '2026-08-31 21:30:00+08', 'confirmed', '鋼琴 (Piano)', 'paid', 'prepaid'),
('s0000000-0000-0000-0000-000000000003', 't0000000-0000-0000-0000-000000000001', '2026-09-02 19:30:00+08', '2026-09-02 21:30:00+08', 'confirmed', '鋼琴 (Piano)', 'paid', 'prepaid'),
('s0000000-0000-0000-0000-000000000003', 't0000000-0000-0000-0000-000000000001', '2026-09-07 19:30:00+08', '2026-09-07 21:30:00+08', 'confirmed', '鋼琴 (Piano)', 'paid', 'prepaid'),
('s0000000-0000-0000-0000-000000000003', 't0000000-0000-0000-0000-000000000001', '2026-09-09 19:30:00+08', '2026-09-09 21:30:00+08', 'confirmed', '鋼琴 (Piano)', 'paid', 'prepaid'),
('s0000000-0000-0000-0000-000000000003', 't0000000-0000-0000-0000-000000000001', '2026-09-14 19:30:00+08', '2026-09-14 21:30:00+08', 'confirmed', '鋼琴 (Piano)', 'paid', 'prepaid'),
('s0000000-0000-0000-0000-000000000003', 't0000000-0000-0000-0000-000000000001', '2026-09-16 19:30:00+08', '2026-09-16 21:30:00+08', 'confirmed', '鋼琴 (Piano)', 'paid', 'prepaid'),
('s0000000-0000-0000-0000-000000000003', 't0000000-0000-0000-0000-000000000001', '2026-09-21 19:30:00+08', '2026-09-21 21:30:00+08', 'confirmed', '鋼琴 (Piano)', 'paid', 'prepaid'),
('s0000000-0000-0000-0000-000000000003', 't0000000-0000-0000-0000-000000000001', '2026-09-23 19:30:00+08', '2026-09-23 21:30:00+08', 'confirmed', '鋼琴 (Piano)', 'paid', 'prepaid'),
('s0000000-0000-0000-0000-000000000003', 't0000000-0000-0000-0000-000000000001', '2026-09-28 19:30:00+08', '2026-09-28 21:30:00+08', 'confirmed', '鋼琴 (Piano)', 'paid', 'prepaid');

-- 5. 學生課程預約資料 (Johnny: 2026-08-24起至年底，每週一 17:00-19:00 與 每週四 19:30-21:30，完課後繳費 pay_per_lesson)
INSERT INTO public.appointments (student_id, teacher_id, start_time, end_time, status, instrument, payment_status, payment_type)
SELECT 
    's0000000-0000-0000-0000-000000000004'::UUID,
    't0000000-0000-0000-0000-000000000001'::UUID,
    (d + interval '17 hours')::TIMESTAMPTZ,
    (d + interval '19 hours')::TIMESTAMPTZ,
    'confirmed',
    '鋼琴 (Piano)',
    'pay_per_lesson',
    'postpaid'
FROM generate_series('2026-08-24'::date, '2026-12-31'::date, '1 day'::interval) d
WHERE EXTRACT(DOW FROM d) = 1 -- 週一 (Monday)
UNION ALL
SELECT 
    's0000000-0000-0000-0000-000000000004'::UUID,
    't0000000-0000-0000-0000-000000000001'::UUID,
    (d + interval '19 hours 30 minutes')::TIMESTAMPTZ,
    (d + interval '21 hours 30 minutes')::TIMESTAMPTZ,
    'confirmed',
    '鋼琴 (Piano)',
    'pay_per_lesson',
    'postpaid'
FROM generate_series('2026-08-24'::date, '2026-12-31'::date, '1 day'::interval) d
WHERE EXTRACT(DOW FROM d) = 4; -- 週四 (Thursday)

-- 6. 學生課程預約資料 (Lin: 今天 2026-08-25 起每週三、六 10:00-12:00 共 10 堂，每次課後現金繳費 pay_per_lesson)
INSERT INTO public.appointments (student_id, teacher_id, start_time, end_time, status, instrument, payment_status, payment_type) VALUES
('s0000000-0000-0000-0000-000000000005', 't0000000-0000-0000-0000-000000000001', '2026-08-26 10:00:00+08', '2026-08-26 12:00:00+08', 'confirmed', '鋼琴 (Piano)', 'pay_per_lesson', 'postpaid'),
('s0000000-0000-0000-0000-000000000005', 't0000000-0000-0000-0000-000000000001', '2026-08-29 10:00:00+08', '2026-08-29 12:00:00+08', 'confirmed', '鋼琴 (Piano)', 'pay_per_lesson', 'postpaid'),
('s0000000-0000-0000-0000-000000000005', 't0000000-0000-0000-0000-000000000001', '2026-09-02 10:00:00+08', '2026-09-02 12:00:00+08', 'confirmed', '鋼琴 (Piano)', 'pay_per_lesson', 'postpaid'),
('s0000000-0000-0000-0000-000000000005', 't0000000-0000-0000-0000-000000000001', '2026-09-05 10:00:00+08', '2026-09-05 12:00:00+08', 'confirmed', '鋼琴 (Piano)', 'pay_per_lesson', 'postpaid'),
('s0000000-0000-0000-0000-000000000005', 't0000000-0000-0000-0000-000000000001', '2026-09-09 10:00:00+08', '2026-09-09 12:00:00+08', 'confirmed', '鋼琴 (Piano)', 'pay_per_lesson', 'postpaid'),
('s0000000-0000-0000-0000-000000000005', 't0000000-0000-0000-0000-000000000001', '2026-09-12 10:00:00+08', '2026-09-12 12:00:00+08', 'confirmed', '鋼琴 (Piano)', 'pay_per_lesson', 'postpaid'),
('s0000000-0000-0000-0000-000000000005', 't0000000-0000-0000-0000-000000000001', '2026-09-16 10:00:00+08', '2026-09-16 12:00:00+08', 'confirmed', '鋼琴 (Piano)', 'pay_per_lesson', 'postpaid'),
('s0000000-0000-0000-0000-000000000005', 't0000000-0000-0000-0000-000000000001', '2026-09-19 10:00:00+08', '2026-09-19 12:00:00+08', 'confirmed', '鋼琴 (Piano)', 'pay_per_lesson', 'postpaid'),
('s0000000-0000-0000-0000-000000000005', 't0000000-0000-0000-0000-000000000001', '2026-09-23 10:00:00+08', '2026-09-23 12:00:00+08', 'confirmed', '鋼琴 (Piano)', 'pay_per_lesson', 'postpaid'),
('s0000000-0000-0000-0000-000000000005', 't0000000-0000-0000-0000-000000000001', '2026-09-26 10:00:00+08', '2026-09-26 12:00:00+08', 'confirmed', '鋼琴 (Piano)', 'pay_per_lesson', 'postpaid');

-- ====================================================================================
-- 【特別標示：給管理資料庫的同學】期別概念 (student_terms) 與 曠課扣款紀錄 (student_infractions)
-- ====================================================================================

-- 10. 期別主表 (student_terms)：一期固定 10 堂課，不可單堂預約 (試上除外)
CREATE TABLE IF NOT EXISTS public.student_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    term_number INT NOT NULL,                                     -- 第幾期 (例如: 1, 2, 3...)
    start_date DATE NOT NULL,                                     -- 課程開始日
    end_date DATE NOT NULL,                                       -- 課程結束日
    total_lessons INT NOT NULL DEFAULT 10,                        -- 預設一期固定 10 堂課
    completed_lessons INT NOT NULL DEFAULT 0,                     -- 已完成堂數
    pending_reschedule_lessons INT NOT NULL DEFAULT 0,            -- 待補課堂數
    reschedule_deadline DATE,                                     -- 調課/補課期限 (例如: 該期結束後兩週內)
    total_fee NUMERIC(10, 2) NOT NULL DEFAULT 8000.00,            -- 本期應繳金額 (NT$ 8,000)
    paid_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,                -- 本期已繳金額 (NT$ 8,000)
    payment_status VARCHAR(20) NOT NULL DEFAULT 'unpaid'          -- paid(已繳清), unpaid(未繳), partial(部分繳納)
        CHECK (payment_status IN ('paid', 'unpaid', 'partial')),
    payment_method VARCHAR(50) DEFAULT '銀行轉帳',                  -- 繳費方式 (銀行轉帳, 信用卡, LINE Pay 等)
    payment_deadline DATE,                                        -- 繳費期限
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_student_term UNIQUE (student_id, term_number)
);

-- 11. 曠課與違約扣款紀錄表 (student_infractions)
-- 規則：開課24小時內才請假或是未請假未報到算曠課。一年內第一次扣款10%、第二次30%、第三次50%、第四次以上全額。一年內從第一次曠課起算。
CREATE TABLE IF NOT EXISTS public.student_infractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
    infraction_type VARCHAR(50) NOT NULL CHECK (infraction_type IN ('late_leave', 'absent_unexcused')),
    infraction_time TIMESTAMPTZ DEFAULT NOW(),
    cycle_start_date DATE NOT NULL,                                -- 此週期之第一次曠課日期
    cycle_end_date DATE NOT NULL,                                  -- 週期滿一年日期 (滿一年自動重置)
    count_in_cycle INT NOT NULL,                                   -- 週期內第幾次違規 (1, 2, 3, 4+)
    penalty_rate NUMERIC(5, 2) NOT NULL,                          -- 扣款比率 (0.10, 0.30, 0.50, 1.00)
    penalty_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,           -- 扣款金額
    note TEXT,                                                     -- 備註說明
    created_at TIMESTAMPTZ DEFAULT NOW()
);

