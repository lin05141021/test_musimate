# -*- coding: utf-8 -*-
"""
MusiMate LINE 關鍵字辨識與自動回覆機器人 (Keyword Bot & Webhook Router)
支援學生傳送自然文字訊息（例如：「我的課表」、「我要請假」、「想學鋼琴」、「繳費」等）
透過模糊關鍵字比對，自動推送對應的 Flex 卡片與 LIFF 捷徑按鈕！
"""

import sys
import json
import requests

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

CHANNEL_ACCESS_TOKEN = "4P6wRAmmAqc+bN1bN0loO8cAVzHhb5fsWWiGzBUFl/k+vrAHTrTHFDsBm4mLKtNgRF6ghQr9E3nbHVXuZdRDtoE1Cixcz5vzKopcLd/MeUiOY/Pv5VMoQ5Csg0H9T8N0yJ85TGJd2ERsUiImkusS/wdB04t89/1O/w1cDnyilFU="
LINE_REPLY_URL = "https://api.line.me/v2/bot/message/reply"
LINE_PUSH_URL = "https://api.line.me/v2/bot/message/push"

# 載入關鍵字意圖設定
def load_intent_rules():
    return [
        {
            "name": "view_schedule",
            "keywords": ["課表", "我的課表", "上課時間", "幾點上課", "上課", "課表查詢", "行事曆", "哪一天上課", "看課表", "查課表", "今天有課嗎", "這週有課嗎", "下次上課", "下堂課", "課堂時間", "schedule", "timetable"],
            "title": "🎵 MusiMate 學生課表查詢",
            "text": "您好！點擊下方按鈕即可立即查看您的專屬學生課表與上課地點：",
            "action_label": "📅 立即開啟我的課表",
            "action_url": "https://liff.line.me/2011164851-lGsEnQWB"
        },
        {
            "name": "leave_and_reschedule",
            "keywords": ["請假", "我要請假", "調課", "我要調課", "改時間", "換時間", "改期", "補課", "不能去", "無法上課", "無法出席", "暫停", "生病", "事假", "病假", "延期", "換時段", "調整時段", "reschedule", "leave"],
            "title": "📋 線上調課與請假服務",
            "text": "收到您的請假/調課需求！系統提供智慧線上調課與課堂保留時數服務，請點擊下方按鈕進行申請：",
            "action_label": "⏱️ 開啟線上調課與請假",
            "action_url": "https://liff.line.me/2011164851-lGsEnQWB?action=reschedule"
        },
        {
            "name": "new_course_booking",
            "keywords": ["新課程", "開始新課程", "預約", "預約新課程", "找老師", "報名", "試上", "體驗課", "想學鋼琴", "想學小提琴", "想學吉他", "新生", "音樂課", "鋼琴課", "小提琴課", "長笛課", "吉他課", "學琴", "報名體驗"],
            "title": "🎹 MusiMate 新課程探索",
            "text": "歡迎探索 MusiMate 音樂新課程！我們提供專業師資與彈性預約試上體驗：",
            "action_label": "✨ 立即探索並預約新課程",
            "action_url": "https://liff.line.me/2011164851-id3vAnRx"
        },
        {
            "name": "contact_book",
            "keywords": ["聯絡簿", "智慧聯絡簿", "作業", "進度", "課堂筆記", "老師交代", "練琴", "打卡", "練習紀錄", "今日作業", "錄音重點"],
            "title": "📖 智慧聯絡簿與課後練習",
            "text": "MusiMate 智慧聯絡簿已整合 AI 課堂錄音重點摘要與課後練習指引！老師的指導筆記皆已為您歸檔在系統中。",
            "action_label": None,
            "action_url": None
        },
        {
            "name": "tuition_payment",
            "keywords": ["繳費", "學費", "付錢", "多少錢", "帳單", "薪資", "收據", "學費繳納", "未繳", "已繳", "匯款", "現金"],
            "title": "💳 學費繳納與堂數明細",
            "text": "您的學費繳納明細與堂數紀錄已同步於系統中。您可在「我的課表」課堂卡片中查看每堂課的繳費狀態。",
            "action_label": "💰 查看學費與課表狀態",
            "action_url": "https://liff.line.me/2011164851-lGsEnQWB"
        },
        {
            "name": "teacher_profile",
            "keywords": ["老師", "師資", "張老師", "張芷嫣", "介紹", "簡介", "學歷", "背景", "名師"],
            "title": "👩‍🏫 張芷嫣老師 師資檔案",
            "text": "張芷嫣老師主修鋼琴與小提琴（國立師大與維也納音樂大學碩士），教學資歷 10 年。歡迎點擊查看名師詳細檔案：",
            "action_label": "🎻 瀏覽張老師個人專欄",
            "action_url": "https://lin05141021.github.io/test_musimate/src/newclass/teacher_info.html"
        }
    ]

def match_keyword(user_text):
    if not user_text:
        return None
    cleaned = user_text.strip().lower()
    rules = load_intent_rules()
    for rule in rules:
        for kw in rule["keywords"]:
            if kw.lower() in cleaned:
                return rule
    return None

def build_reply_messages(matched_rule):
    if not matched_rule:
        return [{
            "type": "text",
            "text": "🎵 您好！我是 MusiMate 音樂教室智慧小助手。\n您可以輸入「查課表」、「請假」、「新課程」或「張老師簡介」，我會即時為您服務喔！"
        }]

    if matched_rule.get("action_url"):
        flex_card = {
            "type": "flex",
            "altText": matched_rule["title"],
            "contents": {
                "type": "bubble",
                "size": "mega",
                "header": {
                    "type": "box",
                    "layout": "vertical",
                    "backgroundColor": "#2B3049",
                    "paddingTop": "16px",
                    "paddingBottom": "16px",
                    "contents": [
                        {
                            "type": "text",
                            "text": matched_rule["title"],
                            "color": "#FFFFFF",
                            "weight": "bold",
                            "size": "md"
                        }
                    ]
                },
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "spacing": "md",
                    "contents": [
                        {
                            "type": "text",
                            "text": matched_rule["text"],
                            "wrap": True,
                            "color": "#4A3A31",
                            "size": "sm"
                        }
                    ]
                },
                "footer": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "button",
                            "action": {
                                "type": "uri",
                                "label": matched_rule["action_label"],
                                "uri": matched_rule["action_url"]
                            },
                            "style": "primary",
                            "color": "#B58EBE"
                        }
                    ]
                }
            }
        }
        return [flex_card]
    else:
        return [{
            "type": "text",
            "text": f"{matched_rule['title']}\n\n{matched_rule['text']}"
        }]

def reply_line_message(reply_token, messages):
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {CHANNEL_ACCESS_TOKEN}"
    }
    payload = {
        "replyToken": reply_token,
        "messages": messages
    }
    res = requests.post(LINE_REPLY_URL, headers=headers, json=payload, timeout=10)
    return res.status_code

if __name__ == "__main__":
    print("✨ MusiMate 關鍵字意圖測試：")
    test_inputs = ["我想看我的課表", "下週三我要請假", "有鋼琴新課程可以預約嗎", "張老師的學歷背景是什麼", "哈囉"]
    for text in test_inputs:
        matched = match_keyword(text)
        print(f"輸入：『{text}』 ➔ 命中意圖：{matched['name'] if matched else '未命中 (預設回覆)'}")
