import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `
你是一位專業且溫暖的音樂教學秘書 (Professional & Warm Music Pedagogy Assistant)。
你的任務是處理老師在課堂上的口頭對話轉譯文本 (raw_transcript)。

請嚴格遵守以下過濾與整理規則：
1. 角色：專業且溫暖的音樂教學秘書。
2. 嚴格過濾掉情緒化字眼、批評/罵學生、無關笑話與私生活雜談（例如：「你又沒練習」、「昨天我貓病了」、「真是不聽話」等一律刪除）。
3. 僅萃取：「本週修正技術（手型/弓法/觸鍵/呼吸/姿勢）」、「樂理重點（拍子/調性/表情符號）」、「回家作業與練習 BPM 建議」。
4. 必須嚴格輸出 JSON 格式，不得包含額外的 Markdown 標記或開場白：
{
  "highlights": ["本週學習亮點與優點1", "..."],
  "technical_tips": ["技術修正細節1", "..."],
  "homework": ["回家作業與練習指引1", "..."],
  "encouragement": "一句充滿力量與溫暖的課後鼓勵語",
  "bpm_recommendation": 72
}
`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { raw_transcript } = body;

    if (!raw_transcript || typeof raw_transcript !== 'string') {
      return NextResponse.json(
        { error: 'Invalid payload: raw_transcript is required' },
        { status: 400 }
      );
    }

    // Mock LLM Processing with Rule-based Emotion Cleansing Parser
    // In production, this calls OpenAI / Anthropic / Gemini via SDK
    const rawLower = raw_transcript.toLowerCase();

    // Extract BPM from transcript if mentioned (e.g. "BPM 72" or "72 拍")
    const bpmMatch = raw_transcript.match(/bpm\s*(\d+)/i) || raw_transcript.match(/(\d+)\s*拍/);
    const detectedBpm = bpmMatch ? parseInt(bpmMatch[1], 10) : 72;

    // Filter out emotional / irrelevant keywords
    // E.g., filter out gossip, cat talk, harsh scolding
    const cleanedHighlights: string[] = [];
    const cleanedTips: string[] = [];
    const cleanedHomework: string[] = [];

    if (raw_transcript.includes('巴哈') || raw_transcript.includes('徹爾尼') || raw_transcript.includes('顆粒感')) {
      cleanedHighlights.push('右手高音區顆粒感顯著進步，手指獨立性佳');
      cleanedHighlights.push('曲目整體聲部線條清晰，視奏與音樂性良好');
    } else {
      cleanedHighlights.push('課堂展現積極學習態度，觸鍵音色建立完整');
    }

    if (raw_transcript.includes('左手') || raw_transcript.includes('伴奏') || raw_transcript.includes('手腕')) {
      cleanedTips.push('左手伴奏和弦觸鍵放輕，以手腕自然呼吸帶動，避免手臂下壓過重。');
    }
    if (raw_transcript.includes('掌關節') || raw_transcript.includes('指法') || raw_transcript.includes('觸鍵') || raw_transcript.includes('右手')) {
      cleanedTips.push('掌關節保持穩定支撐拱形，指尖垂直落鍵確保快速音群顆粒分明。');
    } else {
      cleanedTips.push('手腕保持彈性放鬆，隨旋律音型自然微幅呼吸起伏。');
    }

    if (raw_transcript.includes('十六分音符') || raw_transcript.includes('拍子') || raw_transcript.includes('搶拍')) {
      cleanedTips.push('樂理重點：注意主從和聲平衡與十六分音符拍點均勻度。');
    }

    if (raw_transcript.includes('小節') || raw_transcript.includes('練習') || raw_transcript.includes('作業')) {
      cleanedHomework.push(`徹爾尼 599 第 20 首：配合節拍器由 BPM ${detectedBpm} 慢練 10 次`);
      cleanedHomework.push(`巴哈初步第 3 首：雙手分開單獨練習前 4 小節，熟記指法與對位`);
    } else {
      cleanedHomework.push(`每天練習 20 分鐘，重點加強弱拍伴奏手腕放鬆度`);
      cleanedHomework.push(`使用節拍器設定 BPM ${detectedBpm} 穩固基礎節拍`);
    }

    const cleanSummaryJSON = {
      highlights: cleanedHighlights,
      technical_tips: cleanedTips,
      homework: cleanedHomework,
      encouragement: '每一次的觸鍵都是音樂感的累積，右手顆粒感的進步非常亮眼！繼續加油！',
      bpm_recommendation: detectedBpm,
    };

    return NextResponse.json({
      success: true,
      system_prompt_used: SYSTEM_PROMPT.trim(),
      raw_transcript_received: raw_transcript,
      clean_summary_json: cleanSummaryJSON,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
