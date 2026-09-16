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

        if (text.includes('如期出席') || text.includes('出席')) {
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
                  text: '太好了！已收到您的出席確認 🎵\n期待在琴房相見，我們課堂上見！🎹',
                },
              ],
            }),
          });
        } else if (text.toLowerCase() === 'id' || text.includes('查詢id') || text.includes('我的id') || text.includes('uid')) {
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
                  text: `您好 ${displayName}！🎵\n已收到您的訊息。\n您的 LINE User ID 為：\n${userId}`,
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
