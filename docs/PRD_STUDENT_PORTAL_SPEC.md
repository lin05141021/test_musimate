# MusiMate 學生端完整規格與 PRD 功能核對矩陣 (Student Portal Spec)

- **文檔版本**：v2.0.0 (Production Candidate)
- **分支對應**：`student-portal`
- **適用角色**：學生端 (Student Web App) & LINE 官方帳號入口
- **最新 Commit**：`f48169c`

---

## 📑 目錄
1. [功能驗收與 PRD 總體對照矩陣](#1-功能驗收與-prd-總體對照矩陣)
2. [八大核心功能頁面規格明細](#2-八大核心功能頁面規格明細)
3. [核心商業邏輯與演算法規範](#3-核心商業邏輯與演算法規範)
4. [全站 UI/UX 設計系統與視覺規範](#4-全站-uiux-設計系統與視覺規範)
5. [LINE 官方帳號 Rich Menu (雙分頁 12 鍵) 規格](#5-line-官方帳號-rich-menu-雙分頁-12-鍵-規格)
6. [後端 API 與資料庫架構 (Supabase)](#6-後端-api-與資料庫架構-supabase)

---

## 1. 功能驗收與 PRD 總體對照矩陣

| 編號 | 功能模組名稱 | PRD 需求核心要點 | 對應程式碼 / 檔案路徑 | 路由 (Route) | 驗收狀態 |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **01** | **我的課表** | 10堂課卡片、已過課程預設收合、課前報到、預約下期彈窗防衝堂 | [`src/app/student/schedule/page.tsx`](file:///c:/Users/linda_lin/Downloads/music-classroom-ai-assistant-main/src/app/student/schedule/page.tsx) | `/student/schedule` | ✅ 已完成 |
| **02** | **自主練習打卡** | 15秒練琴錄音打卡、AI 音高校準分析、動態蓋章動畫、回饋提示 | [`src/app/student/practice/page.tsx`](file:///c:/Users/linda_lin/Downloads/music-classroom-ai-assistant-main/src/app/student/practice/page.tsx) | `/student/practice` | ✅ 已完成 |
| **03** | **智慧語音聯絡簿** | 30秒 AI 語音週報、課堂教學精華摘要、課後練琴指引與目標 | [`src/app/student/summary/[id]/page.tsx`](file:///c:/Users/linda_lin/Downloads/music-classroom-ai-assistant-main/src/app/student/summary/[id]/page.tsx) | `/student/summary/lesson-1` | ✅ 已完成 |
| **04** | **請假與調課申請** | 預設最近課程，但支援點擊挑選「當期已繳費未上課程」、事由填寫 | [`src/app/student/schedule/page.tsx?action=reschedule`](file:///c:/Users/linda_lin/Downloads/music-classroom-ai-assistant-main/src/app/student/schedule/page.tsx) | `/student/schedule?action=reschedule` | ✅ 已完成 |
| **05** | **成就徽章牆** | 出席蓋章記錄、自主練琴成就徽章展示、榮譽里程碑 | [`src/app/student/stamps/page.tsx`](file:///c:/Users/linda_lin/Downloads/music-classroom-ai-assistant-main/src/app/student/stamps/page.tsx) | `/student/stamps` | ✅ 已完成 |
| **06** | **繳費證明上傳** | 富邦網銀轉帳截圖示範、AI 智能對帳核銷、手動編輯金額升起數字鍵盤 | [`src/app/student/billing/page.tsx`](file:///c:/Users/linda_lin/Downloads/music-classroom-ai-assistant-main/src/app/student/billing/page.tsx) | `/student/billing` | ✅ 已完成 |
| **07** | **課程與繳費紀錄** | 歷史課程與繳費單垂直滑動清單 (Vertical Scroll)、金額收據 | [`src/app/student/history/page.tsx`](file:///c:/Users/linda_lin/Downloads/music-classroom-ai-assistant-main/src/app/student/history/page.tsx) | `/student/history` | ✅ 已完成 |
| **08** | **常見問題 FAQ** | 上下滑動垂直手風琴折疊、退費政策、24h請假曠課扣款計算說明 | [`src/app/student/faq/page.tsx`](file:///c:/Users/linda_lin/Downloads/music-classroom-ai-assistant-main/src/app/student/faq/page.tsx) | `/student/faq` | ✅ 已完成 |
| **09** | **開始新課程** | 樂器類別（鋼琴/小提琴）、師資卡片簡介、預約體驗試上時段 | [`src/app/student/courses/page.tsx`](file:///c:/Users/linda_lin/Downloads/music-classroom-ai-assistant-main/src/app/student/courses/page.tsx) | `/student/courses` | ✅ 已完成 |
| **10** | **底部導航 TabBar** | 實心彩虹漸層圖標、旋轉 90 度水彩底圖微調防深紫、高對比白底襯 | [`src/components/StudentTabBar.tsx`](file:///c:/Users/linda_lin/Downloads/music-classroom-ai-assistant-main/src/components/StudentTabBar.tsx) | 全域共用組件 | ✅ 已完成 |
| **11** | **全域操作反饋** | 無跳轉操作時提供毛玻璃高斯模糊 Toast 提示與彩虹 Checkmark | [`src/context/ToastContext.tsx`](file:///c:/Users/linda_lin/Downloads/music-classroom-ai-assistant-main/src/context/ToastContext.tsx) | 全域 Context | ✅ 已完成 |
| **12** | **LINE 圖文選單** | 雙分頁（分頁一 5 鍵 + 分頁二 5 鍵 + 2 鍵切換頁籤），零延遲別名切換 | [`src/app/student/line_liff/button/`](file:///c:/Users/linda_lin/Downloads/music-classroom-ai-assistant-main/src/app/student/line_liff/button/) | LINE Rich Menu | ✅ 已完成 |

---

## 2. 八大核心功能頁面規格明細

### 2.1 我的課表 (`/student/schedule`)
- **檔案**：`src/app/student/schedule/page.tsx`
- **關鍵 PRD 行為**：
  1. **當期 10 堂課卡片呈現**：依據期別概念完整呈現第 1 至第 10 堂課進度、堂數徽章、日期與授課老師。
  2. **已過課程預設收合**：過去歷史課程（狀態為已完成/已出席）預設摺疊，點擊可展開檢視，減輕首頁視覺負擔。
  3. **課前報到按鈕**：最近即將到來（< 60分鐘）的課程顯示專屬「課前報到」金黃色高亮按鈕，點擊後觸發 `Toast` 提示「報到成功！已完成課前報到」並更新狀態。
  4. **預約下一期課程彈窗**：
     - 不允許單獨預約單堂（試上除外），必須以一期（10 堂課）為單位。
     - 點擊底部按鈕喚起「預約下一期課程」三步驟視窗：
       1. 選擇同一位指導老師（張芷嫣 老師）與固定上課時段。
       2. 自動進行連續 10 堂課「時段衝堂檢查」。
       3. 確認送出並由 `Toast` 提示「課程預約已送出」。

### 2.2 請假與調課彈窗 (`/student/schedule?action=reschedule`)
- **檔案**：`src/app/student/schedule/page.tsx`
- **關鍵 PRD 行為**：
  1. 彈窗開啟時雖然預設帶入最接近的一堂課，但**開放下拉選單讓學生自由切換「當期已繳費、尚未上過的任一堂課程」**。
  2. 選擇「我要調課」：列出老師目前剩餘的開放時段以供替換。
  3. 選擇「我要請假」：填寫請假事由，並有即時警語提示（開課前 24 小時內請假將啟動階梯式違約扣款計算）。
  4. 送出後立即跳出毛玻璃 Toast（「調課申請已送出」或「請假申請已送出」）。

### 2.3 自主練習打卡 (`/student/practice`)
- **檔案**：`src/app/student/practice/page.tsx`
- **關鍵 PRD 行為**：
  1. 提供 15 秒練琴錄音麥克風互動按鈕，具備即時音波波形脈動動畫。
  2. 錄音完成後呼叫 AI 分析模組，評定「音準穩定度」、「節奏流暢度」與「音色圓潤度」。
  3. 點擊「確認打卡蓋章」，產生印章落下動畫，印章牆即時增加蓋章紀錄。
  4. 側邊選單的「我的打卡」已精準導向此錄音頁面（而非徽章頁）。

### 2.4 智慧聯絡簿 (`/student/summary/lesson-1`)
- **檔案**：`src/app/student/summary/[id]/page.tsx`
- **關鍵 PRD 行為**：
  1. 30 秒語音生成 AI 課堂週報。
  2. 包含三大模組：【今日核心進度】、【個人化指法與節拍優化建議】、【課後練琴目標設定】。
  3. 支援切換歷史各堂聯絡簿重點，家長可一目了然學習軌跡。

### 2.5 繳費證明與 AI 自動對帳 (`/student/billing`)
- **檔案**：`src/app/student/billing/page.tsx`
- **關鍵 PRD 行為**：
  1. **標準示意圖**：採用使用者指定之「台北富邦銀行轉帳成功截圖 (`fubon_transfer.jpg`)」，真實展示交易序號、轉入帳號與金額 $8,000。
  2. **AI 自動對帳解析**：上傳截圖後 3 秒內自動萃取金額、帳號末五碼與交易時間。
  3. **手動編輯升起鍵盤示意**：點擊手動修正金額時，右側升起客製化數字鍵盤（NumPad）以模擬手機輸入情境，便於 Demo 理解。
  4. 點擊確認對帳核銷後，觸發 Toast 提示「繳費資料已提交」。

### 2.6 成就徽章與印章牆 (`/student/stamps`)
- **檔案**：`src/app/student/stamps/page.tsx`
- **關鍵 PRD 行為**：
  1. 完整展示學員累積的出席印章（10 堂課蓋章卡）與練琴成就徽章。
  2. 徽章包含：「晨間早鳥」、「連打七天」、「精準節拍大師」、「曲目通關獎章」。
  3. 側邊選單的「成就徽章」按鈕正確連結至本頁面。

### 2.7 課程與繳費紀錄 (`/student/history`)
- **檔案**：`src/app/student/history/page.tsx`
- **關鍵 PRD 行為**：
  1. 歷史各期課程清單與已繳費收據整合檢視。
  2. 支援超出螢幕長度之垂直平滑滾動（Vertical Scroll），滑動手感順暢。

### 2.8 常見問題 FAQ (`/student/faq`)
- **檔案**：`src/app/student/faq/page.tsx`
- **關鍵 PRD 行為**：
  1. 支援超出螢幕長度之垂直平滑滾動（Vertical Scroll）。
  2. 手風琴摺疊卡片，包含產品特色、智慧對帳、請假規範與退費條款。

---

## 3. 核心商業邏輯與演算法規範

### 3.1 一期十堂課（student_terms）原則
- **規則**：音樂課堂以「期」為基本營運單位，每一期固定包含 10 堂課。
- **限制**：學生不得單獨加約或零星購買 1 堂課（除新生體驗試上外）。預約下一期時，系統自動連續鎖定 10 個星期的同一個時段。

### 3.2 開課 24 小時內請假 / 曠課階梯式扣款演算法
- **法規定義**：
  - 開課時間前 **< 24 小時**才提出請假，或**未請假且未課前報到**者，系統一律判定為「曠課 / 臨時違約」。
- **計算週期**：以該名學生**第一次發生曠課日起算 365 天（一年內）**為統計區間。
- **階梯式扣款比例**：
  1. **一年內第 1 次曠課**：扣該堂課學費之 **10%**（返還 90% 時數/額度）。
  2. **一年內第 2 次曠課**：扣該堂課學費之 **30%**（返還 70%）。
  3. **一年內第 3 次曠課**：扣該堂課學費之 **50%**（返還 50%）。
  4. **一年內第 4 次（含）以上**：**全額扣除 100%**（不予補課與退費）。

### 3.3 細緻報到出席狀態 (attendance_status)
資料庫狀態機包含 6 種狀態：
1. `upcoming`：已排定，尚未到達開課時間。
2. `checked_in`：學生已完成課前報到（課前 60 分鐘內點擊報到）。
3. `completed`：課程順利結束，老師已送出評價。
4. `leave_approved`：開課 24 小時前正常請假核准，時數保留至本期補課額度。
5. `rescheduled`：已成功調移至其他時段。
6. `absent`：開課 24h 內請假或無故缺席，啟動上述階梯扣款。

---

## 4. 全站 UI/UX 設計系統與視覺規範

### 4.1 底部導覽列 (StudentTabBar)
- **水彩背景底圖**：採用滿版填滿、**旋轉 90 度水彩底圖** (`water_color_nav.png`)，並疊加 `linear-gradient(0deg, rgba(250, 246, 240, 0.72), rgba(255, 255, 255, 0.60))` 柔和溫暖層，徹底消除過濃紫色，確保底層通透高雅。
- **實心彩虹漸層 Icon**：
  - 捨棄細線條描邊，全面改用**實心厚實剪影搭配純白挖空細節**。
  - 圖標下方具備高對比白底圓襯（`bg-white/65`，選中狀態為純白卡片並具備精緻立體陰影），100% 提升辨識度。

### 4.2 全域無跳轉操作反饋 Toast 系統
- **容器規格**：`padding: 14px 20px`、`border-radius: 16px`、毛玻璃高斯模糊 `backdrop-filter: blur(16px)`、白透邊框 `border: 1px solid rgba(255,255,255,0.85)`。
- **彩虹圖標圓徽**：`20px x 20px` 實心五彩漸層圓角徽章，中心為純白打勾 `✓`。
- **觸發情境**：試上預約成功、下一期預約送出、繳費核銷完成、調課送出、請假送出、課前報到成功、練琴打卡蓋章。

---

## 5. LINE 官方帳號 Rich Menu (雙分頁 12 鍵) 規格

採用 LINE 官方標準 2500x1686 規格，設定一組預設與別名，支援零延遲切換：

### 分頁一：`MusiMate_Page_1` (預設選單)
1. **頂部右側**：切換至分頁二 (別名: `richmenu-alias-page2`)
2. **上排左側**：【我的課表】➔ LIFF: `2011164851-lGsEnQWB` (`/student/schedule`)
3. **上排右側**：【練習打卡】➔ LIFF: `/student/practice`
4. **下排左側**：【智慧聯絡簿】➔ LIFF: `/student/summary/lesson-1`
5. **下排中間**：【請假/調課】➔ LIFF: `2011164851-3YNtzchu` (`/student/schedule?action=reschedule`)
6. **下排右側**：【成就徽章】➔ LIFF: `/student/stamps`

### 分頁二：`MusiMate_Page_2` (更多功能)
1. **頂部左側**：切換回分頁一 (別名: `richmenu-alias-page1`)
2. **上排左側**：【開始新課程】➔ LIFF: `2011164851-id3vAnRx` (`/student/courses`)
3. **上排中間**：【上傳繳費證明】➔ LIFF: `/student/billing`
4. **上排右側**：【音樂社群(待開發)】➔ LINE 官方文字回覆訊息
5. **下排左側**：【課程與繳費紀錄】➔ LIFF: `/student/history`
6. **下排中間**：【聯繫系統客服】➔ LINE Postback (`action=contact_support`)
7. **下排右側**：【FAQ 常見問題】➔ LIFF: `/student/faq`

---

## 6. 後端 API 與資料庫架構 (Supabase)

### 6.1 資料庫 Migration 腳本
- **檔案**：[`supabase/migrations/20260904_add_student_terms_and_attendance.sql`](file:///c:/Users/linda_lin/Downloads/music-classroom-ai-assistant-main/supabase/migrations/20260904_add_student_terms_and_attendance.sql)
- **新增資料表與欄位**：
  1. `student_terms`（學生期別表）：紀錄學生每期 10 堂課之期別編號、起訖日期、已使用堂數、剩餘堂數、繳費狀態。
  2. `appointments.attendance_status`（出席狀態枚舉）：擴充細緻狀態機。
  3. `student_absence_records`（曠課與扣款紀錄表）：紀錄開課 24 小時內違約請假、紀錄發生日期、一年內累計次數、扣款比例 (10%/30%/50%/100%)。

### 6.2 RESTful API 路由清單
- `GET /api/schedule/available-slots`：查詢老師開放時段
- `POST /api/schedule/reschedule`：提交調課申請（包含時段衝堂檢查）
- `POST /api/schedule/leave`：提交請假申請（包含 24h 扣款規則判定）
- `GET /api/student/stamps`：讀取學生蓋章與徽章成就
- `GET /api/student/history`：讀取歷史課堂與金流發票紀錄
- `GET /api/student/summary/[id]`：讀取指定課堂 AI 聯絡簿摘要
- `POST /api/courses/trial-booking`：新生體驗試上預約
- `POST /api/notifications/send`：發送/模擬 LINE Flex Message 推播

---

## 7. LINE 推播卡片完整規格與 DB 欄位對齊 (精簡 10 種情境 · 校正 5 色體系)

> 🎨 **全域色碼規範**：
> - 🔴 **課程排程與出席**：`#CEAB98` (粉霧暖紅/棕紅)
> - 🟡 **聯絡簿與學習週報**：`#D5CC6A` (草木芥末黃)
> - 🟢 **練琴打卡與回饋**：`#68C5AB` (柔和薄荷綠)
> - 🔵 **堂數續約與繳費核銷**：`#82AAD8` (晨曦粉霧藍)
> - 🟣 **新課程 / 系統公告**：`#B58EBE` (典雅薰衣紫)

### A. 課程排程與出席管理 (#CEAB98)
1. **A1. 上課提醒卡片**
   - **觸發情境**：開課前 24 小時、開課前 2 小時各發送一次。
   - **DB 欄位**：`courses.course_name`、`lessons.start_time - lessons.end_time`、`teachers.name`、`teachers.classroom_location`、`enrollments.completed_lessons / enrollments.total_lessons`
   - **按鈕**：Button 1 ➔ `📍 課前報到打卡` (`/student/schedule?action=checkin&lesson_id={id}`), Button 2 ➔ `📅 查看個人課表` (`/student/schedule`)
2. **A2. 請假 / 調課審核結果通知**
   - **觸發情境**：教師於 Web 後台審核通過或拒絕學生之調課/請假申請時即時發送。
   - **DB 欄位**：`reschedule_requests.status`、`reschedule_requests.original_time`、`reschedule_requests.new_time`、`reschedule_requests.teacher_note`
   - **按鈕**：Button 1 ➔ `📅 查看最新課表` (`/student/schedule`)
3. **A3. 缺席扣款預警通知（開啟申訴）**
   - **觸發情境**：開課逾 15 分鐘學生未到且未打卡，教師點擊「回報缺席」時發送。
   - **DB 欄位**：`lessons.start_time`、`students.violation_count_365d`、`penalty_rules.penalty_rate` (10%/30%/50%)、`disputes.appeal_deadline` (鎖定 24h 倒數)
   - **按鈕**：Button 1 (警示橘紅) ➔ `⚖️ 提出申訴 (24h 倒數)` (`/student/schedule?action=dispute&lesson_id={id}`), Button 2 ➔ `💬 聯繫教師`
4. **A4. 缺席扣款結案與補課券發放通知**
   - **觸發情境**：24 小時申訴期滿未申訴，或申訴遭駁回正式結案時發送。
   - **DB 欄位**：`vouchers.deducted_amount`、`vouchers.code`、`vouchers.expiry_date` (發放日 + 30天)
   - **按鈕**：Button 1 ➔ `🎫 使用補課券預約` (`/student/schedule?voucher_id={id}`)

### B. AI 週報與練習打卡 (黃/綠色系)
1. **B1. 課堂學習週報已送達** (#D5CC6A)
   - **觸發情境**：教師於 Web 後台完成 30 秒語音草稿審核/微調並發送時。
   - **DB 欄位**：`lessons.lesson_date`、`lesson_reports.summary`、`lesson_reports.skill_tips`、`lesson_reports.homework_piece`、`lesson_reports.target_bpm`、`lesson_reports.target_frequency`
   - **按鈕**：Button 1 ➔ `🔍 查看完整聯絡簿` (`/student/summary/{id}`)
2. **B2. 今天練琴了嗎？(每日打卡提醒)** (#68C5AB)
   - **觸發情境**：每日設定時間（如 18:30）排程檢查，當天未上傳練琴音訊者觸發。
   - **DB 欄位**：`practice_records.streak_days`、`lesson_reports.homework_piece`、`lesson_reports.target_bpm`
   - **按鈕**：Button 1 ➔ `🎙️ 立即 15 秒打卡` (`/student/practice`)
3. **B3. 練琴回饋已送達** (#68C5AB)
   - **觸發情境**：AI 判定產生或教師審核放行時推播。
   - **DB 欄位**：`practice_records.piece_name`、`practice_records.stability_score`、`practice_records.detected_bpm`、`practice_feedbacks.feedback_text`
   - **按鈕**：Button 1 ➔ `📊 查看練習紀錄趨勢` (`/student/compare/{record_id}`)

### C. 堂數續約與繳費核銷 (#82AAD8)
1. **C1. 下一期課程續約預約通知（最後 2 堂提醒）**
   - **觸發情境**：完成第 8 堂課、剩餘堂數 `enrollments.remaining_lessons == 2` 時自動推播。
   - **DB 欄位**：`enrollments.completed_lessons / total_lessons`、`packages.package_name`、`packages.price`、`teachers.bank_code`、`teachers.bank_account`
   - **按鈕**：Button 1 ➔ `📅 預約新一期課程` (`/student/schedule?action=renew`)
2. **C2. 繳費憑證已送出（OCR 處理完畢）**
   - **觸發情境**：家長上傳轉帳截圖、OCR 解析完畢後即時推播。
   - **DB 欄位**：`payments.amount`、`payments.bank_last_five`、`payments.transaction_time`、說明
   - **按鈕**：純狀態通知，不設按鈕（避免重複送出）。
3. **C3. 續約成功，新期已開通**
   - **觸發情境**：教師於 Web 後台點擊「確認入帳」、信託池建立完成時發送。
   - **DB 欄位**：`payments.purchased_lessons` (+10 堂)、`enrollments.remaining_lessons`、`payments.confirmed_at`、信託說明
   - **按鈕**：Button 1 ➔ `📅 查看排課課表` (`/student/schedule`)

