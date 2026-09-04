import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 全組統一 Demo 學生 (劉心悅) 課堂紀錄備用模型 (保證即使 Supabase 尚未建表也能 100% 穩定展示)
const FALLBACK_LESSONS = [
  {
    id: 'lesson-1',
    appointment_id: 'app-lin-past-1',
    audio_url: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg',
    raw_transcript:
      '今天練習整體音高表現不錯，但是到了第24小節換指的地方右手姿勢太緊繃了，導致聲音有點乾硬。樂理部分要特別注意十六分音符的拍子，不要搶拍！回家作業請把第16到32小節用 BPM 72 慢練10遍，把音準跟弓法拉平順。加油！你這周進步很多！',
    clean_summary_json: {
      highlights: ['音高控制穩定', '讀譜速度提升明顯'],
      technical_tips: [
        '右手持弓姿勢注意放鬆，避免過度緊繃，以保持弓速的流暢度與琴弦共鳴。',
        '左手第二指按弦精準度，在高把位轉換時應維持指尖垂直落指，防止音準偏低。',
      ],
      theory_tips: [
        '注意十六分音符的均勻度，切分音符需準確踩在拍點上，不能隨意搶拍。',
        'E大調升分號 (C#) 的按弦位置需特別貼近一指，維持半音關係精準度。',
      ],
      homework: [
        '第15至32小節慢速練習並分段重複10次',
        '錄製一段節拍器輔助的穩定演奏音訊供批改',
        '熟記第一樂章前奏的左手把位指法與弓法',
      ],
      encouragement: '每一次的練習都是進步的累積，老師看到你的努力了！',
      bpm_recommendation: 72,
    },
    created_at: '2026-08-15T10:00:00+08:00',
    song_title: '巴哈：E大調小提琴協奏曲 第一樂章',
    teacher_name: '張老師',
  },
  {
    id: 'lesson-2',
    appointment_id: 'app-lin-past-2',
    audio_url: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg',
    raw_transcript: '今天進行了踏板延音練習與琶音流暢度訓練，整體彈奏節奏掌握得很好。',
    clean_summary_json: {
      highlights: ['踏板切換時機精準', '右手琶音音色均勻'],
      technical_tips: [
        '注意左手伴奏觸鍵輕巧，手腕避免過度下沉以減輕手部負擔。',
        '第48小節強弱對比需更加鮮明，高潮段落注意肩膀放鬆。',
      ],
      theory_tips: [
        '降E大調轉調段落和聲走向需清楚呈現主音穩定度。',
        '裝飾音要輕快俐落，勿佔用主音符拍長。',
      ],
      homework: [
        '每日琶音練習20分鐘並以節拍器校對',
        '全曲完整背譜並錄製第32-64小節影音',
      ],
      encouragement: '手指獨立性大有進步，旋律線條非常優美！加油！',
      bpm_recommendation: 80,
    },
    created_at: '2026-08-19T10:00:00+08:00',
    song_title: '蕭邦：降E大調夜曲 Op.9 No.2',
    teacher_name: '張老師',
  },
  {
    id: 'lesson-3',
    appointment_id: 'app-lin-1',
    audio_url: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg',
    raw_transcript: '今天重點在於月光第三樂章的狂暴氣勢與連續琶音，整體指法與爆發力都做得非常好。',
    clean_summary_json: {
      highlights: ['急板節奏控制極佳', '左手低音清晰紮實'],
      technical_tips: [
        '主和弦強音著地時肩膀放鬆避免聳肩，藉助重力自然落鍵。',
        '注意中段漸強的音量推進層次，避免過早達到最大音量。',
      ],
      theory_tips: [
        '升C小調調性重音需落於第一拍，維持強烈的戲劇張力。',
        '切分節奏點避免搶拍，手腕隨呼吸彈性調適。',
      ],
      homework: [
        '第 1-32 小節重音加強練習，分組連音慢練5次',
        '每日左手單獨練習 15 分鐘確保觸鍵顆粒分明',
      ],
      encouragement: '月光第三樂章的狂暴氣勢有充分展現出來，彈奏極具張力！加油！',
      bpm_recommendation: 132,
    },
    created_at: '2026-08-26T10:00:00+08:00',
    song_title: '貝多芬：第十四號鋼琴奏鳴曲《月光》第三樂章',
    teacher_name: '張老師',
  },
  {
    id: 'lesson-4',
    appointment_id: 'app-lin-2',
    audio_url: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg',
    raw_transcript: '今天進行莫札特小提琴協奏曲的換把位練習，第一把位換至第三把位平順很多。',
    clean_summary_json: {
      highlights: ['第一樂章開頭主題音準精確', '揉弦頻率自然均勻'],
      technical_tips: [
        '第三把位換至第一把位時大拇指保持鬆弛滑移，防止虎口緊掐琴頸。',
        '跳弓部分弓根力量要均勻，依靠弓桿天然彈性起跳。',
      ],
      theory_tips: [
        'G大調自然音階半音關係注意升F音位置。',
        '古典時期典雅樂句收尾需做輕柔收音（diminuendo）。',
      ],
      homework: [
        '換把位音階慢練 5 遍，注意拇指放鬆',
        '第 45-60 小節跳弓慢練，錄製 1 分鐘音訊',
      ],
      encouragement: '莫札特的優雅韻味掌握得相當出色，音色純淨！加油！',
      bpm_recommendation: 96,
    },
    created_at: '2026-08-29T15:30:00+08:00',
    song_title: '莫札特：G大調第三號小提琴協奏曲 第一樂章',
    teacher_name: '張老師',
  },
  {
    id: 'lesson-5',
    appointment_id: 'app-lin-3',
    audio_url: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg',
    raw_transcript: '今天彈奏德布西月光，弱音觸鍵與色彩表現非常有進步，意境很棒。',
    clean_summary_json: {
      highlights: ['弱音觸鍵細膩動人', '九八拍複合拍子律動自然'],
      technical_tips: [
        '中段高潮處低音踏板及時更換避免混濁，留住乾淨泛音。',
        '琶音聲部像流水般流動，手腕帶動手指輕拂琴鍵。',
      ],
      theory_tips: [
        '降D大調黑鍵手型維持微拱，指尖垂直落指。',
        '注意九八拍大三連音拍點重音分佈。',
      ],
      homework: [
        '全曲踏板乾淨度訓練，慢速背譜彈奏',
        '專注第 27-36 小節雙音色彩層次練習 8 次',
      ],
      encouragement: '印象派的朦朧色彩與詩意表現得非常好，聽得出用心投入的感情！加油！',
      bpm_recommendation: 54,
    },
    created_at: '2026-09-02T10:00:00+08:00',
    song_title: '德布西：《貝加馬斯克組曲》第三首〈月光〉',
    teacher_name: '張老師',
  },
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // 嘗試向 Supabase 查詢 public.lesson_records
    const { data, error } = await supabase
      .from('lesson_records')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!error && data) {
      return NextResponse.json({
        success: true,
        data,
        source: 'supabase',
      });
    }

    // 若 Supabase 缺少該表或查無資料，回退至 Demo 展示模型
    const fallback =
      FALLBACK_LESSONS.find((l) => l.id === id || l.appointment_id === id) ||
      FALLBACK_LESSONS[0];

    return NextResponse.json({
      success: true,
      data: fallback,
      all_lessons: FALLBACK_LESSONS.map((l) => ({
        id: l.id,
        song_title: l.song_title,
        created_at: l.created_at,
      })),
      source: 'fallback_model',
      notice: error
        ? `Supabase 表或資料未建立 (${error.message})，自動由前端備用模型支援展示。`
        : undefined,
    });
  } catch (err: any) {
    const fallback = FALLBACK_LESSONS[0];
    return NextResponse.json({
      success: true,
      data: fallback,
      all_lessons: FALLBACK_LESSONS.map((l) => ({
        id: l.id,
        song_title: l.song_title,
        created_at: l.created_at,
      })),
      source: 'fallback_model',
      error: err.message,
    });
  }
}
