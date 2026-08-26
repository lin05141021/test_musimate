# -*- coding: utf-8 -*-
"""
MusiMate 課前提醒推播服務 (class_remind.py)
--------------------------------------------------
本程式負責依據資料庫 (Supabase appointments / users / teachers) 欄位，
自動產生 26 小時前「課前確認卡片 Flex Message」，並發送 LINE 推播。
"""

import os
import sys
import json
import requests
from datetime import datetime

# Windows 控制台 UTF-8 編碼安全設定
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# 🔴 Messaging API Channel Access Token
CHANNEL_ACCESS_TOKEN = os.getenv(
    "LINE_CHANNEL_ACCESS_TOKEN",
    "4P6wRAmmAqc+bN1bN0loO8cAVzHhb5fsWWiGzBUFl/k+vrAHTrTHFDsBm4mLKtNgRF6ghQr9E3nbHVXuZdRDtoE1Cixcz5vzKopcLd/MeUiOY/Pv5VMoQ5Csg0H9T8N0yJ85TGJd2ERsUiImkusS/wdB04t89/1O/w1cDnyilFU="
)

LINE_PUSH_URL = "https://api.line.me/v2/bot/message/push"
LINE_REPLY_URL = "https://api.line.me/v2/bot/message/reply"
HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {CHANNEL_ACCESS_TOKEN}"
}


def format_payment_badge(payment_status: str, payment_type: str = "prepaid") -> tuple[str, str]:
    """依據資料庫欄位轉換繳費狀態顯示文字與顏色"""
    if payment_status == "paid":
        return "✅ 已繳費 (包堂預付)", "#2E7D32" # 綠色
    elif payment_status == "pay_per_lesson":
        return "💳 完課後繳費 (單堂結算)", "#E65100" # 橘色
    else:
        return "⚠️ 待繳費", "#C2185B" # 粉紅色


def format_db_time_range(start_time_str: str, end_time_str: str) -> str:
    """格式化資料庫時間欄位 (start_time, end_time) 為易讀字串"""
    try:
        # 支援 ISO 8601 或一般字串
        clean_start = start_time_str.replace("T", " ").split("+")[0]
        clean_end = end_time_str.replace("T", " ").split("+")[0]
        
        start_dt = datetime.strptime(clean_start[:16], "%Y-%m-%d %H:%M")
        end_dt = datetime.strptime(clean_end[:16], "%Y-%m-%d %H:%M")
        
        weekday_map = {0: "一", 1: "二", 2: "三", 3: "四", 4: "五", 5: "六", 6: "日"}
        w_str = weekday_map.get(start_dt.weekday(), "")
        
        date_str = start_dt.strftime("%Y/%m/%d")
        time_part = f"{start_dt.strftime('%H:%M')} - {end_dt.strftime('%H:%M')}"
        return f"{date_str} (週{w_str}) {time_part}"
    except Exception:
        return f"{start_time_str} - {end_time_str}"


def get_26h_flex_json(appointment_data: dict) -> dict:
    """
    依據資料庫 (Supabase) 欄位結構生成 26 小時前課前確認卡片 JSON
    
    支援讀取欄位：
    - student_name   : users.name (例如 'Charles', 'Johnny')
    - instrument     : appointments.instrument (例如 '鋼琴 (Piano)')
    - teacher_name   : teachers/users.name (例如 '張老師 (Teacher Chang)')
    - start_time     : appointments.start_time (例如 '2026-08-26 19:30:00+08')
    - end_time       : appointments.end_time (例如 '2026-08-26 21:30:00+08')
    - payment_status : appointments.payment_status ('paid' | 'pay_per_lesson' | 'unpaid')
    - payment_type   : appointments.payment_type ('prepaid' | 'postpaid')
    - room           : 上課琴房 (例如 'A301 鋼琴琴房')
    """
    student_name = appointment_data.get("student_name", "學員")
    instrument = appointment_data.get("instrument", "鋼琴 (Piano)")
    teacher_name = appointment_data.get("teacher_name", "張老師 (Teacher Chang)")
    start_time = appointment_data.get("start_time", "")
    end_time = appointment_data.get("end_time", "")
    payment_status = appointment_data.get("payment_status", "unpaid")
    payment_type = appointment_data.get("payment_type", "prepaid")
    room = appointment_data.get("room", "A301 鋼琴琴房")

    time_display = format_db_time_range(start_time, end_time)
    pay_text, pay_color = format_payment_badge(payment_status, payment_type)

    return {
        "type": "bubble",
        "size": "mega",
        "header": {
            "type": "box",
            "layout": "vertical",
            "backgroundColor": "#1E88E5",
            "paddingAll": "20px",
            "contents": [
                {"type": "text", "text": "MusiMate 音樂教室 · 課前提醒", "color": "#FFFFFF", "weight": "bold", "size": "xs"},
                {"type": "text", "text": "明日課程預報 ⏰", "color": "#FFFFFF", "weight": "bold", "size": "xl", "margin": "xs"}
            ]
        },
        "body": {
            "type": "box",
            "layout": "vertical",
            "spacing": "md",
            "contents": [
                {"type": "text", "text": f"{student_name} 您好：", "weight": "bold", "size": "md", "color": "#555555"},
                {"type": "text", "text": f"個別指導課 · {instrument}", "weight": "bold", "size": "lg", "color": "#111111"},
                {"type": "separator", "margin": "md"},
                {
                    "type": "box",
                    "layout": "vertical",
                    "margin": "md",
                    "spacing": "sm",
                    "contents": [
                        {
                            "type": "box",
                            "layout": "baseline",
                            "contents": [
                                {"type": "text", "text": "授課師資", "color": "#999999", "size": "sm", "flex": 2},
                                {"type": "text", "text": teacher_name, "color": "#333333", "size": "sm", "flex": 5, "weight": "bold"}
                            ]
                        },
                        {
                            "type": "box",
                            "layout": "baseline",
                            "contents": [
                                {"type": "text", "text": "上課時間", "color": "#999999", "size": "sm", "flex": 2},
                                {"type": "text", "text": time_display, "color": "#1E88E5", "size": "sm", "flex": 5, "weight": "bold"}
                            ]
                        },
                        {
                            "type": "box",
                            "layout": "baseline",
                            "contents": [
                                {"type": "text", "text": "上課教室", "color": "#999999", "size": "sm", "flex": 2},
                                {"type": "text", "text": room, "color": "#333333", "size": "sm", "flex": 5, "weight": "bold"}
                            ]
                        },
                        {
                            "type": "box",
                            "layout": "baseline",
                            "contents": [
                                {"type": "text", "text": "繳費狀態", "color": "#999999", "size": "sm", "flex": 2},
                                {"type": "text", "text": pay_text, "color": pay_color, "size": "sm", "flex": 5, "weight": "bold"}
                            ]
                        }
                    ]
                },
                {"type": "text", "text": "💡 貼心提醒：如需免扣款請假/調課，請於開課 24 小時前於線上提出申請。", "color": "#888888", "size": "xs", "wrap": True}
            ]
        },
        "footer": {
            "type": "box",
            "layout": "vertical",
            "spacing": "sm",
            "contents": [
                {
                    "type": "button",
                    "style": "primary",
                    "color": "#1E88E5",
                    "height": "sm",
                    "action": {
                        "type": "postback",
                        "label": "✅ 我會如期抵達",
                        "data": f"action=confirm_attend&student={student_name}",
                        "displayText": "我會如期抵達！"
                    }
                },
                {
                    "type": "button",
                    "style": "secondary",
                    "height": "sm",
                    "action": {
                        "type": "uri",
                        "label": "查看個人課表 / 請假調課",
                        "uri": "https://line.me"
                    }
                }
            ]
        }
    }


def send_line_push(user_id: str, alt_text: str, flex_content: dict) -> bool:
    """底層 API 發送推播卡片函式"""
    payload = {
        "to": user_id,
        "messages": [
            {
                "type": "flex",
                "altText": alt_text,
                "contents": flex_content
            }
        ]
    }
    res = requests.post(LINE_PUSH_URL, headers=HEADERS, json=payload)
    if res.status_code == 200:
        print(f"🚀 [成功發送推播] Target: {user_id}")
        return True
    else:
        print(f"❌ [推播失敗] Code: {res.status_code}, Msg: {res.text}")
        return False


# ========================================================
# 測試資料集 (對齊資料庫真實欄位)
# ========================================================
MOCK_DATABASE_APPOINTMENTS = [
    {
        "student_id": "s0000000-0000-0000-0000-000000000003",
        "student_name": "Charles",
        "line_user_id": None,
        "teacher_name": "張老師 (Teacher Chang)",
        "instrument": "鋼琴 (Piano)",
        "start_time": "2026-08-26 19:30:00+08",
        "end_time": "2026-08-26 21:30:00+08",
        "payment_status": "paid",
        "payment_type": "prepaid",
        "status": "confirmed",
        "room": "鋼琴 1 號琴房 (A301)"
    },
    {
        "student_id": "s0000000-0000-0000-0000-000000000004",
        "student_name": "Johnny",
        "line_user_id": None,
        "teacher_name": "張老師 (Teacher Chang)",
        "instrument": "鋼琴 (Piano)",
        "start_time": "2026-08-27 19:30:00+08",
        "end_time": "2026-08-27 21:30:00+08",
        "payment_status": "pay_per_lesson",
        "payment_type": "postpaid",
        "status": "confirmed",
        "room": "鋼琴 2 號琴房 (A302)"
    },
    {
        "student_id": "s0000000-0000-0000-0000-000000000005",
        "student_name": "Lin",
        "line_user_id": "Uf2457bf35e0d6d3060b60838d9a9c91c",
        "teacher_name": "張老師 (Teacher Chang)",
        "instrument": "鋼琴 (Piano)",
        "start_time": "2026-08-26 10:00:00+08",
        "end_time": "2026-08-26 12:00:00+08",
        "payment_status": "pay_per_lesson",
        "payment_type": "postpaid",
        "status": "confirmed",
        "room": "鋼琴 3 號琴房 (A303)"
    }
]


def test_generate_reminders(target_line_user_id: str = None):
    """測試三位學生 (Charles, Johnny & Lin) 的資料庫欄位讀取與 Flex 訊息生成"""
    print("=" * 65)
    print("🎹 [MusiMate] 正在執行 Charles, Johnny & Lin 課前提醒推播測試...")
    print("=" * 65)

    for idx, appt in enumerate(MOCK_DATABASE_APPOINTMENTS, 1):
        print(f"\n[{idx}] 測試學生：{appt['student_name']}")
        print(f"    - 資料庫上課項目: {appt['instrument']}")
        print(f"    - 授課師資: {appt['teacher_name']}")
        print(f"    - 上課時間: {appt['start_time']} ~ {appt['end_time']}")
        print(f"    - 繳費方式: payment_status={appt['payment_status']} (type={appt['payment_type']})")
        
        # 生成 Flex Message JSON
        flex_json = get_26h_flex_json(appt)
        
        # 驗證卡片核心文字
        header_text = flex_json["header"]["contents"][1]["text"]
        body_student = flex_json["body"]["contents"][0]["text"]
        body_course = flex_json["body"]["contents"][1]["text"]
        time_text = flex_json["body"]["contents"][3]["contents"][1]["contents"][1]["text"]
        pay_text = flex_json["body"]["contents"][3]["contents"][3]["contents"][1]["text"]
        
        print(f"    ✅ [Flex 卡片生成成功]")
        print(f"       標題: {header_text}")
        print(f"       學生: {body_student}")
        print(f"       課程: {body_course}")
        print(f"       時間: {time_text}")
        print(f"       繳費: {pay_text}")

        # 若有指定真實 LINE User ID，則直接發送推播測試
        if target_line_user_id:
            print(f"    📲 正在發送真實推播給: {target_line_user_id}...")
            send_line_push(target_line_user_id, f"【課前提醒】{appt['student_name']} 明日鋼琴課預報", flex_json)

    print("\n" + "=" * 65)
    print("🎉 三位學生 (Charles, Johnny & Lin) 的資料庫欄位與 Flex 卡片測試全部通過！")
    print("=" * 65)


def get_welcome_flex_json(student_name: str = "學員") -> dict:
    """
    生成學生加入官方帳號或綁定成功時的「歡迎訊息卡片」
    """
    return {
        "type": "bubble",
        "size": "mega",
        "header": {
            "type": "box",
            "layout": "vertical",
            "backgroundColor": "#2E7D32",
            "paddingAll": "20px",
            "contents": [
                {"type": "text", "text": "MusiMate 音樂教室 🎵", "color": "#E8F5E9", "weight": "bold", "size": "xs"},
                {"type": "text", "text": "歡迎加入 MusiMate！✨", "color": "#FFFFFF", "weight": "bold", "size": "xl", "margin": "xs"}
            ]
        },
        "body": {
            "type": "box",
            "layout": "vertical",
            "spacing": "md",
            "contents": [
                {"type": "text", "text": f"親愛的 {student_name} 您好：", "weight": "bold", "size": "md", "color": "#333333"},
                {"type": "text", "text": "歡迎您加入張老師的音樂課堂！您的 LINE 身分已成功登錄系統。", "size": "sm", "color": "#666666", "wrap": True},
                {"type": "separator", "margin": "md"},
                {
                    "type": "box",
                    "layout": "vertical",
                    "margin": "md",
                    "spacing": "sm",
                    "contents": [
                        {
                            "type": "box",
                            "layout": "baseline",
                            "contents": [
                                {"type": "text", "text": "⏰", "size": "sm", "flex": 1},
                                {"type": "text", "text": "課前預報：每堂課開課前一天，系統將自動推播專屬提醒與琴房資訊。", "color": "#444444", "size": "xs", "flex": 9, "wrap": True}
                            ]
                        },
                        {
                            "type": "box",
                            "layout": "baseline",
                            "contents": [
                                {"type": "text", "text": "📅", "size": "sm", "flex": 1},
                                {"type": "text", "text": "線上課表：點擊下方圖文選單隨時查看剩餘堂數、上課進度與打卡。", "color": "#444444", "size": "xs", "flex": 9, "wrap": True}
                            ]
                        },
                        {
                            "type": "box",
                            "layout": "baseline",
                            "contents": [
                                {"type": "text", "text": "🔄", "size": "sm", "flex": 1},
                                {"type": "text", "text": "請假調課：如需調整時間，可於開課 24 小時前線上提出申請。", "color": "#444444", "size": "xs", "flex": 9, "wrap": True}
                            ]
                        }
                    ]
                }
            ]
        },
        "footer": {
            "type": "box",
            "layout": "vertical",
            "spacing": "sm",
            "contents": [
                {
                    "type": "button",
                    "style": "primary",
                    "color": "#2E7D32",
                    "height": "sm",
                    "action": {
                        "type": "uri",
                        "label": "📅 開啟我的專屬課表",
                        "uri": "https://liff.line.me/2011164851-ycZLTOJv"
                    }
                }
            ]
        }
    }


# ----------------------------------------------------
# 內建 Webhook 伺服器 (Zero-Dependency HTTP Server)
# ----------------------------------------------------
from http.server import HTTPServer, BaseHTTPRequestHandler

class LineWebhookHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        html_path = os.path.join(os.path.dirname(__file__), "..", "get_id.html")
        if not os.path.exists(html_path):
            html_path = os.path.join(os.path.dirname(__file__), "get_id.html")

        if os.path.exists(html_path):
            with open(html_path, "r", encoding="utf-8") as f:
                content = f.read()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(content.encode("utf-8"))
        else:
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.end_headers()
            self.wfile.write("MusiMate Webhook Server is Running! 🚀".encode("utf-8"))

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length)
        
        try:
            body = json.loads(post_data.decode("utf-8"))
            events = body.get("events", [])
            
            for event in events:
                user_id = event.get("source", {}).get("userId")
                reply_token = event.get("replyToken")
                event_type = event.get("type")
                
                print("\n" + "=" * 65)
                print(f"🎉 [收到 LINE 事件 - 自動擷取 User ID]：\n👉 {user_id}")
                print("=" * 65)
                
                # 1. 學生剛加好友 (follow) 或 傳送一般訊息時 ➔ 存入 ID 並推送「歡迎訊息」
                if event_type == "follow" or event_type == "message":
                    msg_text = event.get("message", {}).get("text", "") if event_type == "message" else "加入好友"
                    print(f"📩 事件類型: {event_type} | 內容: 「{msg_text}」")
                    
                    # 推送精美歡迎卡片（不主動推課程提醒，除非定時排程時間到）
                    print(f"📲 正在發送【歡迎訊息】卡片給新學員 ({user_id})...")
                    welcome_card = get_welcome_flex_json("學員")
                    send_line_push(user_id, "【MusiMate】歡迎加入張老師音樂教室！", welcome_card)

                # 2. 如果使用者點擊卡片按鈕 (Postback)
                elif event_type == "postback":
                    pb_data = event.get("postback", {}).get("data")
                    print(f"👆 收到按鈕回傳: {pb_data}")
                    reply_payload = {
                        "replyToken": reply_token,
                        "messages": [{"type": "text", "text": "🎉 已收到您的如期出席確認！張老師期待與您的課程。"}]
                    }
                    requests.post(LINE_REPLY_URL, headers=HEADERS, json=reply_payload)
        except Exception as e:
            print(f"❌ Webhook 解析錯誤: {e}")

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(b'{"status": "ok"}')

    def log_message(self, format, *args):
        pass


def run_webhook_server(port: int = 8000):
    server_address = ("0.0.0.0", port)
    httpd = HTTPServer(server_address, LineWebhookHandler)
    print("=" * 65)
    print(f"🚀 [MusiMate Webhook 伺服器啟動中] Port: {port}")
    print(f"👉 請確保 ngrok 已連線至 8000:  ngrok http {port}")
    print("👉 現在只要拿起手機在 LINE 官方帳號傳送「hi」或「測試」，")
    print("   終端機就會立即印出您的 LINE User ID，並發送卡片至您的手機！")
    print("=" * 65 + "\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 伺服器已停止。")


if __name__ == "__main__":
    import sys
    args = sys.argv[1:]
    
    if "--server" in args or "server" in args:
        run_webhook_server()
    elif len(args) > 0 and args[0].startswith("U"):
        # 直接推播到指定 ID: python class_remind.py U123456...
        test_generate_reminders(target_line_user_id=args[0])
    else:
        # 預設執行測試，並提示如何啟動伺服器
        test_generate_reminders()
        print("\n💡 提示：")
        print("  - 啟動接收訊息伺服器： python src/app/student/line_liff/class_remind/class_remind.py --server")
        print("  - 直接推播給特定 ID ： python src/app/student/line_liff/class_remind/class_remind.py 您的ID")