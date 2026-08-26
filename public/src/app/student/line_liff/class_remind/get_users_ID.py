# -*- coding: utf-8 -*-
import sys
import requests

# Windows 控制台 UTF-8 編碼安全設定
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# 請將引號內的文字換成你的 Messaging API Channel Access Token
CHANNEL_ACCESS_TOKEN = "4P6wRAmmAqc+bN1bN0loO8cAVzHhb5fsWWiGzBUFl/k+vrAHTrTHFDsBm4mLKtNgRF6ghQr9E3nbHVXuZdRDtoE1Cixcz5vzKopcLd/MeUiOY/Pv5VMoQ5Csg0H9T8N0yJ85TGJd2ERsUiImkusS/wdB04t89/1O/w1cDnyilFU="

headers = {
    "Authorization": f"Bearer {CHANNEL_ACCESS_TOKEN}"
}

res = requests.get("https://api.line.me/v2/bot/followers/ids", headers=headers)

if res.status_code == 200:
    data = res.json()
    user_ids = data.get("userIds", [])
    if user_ids:
        print("\n🎉 成功抓取到 LINE User ID 清單：")
        for idx, uid in enumerate(user_ids, 1):
            print(f"[{idx}] {uid}")
        print("\n👉 請複製上面這串以 U 開頭的 33 碼 ID 用於測試推播！\n")
    else:
        print("\n⚠️ 找不到任何好友！請確認你的個人 LINE 已經加入此官方帳號為好友。")
else:
    print(f"\n❌ 查詢失敗 (HTTP {res.status_code})：{res.text}")