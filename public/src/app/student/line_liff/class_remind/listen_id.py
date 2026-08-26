# -*- coding: utf-8 -*-
import sys
import time
import json
import requests

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

TOKEN = "9d0792d9-0e1b-4c24-a28a-b21a1a6e6df9"
WEBHOOK_URL = f"https://webhook.site/{TOKEN}"
API_URL = f"https://webhook.site/token/{TOKEN}/requests"

CHANNEL_ACCESS_TOKEN = "4P6wRAmmAqc+bN1bN0loO8cAVzHhb5fsWWiGzBUFl/k+vrAHTrTHFDsBm4mLKtNgRF6ghQr9E3nbHVXuZdRDtoE1Cixcz5vzKopcLd/MeUiOY/Pv5VMoQ5Csg0H9T8N0yJ85TGJd2ERsUiImkusS/wdB04t89/1O/w1cDnyilFU="
LINE_PUSH_URL = "https://api.line.me/v2/bot/message/push"

print("=" * 65)
print("👂 [MusiMate 自動監聽服務已啟動]")
print(f"👉 請將下方 Webhook 網址貼至 LINE Developers (Messaging API > Webhook URL):")
print(f"   {WEBHOOK_URL}")
print("👉 開啟「Use webhook」並點擊「Verify (驗證)」")
print("👉 接著用手機在 LINE 官方帳號傳送「hi」，系統會自動抓取您的 ID 並發送推播！")
print("=" * 65 + "\n")

found_user = False
while not found_user:
    try:
        res = requests.get(API_URL, timeout=10)
        if res.status_code == 200:
            items = res.json().get("data", [])
            for item in items:
                content = item.get("content", "")
                if content:
                    try:
                        payload = json.loads(content)
                        events = payload.get("events", [])
                        for event in events:
                            user_id = event.get("source", {}).get("userId")
                            if user_id:
                                print("\n" + "=" * 65)
                                print(f"🎉 抓取成功！您的專屬 LINE User ID 是：\n👉 {user_id}")
                                print("=" * 65)
                                
                                # 發送 Lin 的課前提醒 Flex 卡片
                                print(f"\n📲 正在發送 Lin 的鋼琴課預報卡片到您的手機 ({user_id})...")
                                from class_remind import get_26h_flex_json, MOCK_DATABASE_APPOINTMENTS, send_line_push
                                lin_card = get_26h_flex_json(MOCK_DATABASE_APPOINTMENTS[2]) # Lin
                                send_line_push(user_id, "【課前提醒】Lin 明日鋼琴課預報", lin_card)
                                print("🎉 推播完成！請檢查您的手機 LINE！\n")
                                found_user = True
                                break
                    except Exception:
                        pass
                if found_user:
                    break
    except Exception as e:
        pass
    time.sleep(2)
