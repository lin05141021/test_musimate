import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const studentId = request.nextUrl.searchParams.get('student_id');

  const mockReports = [
    {
      id: 'lesson-7',
      lesson_id: 'app-lin-5',
      lesson_index: 7,
      lesson_title: '第 7 堂：徹爾尼 599 第 20 首 & 巴哈初步第 3 首',
      date: '2026/09/16',
      summary:
        '今日心悅彈徹爾尼 599 第 20 首，右手顆粒感進步很多，手指獨立性非常好。但第 12 小節左手和弦伴奏有點太重了，手腕要放鬆帶動，不要用力往下砸。',
      technique_tips: [
        '第 12 小節左手伴奏觸鍵偏重，請以放輕手腕自然呼吸帶動，避免手臂下壓用力。',
        '右手快速音群保持掌關節穩定拱形，指尖垂直觸鍵確保顆粒分明。',
        '注意主從和聲平衡：右手為主旋律、左手為背景和弦伴奏，兩手強弱需有明顯層次。',
      ],
      assignment: {
        song: '徹爾尼 599 第 20 首 & 巴哈初步第 3 首',
        target_bpm: 80,
        daily_minutes: 30,
      },
    },
    {
      id: 'lesson-6',
      lesson_id: 'app-lin-4',
      lesson_index: 6,
      lesson_title: '第 6 堂：莫札特 K.545 第一樂章 經典觸鍵',
      date: '2026/09/09',
      summary:
        '今日驗收莫札特 K.545 第一樂章，古典時期的典雅與活潑感詮釋得很到位。左手阿爾貝蒂低音 (Alberti bass) 伴奏要注意音量控制在 pp 到 p，烘托右手流暢的十六分音符音階。',
      technique_tips: [
        '左手 Alberti bass (5-1-3-1 指法) 旋轉手腕自然發力，大拇指切勿用力下砸。',
        '右手顫音 (Trill) 與裝飾音要均勻靈巧，利用指尖彈簧般的彈性落鍵。',
        '古典樂句的起伏原則：上行微漸強，下行微漸弱，句尾收音優雅。',
      ],
      assignment: {
        song: '莫札特：C大調鋼琴奏鳴曲 K.545 第一樂章',
        target_bpm: 96,
        daily_minutes: 30,
      },
    },
    {
      id: 'lesson-5',
      lesson_id: 'app-lin-3',
      lesson_index: 5,
      lesson_title: '第 5 堂：德布西《月光》 印象派弱音色彩',
      date: '2026/09/02',
      summary:
        '今日彈奏德布西月光，弱音觸鍵與色彩表現非常有進步，意境很棒。中段高潮處低音踏板及時更換避免混濁，留住乾淨泛音。琶音聲部像流水般流動，手腕帶動手指輕拂琴鍵。',
      technique_tips: [
        '中段高潮處低音踏板及時半踏更換避免混濁，留住純淨琴弦泛音。',
        '琶音聲部像流水般流動，手腕水平劃圓帶動手指指腹輕拂琴鍵。',
        '降 D 大調黑鍵手型維持微拱，指腹肉墊接觸琴鍵營造柔和音色。',
      ],
      assignment: {
        song: '德布西：《貝加馬斯克組曲》第三首〈月光〉',
        target_bpm: 54,
        daily_minutes: 30,
      },
    },
    {
      id: 'lesson-4',
      lesson_id: 'app-lin-2',
      lesson_index: 4,
      lesson_title: '第 4 堂：巴哈二聲部創意曲 No.1 複調對位',
      date: '2026/08/29',
      summary:
        '今日進行巴哈二聲部創意曲第一首的雙手獨立性訓練，左右手主題對答的清晰度進步很多。注意左手模仿主題時音量要與右手等重，指尖要站立彈出非連音 (non legato) 的清晰感。',
      technique_tips: [
        '左手模仿主題時指尖垂直站穩，彈出巴洛克時期特有的斷奏與清晰顆粒感。',
        '雙手同時彈奏不同節奏型態時，維持手腕水平穩定，切勿左右搖晃。',
        'C 大調二聲部對位結構解析，注意倒影模仿與轉位聲部。',
      ],
      assignment: {
        song: '巴哈：二聲部創意曲 No.1 C大調',
        target_bpm: 84,
        daily_minutes: 30,
      },
    },
    {
      id: 'lesson-3',
      lesson_id: 'app-lin-1',
      lesson_index: 3,
      lesson_title: '第 3 堂：貝多芬《月光》第三樂章 急板琶音',
      date: '2026/08/26',
      summary:
        '今日重點在於月光第三樂章的狂暴氣勢與連續琶音，整體指法與爆發力都做得非常好。主和弦強音著地時肩膀放鬆避免聳肩，藉助重力自然落鍵。',
      technique_tips: [
        '主和弦強音 (sfz) 著地時肩膀放鬆，藉助整條手臂的重力自然落鍵，防止手腕僵硬。',
        '連續上升琶音第 1 指 (大拇指) 轉指需提前穿過掌心，維持指尖靈敏度。',
        '升 C 小調調性重音需精準落於第一拍，維持強烈的戲劇張力。',
      ],
      assignment: {
        song: '貝多芬：第十四號鋼琴奏鳴曲《月光》第三樂章',
        target_bpm: 120,
        daily_minutes: 35,
      },
    },
    {
      id: 'lesson-2',
      lesson_id: 'app-lin-past-2',
      lesson_index: 2,
      lesson_title: '第 2 堂：蕭邦夜曲 Op.9 No.2 踏板與歌唱性',
      date: '2026/08/19',
      summary:
        '今日進行了踏板延音層次與左手和聲分解練習，整體彈奏節奏與歌唱性掌握得非常好。注意左手伴奏觸鍵要輕巧如水，不要搶過右手主旋律。',
      technique_tips: [
        '左手低音伴奏觸鍵輕巧柔和，手腕避免過度下沉，讓大姆指落鍵最輕。',
        '第 48 小節強弱對比 (p 到 f) 需更加鮮明，高潮段落利用手臂自然重量下沉。',
        '降 E 大調轉調段落和聲走向需清楚呈現主音穩定度。',
      ],
      assignment: {
        song: '蕭邦：降E大調夜曲 Op.9 No.2',
        target_bpm: 80,
        daily_minutes: 30,
      },
    },
    {
      id: 'lesson-1',
      lesson_id: 'app-lin-past-1',
      lesson_index: 1,
      lesson_title: '第 1 堂：車爾尼 Op.599 No.50 視奏與顆粒感',
      date: '2026/08/15',
      summary:
        '今日心悅在車爾尼 Op.599 的音準與指法掌握非常穩定，右手高音區觸鍵清晰具顆粒感。在踏板切換時需注意不要踩得太深，避免低音共鳴混濁。',
      technique_tips: [
        '右手第 4、5 指落指時掌關節需支撐站穩，避免塌陷以保持觸鍵清脆。',
        '手腕保持彈性放鬆，隨旋律音型自然微幅呼吸起伏，切勿聳肩。',
        '十六分音符節奏需均勻踩在拍點上，注意三連音轉分音的時值切換。',
      ],
      assignment: {
        song: '車爾尼 Op.599 No.50 & 哈農指法暖身',
        target_bpm: 72,
        daily_minutes: 25,
      },
    },
  ];

  return NextResponse.json({
    success: true,
    source: 'reports',
    data: mockReports,
  });
}
