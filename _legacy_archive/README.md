# MusiMate 歷史檔案與測試原型封存庫 (Legacy Archive)

本目錄存放專案在學生端開發與迭代過程中所產生的**歷史測試資料**、**舊版靜態原型**與**已廢棄過渡檔案**，避免與目前運行的 Next.js 正式代碼混淆。

---

## 目錄結構說明

### 1. `superseded_assets/`（過時圖檔與輔助腳本）
- `102579.jpg`：早期手繪線稿測試匯款證明，已由 `public/demo_img/fubon_transfer.jpg`（富邦網銀轉帳截圖）取代。
- `分頁一.jpg`, `分頁一.png`, `分頁二.jpg`, `分頁二.png`：LINE Rich Menu 中文命名圖檔，已由標準英文命名 `page1.jpg`, `page2.jpg` 取代。
- `resize_images.ps1`：手動裁切 Rich Menu 尺寸的過渡腳本，目前已改由 Python 直接處理標準 2500x1686 規格。

### 2. `test_data_and_tools/`（測試資料筆記與除錯工具）
- `student_data_input`, `student_data_input.md`：早期測試學員課表與身分資料的筆記文件。
- `get_id.html`：用於測試讀取特定 LINE User ID 的單頁查詢網頁。
- `StudentBottomNav.tsx`：早期試作的學生端簡易底部導航列，現已全面升級為支援旋轉水彩底圖、高對比彩虹 Icon 與全域分發的 `StudentTabBar.tsx`。

### 3. `test_ui_prototypes/`（早期靜態 HTML 原型介面）
- `schedule.html`, `schedule_styles.css`：初期手寫的純 HTML 課表測試頁面。
- `changeclass.html`：初期手寫的調課空白原型。
- `login.html`：初期測試登入原型。
（*註：現行學生端課表、調課、請假、打卡、繳費等所有功能，均已在 `src/app/student/` 中重構為標準 Next.js 頁面與組件。*）
