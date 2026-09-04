-- ====================================================================================
-- 【給資料庫管理員的重要更新 Migration】
-- 檔案：supabase/migrations/20260904_add_student_terms_and_attendance.sql
-- 說明：
-- 1. 新增期別主表 (student_terms)：以「期 (Term)」為單位（每期固定10堂課，不可單堂預約），記錄期數、上課區間、調課期限、繳費狀態等。
-- 2. 擴充預約排程表 (appointments)：關聯 term_id、新增課堂序號 (lesson_order 1~10)、細緻出席狀態 (attendance_status) 與違約扣款紀錄。
-- 3. 新增學生違規/曠課紀錄表 (student_infractions)：
--    - 違規條件：開課24小時內才請假 或 未請假未報到。
--    - 計算邏輯：以「第一次曠課日」為起點計算一年週期，一年內重置。
--    - 階梯扣款：第1次扣10%、第2次扣30%、第3次扣50%、第4次以上全額(100%)。
-- ====================================================================================

-- 1. 建立期別主表 (student_terms)
CREATE TABLE IF NOT EXISTS public.student_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    term_number INT NOT NULL,                                     -- 第幾期 (例如: 1, 2, 3...)
    start_date DATE NOT NULL,                                     -- 課程開始日 (例如: 2026-07-01)
    end_date DATE NOT NULL,                                       -- 課程結束日 (例如: 2026-09-20)
    total_lessons INT NOT NULL DEFAULT 10,                        -- 預設一期固定 10 堂課
    completed_lessons INT NOT NULL DEFAULT 0,                     -- 已完成堂數
    pending_reschedule_lessons INT NOT NULL DEFAULT 0,            -- 待補課堂數
    reschedule_deadline DATE,                                     -- 調課/補課期限 (例如: 該期結束後兩週內 2026-10-04)
    total_fee NUMERIC(10, 2) NOT NULL DEFAULT 8000.00,            -- 本期應繳金額 (例如: NT$ 8,000)
    paid_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,                -- 本期已繳金額 (例如: NT$ 8,000)
    payment_status VARCHAR(20) NOT NULL DEFAULT 'unpaid'          -- 繳費狀態: paid(已繳清), unpaid(未繳), partial(部分繳納)
        CHECK (payment_status IN ('paid', 'unpaid', 'partial')),
    payment_method VARCHAR(50) DEFAULT '銀行轉帳',                  -- 繳費方式 (例如: 銀行轉帳, 信用卡, LINE Pay)
    payment_deadline DATE,                                        -- 繳費期限 (例如: 2026-09-20)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_student_term UNIQUE (student_id, term_number)
);

-- 2. 擴充現有預約課表 (appointments) 欄位
DO $$
BEGIN
    -- 關聯至期別表
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='term_id') THEN
        ALTER TABLE public.appointments ADD COLUMN term_id UUID REFERENCES public.student_terms(id) ON DELETE SET NULL;
    END IF;

    -- 本期堂數編號 (第 1 堂 ~ 第 10 堂)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='lesson_order') THEN
        ALTER TABLE public.appointments ADD COLUMN lesson_order INT DEFAULT 1 CHECK (lesson_order BETWEEN 1 AND 10);
    END IF;

    -- 細緻報到與出席狀態:
    -- 'checked_in' (✅ 已報到)
    -- 'leave' (📝 已請假)
    -- 'rescheduled' (🔄 已調課)
    -- 'absent_unexcused' (❌ 未請假未報到)
    -- 'pending' (⏳ 待上課)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='attendance_status') THEN
        ALTER TABLE public.appointments ADD COLUMN attendance_status VARCHAR(30) DEFAULT 'pending'
            CHECK (attendance_status IN ('checked_in', 'leave', 'rescheduled', 'absent_unexcused', 'pending'));
    END IF;

    -- 扣款百分比 (例如: 0.10 代表 10%, 0.30 代表 30%, 1.00 代表全額)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='penalty_rate') THEN
        ALTER TABLE public.appointments ADD COLUMN penalty_rate NUMERIC(5, 2) DEFAULT 0.00;
    END IF;

    -- 扣款金額 (NT$)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='penalty_amount') THEN
        ALTER TABLE public.appointments ADD COLUMN penalty_amount NUMERIC(10, 2) DEFAULT 0.00;
    END IF;

    -- 扣款或出席備註說明 (例如: "今年第 1 次，扣款 10%")
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='attendance_note') THEN
        ALTER TABLE public.appointments ADD COLUMN attendance_note TEXT;
    END IF;
END $$;

-- 3. 建立學生違規 / 曠課扣款紀錄表 (student_infractions)
CREATE TABLE IF NOT EXISTS public.student_infractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
    infraction_type VARCHAR(50) NOT NULL CHECK (infraction_type IN ('late_leave', 'absent_unexcused')), -- late_leave(24hr內才請假), absent_unexcused(未請假未報到)
    infraction_time TIMESTAMPTZ DEFAULT NOW(),
    cycle_start_date DATE NOT NULL,                                -- 該學生此輪週期的第一次曠課日 (一年後重新起算新週期)
    cycle_end_date DATE NOT NULL,                                  -- 週期屆滿日 (cycle_start_date + 1 year)
    count_in_cycle INT NOT NULL,                                   -- 本週期內累計次數 (1, 2, 3, 4...)
    penalty_rate NUMERIC(5, 2) NOT NULL,                          -- 扣款比率: 第1次 0.10 (10%), 第2次 0.30 (30%), 第3次 0.50 (50%), 第4次+ 1.00 (100%)
    penalty_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,           -- 扣款金額
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 索引優化
CREATE INDEX IF NOT EXISTS idx_terms_student ON public.student_terms(student_id, term_number);
CREATE INDEX IF NOT EXISTS idx_appointments_term ON public.appointments(term_id, lesson_order);
CREATE INDEX IF NOT EXISTS idx_infractions_student ON public.student_infractions(student_id, cycle_start_date);

-- 5. Row Level Security (RLS) 權限規則
ALTER TABLE public.student_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_infractions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own terms" ON public.student_terms FOR SELECT
USING (
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()) OR
    teacher_id IN (SELECT id FROM public.teachers WHERE user_id = auth.uid())
);

CREATE POLICY "Students can view their own infractions" ON public.student_infractions FOR SELECT
USING (
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
);
