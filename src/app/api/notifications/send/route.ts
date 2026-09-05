import { NextResponse } from 'next/server';
import { NOTIFICATION_SCENARIOS } from '@/lib/lineFlexTemplates';

const LINE_CHANNEL_ACCESS_TOKEN =
  process.env.LINE_CHANNEL_ACCESS_TOKEN ||
  '4P6wRAmmAqc+bN1bN0loO8cAVzHhb5fsWWiGzBUFl/k+vrAHTrTHFDsBm4mLKtNgRF6ghQr9E3nbHVXuZdRDtoE1Cixcz5vzKopcLd/MeUiOY/Pv5VMoQ5Csg0H9T8N0yJ85TGJd2ERsUiImkusS/wdB04t89/1O/w1cDnyilFU=';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { scenarioId, customData, targetUserId, isBroadcast } = body;

    const scenario = NOTIFICATION_SCENARIOS[scenarioId];
    if (!scenario) {
      return NextResponse.json(
        { success: false, error: `找不到情境編號: ${scenarioId}` },
        { status: 400 }
      );
    }

    const payloadData = { ...scenario.defaultData, ...customData };
    const flexBubble = scenario.generateFlex(payloadData);

    const flexMessage = {
      type: 'flex',
      altText: `【MusiMate ${scenario.categoryName}】${scenario.title}`,
      contents: flexBubble,
    };

    // 若指定推播給真實 LINE 用戶
    if (targetUserId) {
      const response = await fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          to: targetUserId,
          messages: [flexMessage],
        }),
      });

      const resJson = await response.json().catch(() => ({}));

      if (!response.ok) {
        return NextResponse.json(
          {
            success: false,
            error: resJson.message || 'LINE API 推播失敗',
            details: resJson,
          },
          { status: response.status }
        );
      }

      return NextResponse.json({
        success: true,
        message: `成功推播「${scenario.title}」卡片至 LINE 用戶！`,
        targetUserId,
        flexMessage,
      });
    }

    // 若指定廣播
    if (isBroadcast) {
      const response = await fetch('https://api.line.me/v2/bot/message/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          messages: [flexMessage],
        }),
      });

      const resJson = await response.json().catch(() => ({}));

      if (!response.ok) {
        return NextResponse.json(
          {
            success: false,
            error: resJson.message || 'LINE 廣播失敗',
            details: resJson,
          },
          { status: response.status }
        );
      }

      return NextResponse.json({
        success: true,
        message: `成功全體廣播「${scenario.title}」卡片！`,
        flexMessage,
      });
    }

    // 若未指定 targetUserId，回傳產生的 Flex Message JSON (用於模擬或複製)
    return NextResponse.json({
      success: true,
      message: `成功生成「${scenario.title}」Flex Message JSON`,
      scenario: {
        id: scenario.id,
        title: scenario.title,
        category: scenario.category,
        categoryName: scenario.categoryName,
      },
      flexMessage,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || '伺服器內部錯誤' },
      { status: 500 }
    );
  }
}
