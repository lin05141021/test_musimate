import { NextResponse } from 'next/server';
import { NOTIFICATION_SCENARIOS } from '@/lib/lineFlexTemplates';

const LINE_CHANNEL_ACCESS_TOKEN =
  process.env.LINE_CHANNEL_ACCESS_TOKEN ||
  '4P6wRAmmAqc+bN1bN0loO8cAVzHhb5fsWWiGzBUFl/k+vrAHTrTHFDsBm4mLKtNgRF6ghQr9E3nbHVXuZdRDtoE1Cixcz5vzKopcLd/MeUiOY/Pv5VMoQ5Csg0H9T8N0yJ85TGJd2ERsUiImkusS/wdB04t89/1O/w1cDnyilFU=';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const events = body.events || [];

    for (const event of events) {
      const replyToken = event.replyToken;
      const userId = event.source?.userId;

      // 取得使用者個人檔案 (暱稱、頭像)
      let displayName = '學員朋友';
      if (userId) {
        try {
          const profileRes = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
            headers: { Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` },
          });
          if (profileRes.ok) {
            const profile = await profileRes.json();
            displayName = profile.displayName || displayName;
          }
        } catch (e) {
          console.warn('無法取得 LINE User Profile:', e);
        }
      }

      console.log(`📩 [LINE Webhook] 收到事件: Type=${event.type}, UserID=${userId}, Name=${displayName}`);

      if (!replyToken) continue;

      // 1. 處理關注 (加入好友 / 掃描 QR Code)
      if (event.type === 'follow') {
        const welcomeScenario = NOTIFICATION_SCENARIOS['WELCOME'];
        if (welcomeScenario) {
          const flexBubble = welcomeScenario.generateFlex({ user_name: displayName });
          try {
            const replyRes = await fetch('https://api.line.me/v2/bot/message/reply', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
              },
              body: JSON.stringify({
                replyToken,
                messages: [
                  {
                    type: 'flex',
                    altText: `【MusiMate】歡迎 ${displayName} 加入 MusiMate :)`,
                    contents: flexBubble,
                  },
                ],
              }),
            });
            const replyText = await replyRes.text();
            console.log(`📤 [LINE Follow Welcome] Reply Status: ${replyRes.status}, Body: ${replyText}`);

            // 若 Reply 失敗且有 userId，啟動 Push 保底機制
            if (!replyRes.ok && userId) {
              const pushRes = await fetch('https://api.line.me/v2/bot/message/push', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
                },
                body: JSON.stringify({
                  to: userId,
                  messages: [
                    {
                      type: 'flex',
                      altText: `【MusiMate】歡迎 ${displayName} 加入 MusiMate :)`,
                      contents: flexBubble,
                    },
                  ],
                }),
              });
              const pushText = await pushRes.text();
              console.log(`📤 [LINE Follow Welcome Fallback Push] Status: ${pushRes.status}, Body: ${pushText}`);
            }
          } catch (replyErr) {
            console.error('❌ [LINE Follow Welcome Error]:', replyErr);
          }
        }
        continue;
      }

      // 2. 處理 Postback 動作 (例如 Rich Menu「聯繫系統客服」)
      if (event.type === 'postback') {
        const data = event.postback?.data || '';
        console.log(`📌 [LINE Postback] 來自 ${displayName}: "${data}"`);

        if (data.includes('contact_support') || data.includes('support') || data.includes('help')) {
          await fetch('https://api.line.me/v2/bot/message/reply', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
            },
            body: JSON.stringify({
              replyToken,
              messages: [
                {
                  type: 'flex',
                  altText: '【MusiMate 客服中心】聯絡資訊與服務專線',
                  contents: {
                    type: 'bubble',
                    size: 'mega',
                    header: {
                      type: 'box',
                      layout: 'vertical',
                      backgroundColor: '#FAF6F0',
                      paddingAll: '20px',
                      contents: [
                        {
                          type: 'text',
                          text: '🎧 MusiMate 系統客服中心',
                          weight: 'bold',
                          size: 'md',
                          color: '#2B3049',
                        },
                        {
                          type: 'text',
                          text: '如有排課、繳費、帳務或系統疑問，歡迎隨時洽詢：',
                          size: 'xs',
                          color: '#6F6F6F',
                          wrap: true,
                          margin: 'sm',
                        },
                      ],
                    },
                    body: {
                      type: 'box',
                      layout: 'vertical',
                      backgroundColor: '#FFFFFF',
                      paddingAll: '20px',
                      spacing: 'md',
                      contents: [
                        {
                          type: 'box',
                          layout: 'horizontal',
                          contents: [
                            { type: 'text', text: '📞 客服專線', size: 'xs', color: '#9CA3AF', flex: 3 },
                            { type: 'text', text: '(02) 2345-6789', size: 'sm', weight: 'bold', color: '#2B3049', flex: 5 },
                          ],
                        },
                        {
                          type: 'box',
                          layout: 'horizontal',
                          contents: [
                            { type: 'text', text: '✉️ 電子信箱', size: 'xs', color: '#9CA3AF', flex: 3 },
                            { type: 'text', text: 'info@rhythmmusic.tw', size: 'xs', weight: 'bold', color: '#2B3049', flex: 5, wrap: true },
                          ],
                        },
                        {
                          type: 'box',
                          layout: 'horizontal',
                          contents: [
                            { type: 'text', text: '⏰ 服務時間', size: 'xs', color: '#9CA3AF', flex: 3 },
                            { type: 'text', text: '週一至週五 09:00 - 21:00', size: 'xs', color: '#2B3049', flex: 5, wrap: true },
                          ],
                        },
                        {
                          type: 'box',
                          layout: 'horizontal',
                          contents: [
                            { type: 'text', text: '📍 工作室地址', size: 'xs', color: '#9CA3AF', flex: 3 },
                            { type: 'text', text: '台北市大安區音樂文創路 88 號 2 樓', size: 'xs', color: '#2B3049', flex: 5, wrap: true },
                          ],
                        },
                      ],
                    },
                    footer: {
                      type: 'box',
                      layout: 'horizontal',
                      spacing: 'sm',
                      paddingAll: '16px',
                      backgroundColor: '#FAF6F0',
                      contents: [
                        {
                          type: 'button',
                          style: 'primary',
                          color: '#CEAB98',
                          height: 'sm',
                          action: {
                            type: 'uri',
                            label: '撥打電話',
                            uri: 'tel:0223456789',
                          },
                        },
                        {
                          type: 'button',
                          style: 'secondary',
                          height: 'sm',
                          action: {
                            type: 'uri',
                            label: '查看 FAQ',
                            uri: 'https://liff.line.me/2011164851-lGsEnQWB?redirect=/student/faq',
                          },
                        },
                      ],
                    },
                  },
                },
              ],
            }),
          });
          continue;
        }
      }

      // 3. 處理使用者發送文字訊息
      if (event.type === 'message' && event.message?.type === 'text') {
        const text = event.message.text.trim();
        console.log(`💬 [LINE Message] 來自 ${displayName} (${userId}): "${text}"`);

        if (text.includes('客服') || text.includes('聯繫') || text.includes('聯絡') || text.includes('專線') || text.includes('contact')) {
          await fetch('https://api.line.me/v2/bot/message/reply', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
            },
            body: JSON.stringify({
              replyToken,
              messages: [
                {
                  type: 'flex',
                  altText: '【MusiMate 客服中心】聯絡資訊與服務專線',
                  contents: {
                    type: 'bubble',
                    size: 'mega',
                    header: {
                      type: 'box',
                      layout: 'vertical',
                      backgroundColor: '#FAF6F0',
                      paddingAll: '20px',
                      contents: [
                        {
                          type: 'text',
                          text: '🎧 MusiMate 系統客服中心',
                          weight: 'bold',
                          size: 'md',
                          color: '#2B3049',
                        },
                        {
                          type: 'text',
                          text: '如有排課、繳費、帳務或系統疑問，歡迎隨時洽詢：',
                          size: 'xs',
                          color: '#6F6F6F',
                          wrap: true,
                          margin: 'sm',
                        },
                      ],
                    },
                    body: {
                      type: 'box',
                      layout: 'vertical',
                      backgroundColor: '#FFFFFF',
                      paddingAll: '20px',
                      spacing: 'md',
                      contents: [
                        {
                          type: 'box',
                          layout: 'horizontal',
                          contents: [
                            { type: 'text', text: '📞 客服專線', size: 'xs', color: '#9CA3AF', flex: 3 },
                            { type: 'text', text: '(02) 2345-6789', size: 'sm', weight: 'bold', color: '#2B3049', flex: 5 },
                          ],
                        },
                        {
                          type: 'box',
                          layout: 'horizontal',
                          contents: [
                            { type: 'text', text: '✉️ 電子信箱', size: 'xs', color: '#9CA3AF', flex: 3 },
                            { type: 'text', text: 'info@rhythmmusic.tw', size: 'xs', weight: 'bold', color: '#2B3049', flex: 5, wrap: true },
                          ],
                        },
                        {
                          type: 'box',
                          layout: 'horizontal',
                          contents: [
                            { type: 'text', text: '⏰ 服務時間', size: 'xs', color: '#9CA3AF', flex: 3 },
                            { type: 'text', text: '週一至週五 09:00 - 21:00', size: 'xs', color: '#2B3049', flex: 5, wrap: true },
                          ],
                        },
                        {
                          type: 'box',
                          layout: 'horizontal',
                          contents: [
                            { type: 'text', text: '📍 工作室地址', size: 'xs', color: '#9CA3AF', flex: 3 },
                            { type: 'text', text: '台北市大安區音樂文創路 88 號 2 樓', size: 'xs', color: '#2B3049', flex: 5, wrap: true },
                          ],
                        },
                      ],
                    },
                    footer: {
                      type: 'box',
                      layout: 'horizontal',
                      spacing: 'sm',
                      paddingAll: '16px',
                      backgroundColor: '#FAF6F0',
                      contents: [
                        {
                          type: 'button',
                          style: 'primary',
                          color: '#CEAB98',
                          height: 'sm',
                          action: {
                            type: 'uri',
                            label: '撥打電話',
                            uri: 'tel:0223456789',
                          },
                        },
                        {
                          type: 'button',
                          style: 'secondary',
                          height: 'sm',
                          action: {
                            type: 'uri',
                            label: '查看 FAQ',
                            uri: 'https://liff.line.me/2011164851-lGsEnQWB?redirect=/student/faq',
                          },
                        },
                      ],
                    },
                  },
                },
              ],
            }),
          });
          continue;
        }

        // 課表查詢相關關鍵字
        if (text.includes('課表') || text.includes('排課') || text.includes('上課時間') || text.includes('我的課')) {
          await fetch('https://api.line.me/v2/bot/message/reply', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
            },
            body: JSON.stringify({
              replyToken,
              messages: [
                {
                  type: 'flex',
                  altText: `【MusiMate 課表查詢】${displayName} 的專屬上課課表`,
                  contents: {
                    type: 'bubble',
                    size: 'mega',
                    header: {
                      type: 'box',
                      layout: 'vertical',
                      backgroundColor: '#CEAB98',
                      paddingAll: '18px',
                      contents: [
                        {
                          type: 'text',
                          text: '📅 我的專屬課表',
                          weight: 'bold',
                          size: 'lg',
                          color: '#FFFFFF',
                        },
                        {
                          type: 'text',
                          text: `${displayName} 同學 · 古典鋼琴個別課`,
                          size: 'xs',
                          color: '#FFFFFFCC',
                          margin: 'xs',
                        },
                      ],
                    },
                    body: {
                      type: 'box',
                      layout: 'vertical',
                      backgroundColor: '#FFFFFF',
                      paddingAll: '20px',
                      spacing: 'md',
                      contents: [
                        {
                          type: 'box',
                          layout: 'horizontal',
                          contents: [
                            { type: 'text', text: '👩‍🏫 指導教師', size: 'sm', color: '#7A7E90', flex: 4 },
                            { type: 'text', text: '林佩芬 老師', size: 'sm', weight: 'bold', color: '#2B3049', flex: 6 },
                          ],
                        },
                        {
                          type: 'box',
                          layout: 'horizontal',
                          contents: [
                            { type: 'text', text: '📊 本期進度', size: 'sm', color: '#7A7E90', flex: 4 },
                            { type: 'text', text: '第 3 期進行中 (7/10 堂)', size: 'sm', weight: 'bold', color: '#CEAB98', flex: 6 },
                          ],
                        },
                        {
                          type: 'box',
                          layout: 'horizontal',
                          contents: [
                            { type: 'text', text: '⏰ 下次上課', size: 'sm', color: '#7A7E90', flex: 4 },
                            { type: 'text', text: '09/16 (二) 19:00-21:00', size: 'sm', weight: 'bold', color: '#2B3049', flex: 6 },
                          ],
                        },
                        {
                          type: 'box',
                          layout: 'horizontal',
                          contents: [
                            { type: 'text', text: '📍 上課地點', size: 'sm', color: '#7A7E90', flex: 4 },
                            { type: 'text', text: '音符琴房 A303', size: 'sm', color: '#2B3049', flex: 6 },
                          ],
                        },
                      ],
                    },
                    footer: {
                      type: 'box',
                      layout: 'vertical',
                      spacing: 'sm',
                      paddingAll: '16px',
                      backgroundColor: '#FAF6F0',
                      contents: [
                        {
                          type: 'button',
                          style: 'primary',
                          color: '#CEAB98',
                          height: 'sm',
                          action: {
                            type: 'uri',
                            label: '📅 打開完整課表 / 請假調課',
                            uri: 'https://liff.line.me/2011164851-lGsEnQWB?redirect=/student/schedule',
                          },
                        },
                      ],
                    },
                  },
                },
              ],
            }),
          });
          continue;
        }

        // 出席確認相關關鍵字
        if (
          text.includes('如期出席') ||
          text.includes('出席') ||
          text.includes('會出席') ||
          text.includes('我會到') ||
          text.includes('報到') ||
          text.includes('上課見') ||
          text.includes('準時到')
        ) {
          await fetch('https://api.line.me/v2/bot/message/reply', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
            },
            body: JSON.stringify({
              replyToken,
              messages: [
                {
                  type: 'text',
                  text: `太好了！林佩芬老師已收到您的出席確認 🎵\n期待在琴房相見，我們課堂上見！🎹\n\n📍 上課地點：音符音樂教室 A303 琴房\n💡 請記得攜帶本週教材《徹爾尼 599》喔！`,
                },
              ],
            }),
          });
          continue;
        }

        // 聯絡簿相關關鍵字
        if (text.includes('聯絡簿') || text.includes('週報') || text.includes('作業') || text.includes('評語')) {
          await fetch('https://api.line.me/v2/bot/message/reply', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
            },
            body: JSON.stringify({
              replyToken,
              messages: [
                {
                  type: 'flex',
                  altText: `【MusiMate 智慧聯絡簿】${displayName} 的最新課堂週報`,
                  contents: {
                    type: 'bubble',
                    size: 'mega',
                    header: {
                      type: 'box',
                      layout: 'vertical',
                      backgroundColor: '#D5CC6A',
                      paddingAll: '18px',
                      contents: [
                        { type: 'text', text: '📖 AI 課後智慧聯絡簿', weight: 'bold', size: 'lg', color: '#FFFFFF' },
                        { type: 'text', text: '林佩芬 老師 · 課堂音訊與教材 AI 診斷', size: 'xs', color: '#FFFFFFCC', margin: 'xs' },
                      ],
                    },
                    body: {
                      type: 'box',
                      layout: 'vertical',
                      backgroundColor: '#FFFFFF',
                      paddingAll: '20px',
                      spacing: 'sm',
                      contents: [
                        { type: 'text', text: '本週教學曲目：《徹爾尼 599》第 20 首、《巴哈初步》第 3 首', size: 'sm', color: '#2B3049', weight: 'bold', wrap: true },
                        { type: 'text', text: '「心悅在右手高音區顆粒感極佳，換指過渡均勻！請維持這個手型配合節拍器慢練。」', size: 'xs', color: '#6F6F6F', wrap: true, margin: 'sm' },
                      ],
                    },
                    footer: {
                      type: 'box',
                      layout: 'vertical',
                      paddingAll: '16px',
                      backgroundColor: '#FAF6F0',
                      contents: [
                        {
                          type: 'button',
                          style: 'primary',
                          color: '#C58D34',
                          height: 'sm',
                          action: {
                            type: 'uri',
                            label: '📖 查看完整聯絡簿與錄音',
                            uri: 'https://liff.line.me/2011164851-lGsEnQWB?redirect=/student/summary/lesson-7',
                          },
                        },
                      ],
                    },
                  },
                },
              ],
            }),
          });
          continue;
        }

        // 練琴打卡相關關鍵字
        if (text.includes('練琴') || text.includes('打卡') || text.includes('錄音')) {
          await fetch('https://api.line.me/v2/bot/message/reply', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
            },
            body: JSON.stringify({
              replyToken,
              messages: [
                {
                  type: 'flex',
                  altText: `【MusiMate 練琴打卡】15 秒錄音 AI 診斷`,
                  contents: {
                    type: 'bubble',
                    size: 'mega',
                    header: {
                      type: 'box',
                      layout: 'vertical',
                      backgroundColor: '#68C5AB',
                      paddingAll: '18px',
                      contents: [
                        { type: 'text', text: '🎹 15 秒自主練琴打卡', weight: 'bold', size: 'lg', color: '#FFFFFF' },
                        { type: 'text', text: '每日錄音打卡累積印章與 AI 即時評分', size: 'xs', color: '#FFFFFFCC', margin: 'xs' },
                      ],
                    },
                    body: {
                      type: 'box',
                      layout: 'vertical',
                      backgroundColor: '#FFFFFF',
                      paddingAll: '20px',
                      spacing: 'sm',
                      contents: [
                        { type: 'text', text: `目前連續打卡：7 天 · 累積印章：18 / 20 格`, size: 'sm', color: '#2B3049', weight: 'bold' },
                        { type: 'text', text: '今日練習目標：《徹爾尼 599》第 20 首（BPM 80 慢練）', size: 'xs', color: '#6F6F6F' },
                      ],
                    },
                    footer: {
                      type: 'box',
                      layout: 'vertical',
                      paddingAll: '16px',
                      backgroundColor: '#FAF6F0',
                      contents: [
                        {
                          type: 'button',
                          style: 'primary',
                          color: '#49BB87',
                          height: 'sm',
                          action: {
                            type: 'uri',
                            label: '🎹 立即開啟錄音打卡',
                            uri: 'https://liff.line.me/2011164851-lGsEnQWB?redirect=/student/practice',
                          },
                        },
                      ],
                    },
                  },
                },
              ],
            }),
          });
          continue;
        }

        // 繳費對帳相關關鍵字
        if (text.includes('繳費') || text.includes('學費') || text.includes('匯款') || text.includes('對帳')) {
          await fetch('https://api.line.me/v2/bot/message/reply', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
            },
            body: JSON.stringify({
              replyToken,
              messages: [
                {
                  type: 'flex',
                  altText: `【MusiMate 學費對帳】第 4 期續約繳費通知`,
                  contents: {
                    type: 'bubble',
                    size: 'mega',
                    header: {
                      type: 'box',
                      layout: 'vertical',
                      backgroundColor: '#82AAD8',
                      paddingAll: '18px',
                      contents: [
                        { type: 'text', text: '💳 學費續約與對帳核銷', weight: 'bold', size: 'lg', color: '#FFFFFF' },
                        { type: 'text', text: `${displayName} 同學 · 第 4 期古典鋼琴 (10堂)`, size: 'xs', color: '#FFFFFFCC', margin: 'xs' },
                      ],
                    },
                    body: {
                      type: 'box',
                      layout: 'vertical',
                      backgroundColor: '#FFFFFF',
                      paddingAll: '20px',
                      spacing: 'sm',
                      contents: [
                        { type: 'text', text: '應繳金額：NT$ 8,000', size: 'md', weight: 'bold', color: '#2B3049' },
                        { type: 'text', text: '收款帳戶：台北富邦銀行 (012) 1234-5678-9012', size: 'xs', color: '#6F6F6F' },
                        { type: 'text', text: '完成轉帳後可截圖上傳，系統將自動以 OCR 智能核銷！', size: 'xs', color: '#82AAD8', margin: 'xs' },
                      ],
                    },
                    footer: {
                      type: 'box',
                      layout: 'vertical',
                      paddingAll: '16px',
                      backgroundColor: '#FAF6F0',
                      contents: [
                        {
                          type: 'button',
                          style: 'primary',
                          color: '#82AAD8',
                          height: 'sm',
                          action: {
                            type: 'uri',
                            label: '💳 上傳轉帳截圖核銷',
                            uri: 'https://liff.line.me/2011164851-lGsEnQWB?redirect=/student/billing',
                          },
                        },
                      ],
                    },
                  },
                },
              ],
            }),
          });
          continue;
        }

        if (text.toLowerCase() === 'id' || text.includes('查詢id') || text.includes('我的id') || text.includes('uid')) {
          await fetch('https://api.line.me/v2/bot/message/reply', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
            },
            body: JSON.stringify({
              replyToken,
              messages: [
                {
                  type: 'text',
                  text: `👋 您好 ${displayName}！\n您的 LINE User ID 為：\n${userId}\n\n已為您記錄並可用於專屬課堂推播！`,
                },
              ],
            }),
          });
        } else {
          // 一般文字訊息回覆，並帶上識別資訊
          await fetch('https://api.line.me/v2/bot/message/reply', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
            },
            body: JSON.stringify({
              replyToken,
              messages: [
                {
                  type: 'text',
                  text: `您好 ${displayName}！🎵\n您可以輸入「課表」、「出席」、「聯絡簿」、「打卡」或「繳費」快速獲取服務，或點擊下方功能選單直接開啟！`,
                },
              ],
            }),
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('LINE Webhook error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'MusiMate LINE Webhook is running.' });
}
