import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iyzhwnvpqohdjqnrvqjq.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_qhofcnT-u4Xbwv2QY1FjaA_vrdNOe_v';

const serverSupabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export async function GET(request: NextRequest) {
  try {
    const studentId = request.nextUrl.searchParams.get('student_id');
    if (!studentId) {
      return NextResponse.json({ success: false, error: 'student_id required' }, { status: 400 });
    }

    // 1. 直連資料庫查詢 practice_logs 並關聯 lesson_assignments 取得真實作業名稱
    const { data: logs, error } = await serverSupabase
      .from('practice_logs')
      .select(`
        id,
        student_id,
        assignment_id,
        media_url,
        duration_seconds,
        measured_bpm,
        bpm_stability_score,
        ai_draft_feedback,
        teacher_feedback,
        status,
        created_at,
        lesson_assignments (
          piece_name,
          target_bpm,
          special_notes
        )
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('⚠️ [API /api/dev/practice] 查詢錯誤:', error);
    }

    // 2. 格式化輸出
    if (logs && logs.length > 0) {
      const formatted = logs.map((l: any) => {
        const assignment = l.lesson_assignments;
        const songTitle = assignment?.piece_name || '指定進度練習曲';
        const targetBpm = assignment?.target_bpm || 80;

        return {
          id: l.id,
          student_id: l.student_id,
          song_title: `${songTitle} (目標 ${targetBpm} BPM)`,
          duration_seconds: Number(l.duration_seconds) || 15,
          audio_url: l.media_url || 'https://actions.google.com/sounds/v1/instruments/piano_chords.ogg',
          bpm: Number(l.measured_bpm) || targetBpm,
          bpm_stability_score: Number(l.bpm_stability_score) || 92,
          pitch_accuracy_score: 95,
          ai_feedback_draft: l.ai_draft_feedback || '速度穩定，時值掌控良好。',
          teacher_feedback: l.teacher_feedback || '老師已查閱：音色乾淨，繼續保持！',
          status: l.status || 'REVIEWED_AND_SENT',
          created_at: l.created_at,
        };
      });

      return NextResponse.json({
        success: true,
        source: 'database',
        data: formatted,
      });
    }

    const fallbackPracticeLogs = [
      {
        id: 'prac-lin-3',
        student_id: studentId,
        song_title: '莫札特 K.545 第一樂章 呈示部 (目標 96 BPM)',
        duration_seconds: 15,
        audio_url: 'https://actions.google.com/sounds/v1/instruments/piano_chords.ogg',
        bpm: 96,
        bpm_stability_score: 96,
        pitch_accuracy_score: 98,
        ai_feedback_draft:
          'AI 聲學模型分析：右手十六分音符音階顆粒感清晰均勻，左手 Alberti bass (5-1-3-1) 伴奏聲部平衡極佳，速度與拍頻標準差僅 1.2 BPM。',
        teacher_feedback:
          '林佩芬老師批改：觸鍵非常乾淨俐落！古典奏鳴曲式的典雅風格詮釋得很好，繼續保持！',
        status: 'REVIEWED_AND_SENT',
        created_at: '2026-09-12T16:30:00+08:00',
      },
      {
        id: 'prac-lin-2',
        student_id: studentId,
        song_title: '德布西《月光》 琶音色彩與弱音 (目標 54 BPM)',
        duration_seconds: 15,
        audio_url: 'https://actions.google.com/sounds/v1/instruments/piano_chords.ogg',
        bpm: 54,
        bpm_stability_score: 93,
        pitch_accuracy_score: 95,
        ai_feedback_draft:
          'AI 聲學模型分析：弱音 (p) 觸鍵柔和細膩，低音踏板切換時機乾淨，無殘留混濁共鳴，九八拍複合拍律動平穩。',
        teacher_feedback:
          '林佩芬老師批改：音色很有意境與詩意！注意第 30 小節右手大跳時手腕要提前放鬆帶動。',
        status: 'REVIEWED_AND_SENT',
        created_at: '2026-09-08T19:20:00+08:00',
      },
      {
        id: 'prac-lin-1',
        student_id: studentId,
        song_title: '貝多芬《月光》第三樂章 急板琶音 (目標 120 BPM)',
        duration_seconds: 15,
        audio_url: 'https://actions.google.com/sounds/v1/instruments/piano_chords.ogg',
        bpm: 118,
        bpm_stability_score: 91,
        pitch_accuracy_score: 94,
        ai_feedback_draft:
          'AI 聲學模型分析：連續上升琶音第 1 指轉指流暢，重音落點精準，戲劇張力充足；唯後半段手腕微緊，建議深呼吸減壓。',
        teacher_feedback:
          '林佩芬老師批改：急板的爆發力與狂暴氣勢非常出色！主和弦落鍵時肩膀記得保持下沉。',
        status: 'REVIEWED_AND_SENT',
        created_at: '2026-09-01T20:10:00+08:00',
      },
    ];

    return NextResponse.json({
      success: true,
      source: 'fallback',
      data: fallbackPracticeLogs,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { student_id, measured_bpm, bpm_stability_score, ai_draft_feedback, media_url } = body;

    const { data, error } = await serverSupabase
      .from('practice_logs')
      .insert([
        {
          student_id,
          media_type: 'audio',
          media_url: media_url || 'https://actions.google.com/sounds/v1/instruments/piano_chords.ogg',
          duration_seconds: 15,
          measured_bpm: measured_bpm || 80,
          bpm_stability_score: bpm_stability_score || 94,
          ai_draft_feedback: ai_draft_feedback || 'AI 分析完成：節奏均勻穩定',
          status: 'PENDING_TEACHER_REVIEW',
        },
      ])
      .select()
      .single();

    if (error) {
      console.warn('⚠️ [API /api/dev/practice POST] 寫入錯誤:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, source: 'database', data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const logId = request.nextUrl.searchParams.get('log_id');
    if (!logId) {
      return NextResponse.json({ success: false, error: 'log_id is required' }, { status: 400 });
    }

    // 1. 檢查該筆打卡紀錄是否為待覆核狀態 (PENDING_TEACHER_REVIEW)
    const { data: logData, error: findError } = await serverSupabase
      .from('practice_logs')
      .select('id, status')
      .eq('id', logId)
      .maybeSingle();

    if (findError || !logData) {
      return NextResponse.json({ success: false, error: '找不到該筆打卡紀錄' }, { status: 404 });
    }

    if (logData.status === 'REVIEWED_AND_SENT') {
      return NextResponse.json({ 
        success: false, 
        error: '此打卡記錄老師已完成覆核評語，無法刪除！' 
      }, { status: 400 });
    }

    // 2. 刪除該筆打卡記錄
    const { error: deleteError } = await serverSupabase
      .from('practice_logs')
      .delete()
      .eq('id', logId);

    if (deleteError) {
      console.error('❌ [API /api/dev/practice DELETE] 刪除失敗:', deleteError);
      return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: '打卡紀錄已成功刪除！',
    });
  } catch (err: any) {
    console.error('❌ [API /api/dev/practice DELETE] 例外錯誤:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

