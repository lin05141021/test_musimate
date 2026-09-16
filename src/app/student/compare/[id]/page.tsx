'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { StudentTabBar } from '@/components/StudentTabBar';
import { useDemoContext } from '@/context/DemoContext';
import {
  Video,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Music,
  Zap,
  Gauge,
  Sliders,
  Volume2,
} from 'lucide-react';
import { TimelineMarker } from '@/types';

export default function StudentCompareDetailPage() {
  const params = useParams();
  const { practiceVideos, demoVideos, activeStudentId, allStudents, switchStudent } = useDemoContext();

  // 防禦代碼：若 URL 帶有學生參數或重新載入，確保身分自動重載
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const studentParam = urlParams.get('student') || urlParams.get('student_id');
      if (studentParam) {
        const found = allStudents.find(
          (s) =>
            s.student.id.toLowerCase() === studentParam.toLowerCase() ||
            s.user.name.toLowerCase().includes(studentParam.toLowerCase())
        );
        if (found && found.student.id !== activeStudentId) {
          switchStudent(found.student.id);
        }
      }
    }
  }, [activeStudentId]);

  const practiceId = params.id as string;
  const practice = practiceVideos.find((p) => p.id === practiceId) || practiceVideos[0];
  const demo = demoVideos.find((d) => d.id === practice.demo_video_id) || demoVideos[0];

  const studentVideoRef = useRef<HTMLVideoElement>(null);
  const teacherVideoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedMarker, setSelectedMarker] = useState<TimelineMarker | null>(
    practice.ai_feedback_json.timeline_markers[1] || null
  );

  const handleTogglePlay = () => {
    if (!studentVideoRef.current || !teacherVideoRef.current) return;
    if (isPlaying) {
      studentVideoRef.current.pause();
      teacherVideoRef.current.pause();
      setIsPlaying(false);
    } else {
      studentVideoRef.current.play();
      teacherVideoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (seconds: number) => {
    if (studentVideoRef.current && teacherVideoRef.current) {
      studentVideoRef.current.currentTime = seconds;
      teacherVideoRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  return (
    <div className="space-y-4 pb-28 animate-in fade-in">
      {/* 頂部導航橫列 */}
      <div className="flex items-center justify-between">
        <Link
          href="/student/practice"
          replace={true}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#63667B] hover:text-[#2B3049] transition-colors py-1.5 px-3 rounded-lg bg-white/80 border border-[#EBDCB9] shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>返回作業打卡</span>
        </Link>
        <span className="text-[11px] font-bold bg-[#FAF6F0] text-[#885424] border border-[#C58D34]/30 px-3 py-1 rounded-full shadow-xs">
          鋼琴 · AI 影音比對診斷
        </span>
      </div>

      {/* 主卡片：AI 比對診斷總覽 */}
      <div className="bg-white border border-[#EBDCB9] rounded-2xl p-4 space-y-4 shadow-xs">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#F0EAE1] pb-3 gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#68C5AB]/20 text-[#2B7A66] text-[11px] font-bold">
                AI 聲學比對
              </span>
              <span className="text-[11px] text-[#63667B] flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3 text-[#68C5AB]" />
                {new Date(practice.created_at).toLocaleDateString('zh-TW')}
              </span>
            </div>
            <h1 className="text-base font-extrabold text-[#2B3049] leading-snug">
              {demo.title}
            </h1>
            <p className="text-xs text-[#8E90A6]">
              指導教師：林佩芬 老師 · AI 聲學模型已完成綜合比對
            </p>
          </div>

          <div className="text-right shrink-0 bg-[#EFF9F6] border border-[#A2DEC8] px-3 py-1.5 rounded-xl shadow-xs">
            <span className="text-[10px] text-[#2B7A66] font-bold block">AI 綜合得分</span>
            <span className="text-xl font-black text-[#1F5C4E]">{practice.ai_feedback_json.overall_score} 分</span>
          </div>
        </div>

        {/* Dual Video Players */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Left: Student Video */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#2B3049] px-1">
              <span>👤 學生練習 (劉心悅)</span>
              <span className="text-[#E05D52] font-mono text-[11px]">BPM {practice.ai_feedback_json.bpm_detected}</span>
            </div>
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-[#EBDCB9] shadow-xs">
              <video
                ref={studentVideoRef}
                src={practice.video_url}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
            </div>
          </div>

          {/* Right: Teacher Demo Video */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#2B3049] px-1">
              <span>🎓 老師示範 (林佩芬)</span>
              <span className="text-[#885424] font-mono text-[11px]">BPM {demo.midi_data?.bpm || 96}</span>
            </div>
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-[#EBDCB9] shadow-xs">
              <video
                ref={teacherVideoRef}
                src={demo.video_url}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
            </div>
          </div>
        </div>

        {/* Unified Playback Controls & Timeline */}
        <div className="bg-[#FAF6F0] p-3.5 rounded-xl border border-[#EBDCB9] space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="px-3.5 py-1.5 rounded-full bg-[#C58D34] hover:bg-[#AA7129] active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? '暫停雙視角' : '同步播放'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleSeek(0)}
                className="p-1.5 rounded-full bg-white hover:bg-[#FAF6F0] active:scale-95 text-[#63667B] text-xs font-bold border border-[#EBDCB9] transition-all cursor-pointer shadow-xs"
                title="回到開頭"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-[#1F5C4E] bg-[#EFF9F6] border border-[#A2DEC8] px-2.5 py-0.5 rounded-full text-[11px]">
                音準 {practice.ai_feedback_json.pitch_accuracy}%
              </span>
              <span className="text-[#885424] bg-[#FAF6F0] border border-[#C58D34]/30 px-2.5 py-0.5 rounded-full text-[11px]">
                節奏 {practice.ai_feedback_json.rhythm_accuracy}%
              </span>
            </div>
          </div>

          {/* Timeline Markers */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-[#63667B] block">AI 標記時間軸（點擊切換小節診斷）：</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {practice.ai_feedback_json.timeline_markers.map((marker, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedMarker(marker);
                    handleSeek(marker.time);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    selectedMarker?.time === marker.time
                      ? 'bg-white border-[#C58D34] shadow-xs ring-2 ring-[#C58D34]/20'
                      : 'bg-white/70 border-[#EBDCB9] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold font-mono text-[#885424]">00:0{marker.time}</span>
                    <span className="text-xs font-semibold text-[#2B3049] line-clamp-1">{marker.title}</span>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      marker.severity === 'error'
                        ? 'bg-rose-100 text-rose-700'
                        : marker.severity === 'warning'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {marker.severity === 'error' ? '需修正' : marker.severity === 'warning' ? '注意' : '良好'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Marker Detail Card */}
        {selectedMarker && (
          <div className="p-4 rounded-xl bg-[#FAF6F0] border border-[#EBDCB9] space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedMarker.severity === 'error'
                      ? 'bg-rose-100 text-rose-700 border border-rose-200'
                      : selectedMarker.severity === 'warning'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {selectedMarker.type === 'pitch' ? '音高誤差' : selectedMarker.type === 'rhythm' ? '節奏搶拍' : '姿態建議'}
                </span>
                <h3 className="font-bold text-xs text-[#2B3049]">
                  {selectedMarker.title} (時間點: {selectedMarker.time} 秒)
                </h3>
              </div>

              <button
                type="button"
                onClick={() => handleSeek(selectedMarker.time)}
                className="text-xs text-[#C58D34] hover:text-[#AA7129] font-bold cursor-pointer"
              >
                重播此片段
              </button>
            </div>

            <p className="text-xs text-[#63667B] font-medium leading-relaxed">{selectedMarker.description}</p>

            <div className="p-2.5 rounded-lg bg-white border border-[#EBDCB9] text-xs text-[#2B3049] font-medium">
              💡 <span className="font-bold text-[#885424]">AI 改善建議：</span> {selectedMarker.recommendation}
            </div>
          </div>
        )}
      </div>

      {/* 學生專屬固定底部導航列 */}
      <StudentTabBar activeTab="practice" />
    </div>
  );
}
