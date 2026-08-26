# -*- coding: utf-8 -*-
"""
MusiMate 雙分頁 Rich Menu 自動化上傳與別名 (Alias) 綁定腳本
"""

import requests
import json
import os
import sys

# 強制標準輸出使用 UTF-8
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# ==================== LINE 官方帳號金鑰設定 ====================
CHANNEL_ACCESS_TOKEN = "4P6wRAmmAqc+bN1bN0loO8cAVzHhb5fsWWiGzBUFl/k+vrAHTrTHFDsBm4mLKtNgRF6ghQr9E3nbHVXuZdRDtoE1Cixcz5vzKopcLd/MeUiOY/Pv5VMoQ5Csg0H9T8N0yJ85TGJd2ERsUiImkusS/wdB04t89/1O/w1cDnyilFU="
LIFF_ID = "2011164851-ycZLTOJv"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 尋找目錄下的 JPG/PNG 圖片檔
files = os.listdir(BASE_DIR)
p1_candidates = [os.path.join(BASE_DIR, f) for f in files if "一" in f and (f.endswith(".jpg") or f.endswith(".png"))]
p2_candidates = [os.path.join(BASE_DIR, f) for f in files if "二" in f and (f.endswith(".jpg") or f.endswith(".png"))]

# 優先使用 JPG (小於 1MB 且標準 2500x1686)
PAGE1_IMAGE_PATH = [f for f in p1_candidates if f.endswith(".jpg")][0] if any(f.endswith(".jpg") for f in p1_candidates) else p1_candidates[0]
PAGE2_IMAGE_PATH = [f for f in p2_candidates if f.endswith(".jpg")][0] if any(f.endswith(".jpg") for f in p2_candidates) else p2_candidates[0]
# ============================================================

HEADERS = {
    "Authorization": f"Bearer {CHANNEL_ACCESS_TOKEN}",
    "Content-Type": "application/json"
}

ALIAS_PAGE1 = "richmenu-alias-page1"
ALIAS_PAGE2 = "richmenu-alias-page2"

def clean_all_existing_data():
    """徹底清除所有舊有的 Alias、預設選單與舊 Rich Menu，釋放 10 個上限配額並清除快取"""
    print("[1/6] 檢查並徹底清理舊有的 Alias 與舊 Rich Menu (釋放上限配額)...")
    
    # 1. 刪除所有 Aliases
    try:
        res = requests.get("https://api.line.me/v2/bot/richmenu/alias/list", headers=HEADERS)
        if res.status_code == 200:
            aliases = res.json().get("aliases", [])
            for a in aliases:
                requests.delete(f"https://api.line.me/v2/bot/richmenu/alias/{a['richMenuAliasId']}", headers=HEADERS)
                print(f"  - 已刪除舊別名: {a['richMenuAliasId']}")
    except Exception as e:
        print(f"  - 清理別名時發生錯誤: {e}")

    # 2. 解除全體預設選單
    try:
        requests.delete("https://api.line.me/v2/bot/user/all/richmenu", headers=HEADERS)
    except Exception:
        pass

    # 3. 刪除線上所有舊的 Rich Menus
    try:
        res = requests.get("https://api.line.me/v2/bot/richmenu/list", headers=HEADERS)
        if res.status_code == 200:
            menus = res.json().get("richmenus", [])
            for m in menus:
                requests.delete(f"https://api.line.me/v2/bot/richmenu/{m['richMenuId']}", headers=HEADERS)
                print(f"  - 已刪除舊 Rich Menu: {m['richMenuId']} ({m.get('name', '未命名')})")
    except Exception as e:
        print(f"  - 清理舊選單時發生錯誤: {e}")

def create_rich_menu(menu_config):
    """建立 Rich Menu 結構"""
    res = requests.post("https://api.line.me/v2/bot/richmenu", headers=HEADERS, json=menu_config)
    if res.status_code != 200:
        print(f"[ERROR] 建立 Rich Menu 失敗: {res.text}")
        sys.exit(1)
    return res.json()["richMenuId"]

def upload_image(rich_menu_id, image_path):
    """上傳 Rich Menu 圖片"""
    if not os.path.exists(image_path):
        print(f"[ERROR] 找不到圖片檔案: {image_path}")
        sys.exit(1)
    
    content_type = "image/png" if image_path.lower().endswith(".png") else "image/jpeg"
    upload_headers = {
        "Authorization": f"Bearer {CHANNEL_ACCESS_TOKEN}",
        "Content-Type": content_type
    }
    with open(image_path, "rb") as f:
        res = requests.post(
            f"https://api-data.line.me/v2/bot/richmenu/{rich_menu_id}/content",
            headers=upload_headers,
            data=f
        )
    if res.status_code != 200:
        print(f"[ERROR] 上傳圖片失敗 ({image_path}, {content_type}): {res.status_code} {res.text}")
        sys.exit(1)

def create_alias(rich_menu_id, alias_id):
    """建立 Rich Menu 別名 (支援零延遲秒切)"""
    body = {
        "richMenuId": rich_menu_id,
        "richMenuAliasId": alias_id
    }
    res = requests.post("https://api.line.me/v2/bot/richmenu/alias", headers=HEADERS, json=body)
    if res.status_code != 200:
        print(f"[ERROR] 綁定別名失敗 ({alias_id}): {res.text}")
        sys.exit(1)

def set_default_menu(rich_menu_id):
    """設定預設顯示的分頁一"""
    res = requests.post(f"https://api.line.me/v2/bot/user/all/richmenu/{rich_menu_id}", headers=HEADERS)
    if res.status_code != 200:
        print(f"[ERROR] 設定預設選單失敗: {res.text}")
        sys.exit(1)

def main():
    print(f"使用 Page 1 圖片: {PAGE1_IMAGE_PATH}")
    print(f"使用 Page 2 圖片: {PAGE2_IMAGE_PATH}")

    # 1. 清理舊別名與舊選單
    clean_all_existing_data()

    # 2. 定義 Page 1 (MY MusiMate) 結構 (2500x1686)
    page1_config = {
        "size": { "width": 2500, "height": 1686 },
        "selected": True,
        "name": "MusiMate_Page_1",
        "chatBarText": "開啟選單",
        "areas": [
            # 頂部切換到第二頁 (右側 More)
            {
                "bounds": { "x": 1250, "y": 0, "width": 1250, "height": 286 },
                "action": {
                    "type": "richmenuswitch",
                    "richMenuAliasId": ALIAS_PAGE2,
                    "data": "action=switch_to_page2"
                }
            },
            # 上排左: 我的課表
            {
                "bounds": { "x": 0, "y": 286, "width": 1250, "height": 700 },
                "action": {
                    "type": "uri",
                    "label": "我的課表",
                    "uri": f"https://liff.line.me/{LIFF_ID}/src/test_uiredesign/student_schedule.html"
                }
            },
            # 上排右: 我要請假/調課
            {
                "bounds": { "x": 1250, "y": 286, "width": 1250, "height": 700 },
                "action": {
                    "type": "uri",
                    "label": "我要請假/調課",
                    "uri": f"https://liff.line.me/{LIFF_ID}/src/test_uiredesign/student_changeclass.html"
                }
            },
            # 下排左: 智慧聯絡簿
            {
                "bounds": { "x": 0, "y": 986, "width": 833, "height": 700 },
                "action": {
                    "type": "uri",
                    "label": "智慧聯絡簿",
                    "uri": f"https://liff.line.me/{LIFF_ID}/src/test_uiredesign/student_schedule.html"
                }
            },
            # 下排中: 練習打卡
            {
                "bounds": { "x": 833, "y": 986, "width": 834, "height": 700 },
                "action": {
                    "type": "postback",
                    "label": "練習打卡",
                    "data": "action=practice_checkin",
                    "displayText": "我要練習打卡"
                }
            },
            # 下排右: 繳費情形
            {
                "bounds": { "x": 1667, "y": 986, "width": 833, "height": 700 },
                "action": {
                    "type": "uri",
                    "label": "繳費情形",
                    "uri": f"https://liff.line.me/{LIFF_ID}/src/test_uiredesign/student_schedule.html"
                }
            }
        ]
    }

    # 3. 定義 Page 2 (More) 結構 (2500x1686)
    page2_config = {
        "size": { "width": 2500, "height": 1686 },
        "selected": False,
        "name": "MusiMate_Page_2",
        "chatBarText": "更多功能",
        "areas": [
            # 頂部切換回第一頁 (左側 MY MusiMate)
            {
                "bounds": { "x": 0, "y": 0, "width": 1250, "height": 286 },
                "action": {
                    "type": "richmenuswitch",
                    "richMenuAliasId": ALIAS_PAGE1,
                    "data": "action=switch_to_page1"
                }
            },
            # 上排左: 開始新課程
            {
                "bounds": { "x": 0, "y": 286, "width": 833, "height": 700 },
                "action": {
                    "type": "uri",
                    "label": "開始新課程",
                    "uri": f"https://liff.line.me/{LIFF_ID}/src/newclass/oldstudent_newclass.html"
                }
            },
            # 上排中: 分享MusiMate
            {
                "bounds": { "x": 833, "y": 286, "width": 834, "height": 700 },
                "action": {
                    "type": "uri",
                    "label": "分享MusiMate",
                    "uri": f"https://liff.line.me/{LIFF_ID}/index.html"
                }
            },
            # 上排右: 音樂社群(待開發)
            {
                "bounds": { "x": 1667, "y": 286, "width": 833, "height": 700 },
                "action": {
                    "type": "message",
                    "label": "音樂社群(待開發)",
                    "text": "🎵 MusiMate 音樂社群正在全力開發中，敬請期待！"
                }
            },
            # 下排左: 扣款申訴
            {
                "bounds": { "x": 0, "y": 986, "width": 833, "height": 700 },
                "action": {
                    "type": "uri",
                    "label": "扣款申訴",
                    "uri": f"https://liff.line.me/{LIFF_ID}/src/test_uiredesign/student_schedule.html"
                }
            },
            # 下排中: 聯繫系統客服
            {
                "bounds": { "x": 833, "y": 986, "width": 834, "height": 700 },
                "action": {
                    "type": "postback",
                    "label": "聯繫系統客服",
                    "data": "action=contact_support",
                    "displayText": "我想聯繫系統客服"
                }
            },
            # 下排右: FAQ
            {
                "bounds": { "x": 1667, "y": 986, "width": 833, "height": 700 },
                "action": {
                    "type": "uri",
                    "label": "FAQ",
                    "uri": f"https://liff.line.me/{LIFF_ID}/index.html"
                }
            }
        ]
    }

    print("[2/6] 建立 Page 1 選單結構...")
    p1_id = create_rich_menu(page1_config)
    print(f"  -> Page 1 ID: {p1_id}")

    print("[3/6] 建立 Page 2 選單結構...")
    p2_id = create_rich_menu(page2_config)
    print(f"  -> Page 2 ID: {p2_id}")

    print("[4/6] 上傳選單圖片...")
    upload_image(p1_id, PAGE1_IMAGE_PATH)
    print("  -> Page 1 圖片上傳成功！")
    upload_image(p2_id, PAGE2_IMAGE_PATH)
    print("  -> Page 2 圖片上傳成功！")

    print("[5/6] 綁定切換別名 (Rich Menu Alias)...")
    create_alias(p1_id, ALIAS_PAGE1)
    create_alias(p2_id, ALIAS_PAGE2)
    print("  -> 別名綁定完成！")

    print("[6/6] 設定 Page 1 為全體預設選單...")
    set_default_menu(p1_id)
    print("  -> 預設選單設定完成！")

    print("\n" + "="*60)
    print("🎉 全部設定完成！雙分頁 Rich Menu 已成功發佈至 LINE 官方伺服器！")
    print("="*60)
    print("📱 手機端圖片即時更新秘訣：")
    print("1. 關閉手機 LINE 官方帳號聊天室後重新進入。")
    print("2. 或在聊天室發送任意一則文字（例如輸入「1」或傳送貼圖）。")
    print("3. 或點擊聊天框左下角的「鍵盤」小圖示收合/展開選單 2 次，即可強制手機刷新快取！")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
