'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useDemoContext } from '@/context/DemoContext';
import { StudentBottomNav } from '@/components/StudentBottomNav';
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
    <div className="max-w-5xl mx-auto space-y-8 py-4 pb-28">
      {/* Navigation Top Action */}
      <div className="flex items-center justify-between">
        <Link
          href="/student/practice"
          replace={true}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7A736E] hover:text-[#332C27] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> 返回作業學習中心 (P4)
        </Link>
        <span className="text-xs text-[#785338] font-bold bg-[#F2E8D8] px-3.5 py-1 rounded-full border border-[#EADFC9]">
          比對 ID: {practice.id}
        </span>
      </div>

      {/* Main Dual-Screen Comparison Card */}
      <div className="warm-card p-6 sm:p-8 rounded-3xl border border-[#EFECE6] shadow-warm space-y-8 bg-white">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EFECE6] pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF2EC] text-[#8C6D53] border border-[#E8D4C5] text-xs font-bold">
              <Sliders className="w-3.5 h-3.5 text-[#E88D67]" />
              雙畫面 AI 影音比對診斷 (P6)
            </div>
            <h1 className="text-2xl font-extrabold text-[#332C27] tracking-tight">
              {demo.title}
            </h1>
            <p className="text-xs text-[#7A736E] font-medium">
              上傳日期：{new Date(practice.created_at).toLocaleDateString('zh-TW')} · AI 聲學比對模型已完成分析
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-[#7A736E] font-bold block uppercase">AI 綜合得分</span>
              <span className="text-2xl font-black text-[#3D5240]">{practice.ai_feedback_json.overall_score} 分</span>
            </div>
          </div>
        </div>

        {/* Dual Video Players */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Student Video */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#332C27] px-1">
              <span>👤 學生練習影片 (Student Practice)</span>
              <span className="text-[#E88D67] font-mono text-[11px]">BPM {practice.ai_feedback_json.bpm_detected}</span>
            </div>
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-[#EFECE6] shadow-sm">
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
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#332C27] px-1">
              <span>🎓 老師標準範例 (Teacher Demo)</span>
              <span className="text-[#8C6D53] font-mono text-[11px]">BPM {demo.midi_data?.bpm || 96}</span>
            </div>
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-[#EFECE6] shadow-sm">
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
        <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#EFECE6] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleTogglePlay}
                className="px-5 py-2 rounded-full bg-[#8C6D53] hover:bg-[#765942] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#8C6D53]/20 transition-all"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                {isPlaying ? '暫停雙視角' : '同步播放'}
              </button>
              <button
                onClick={() => handleSeek(0)}
                className="p-2 rounded-full bg-white hover:bg-[#EFECE6] text-[#7A736E] text-xs font-bold border border-[#EFECE6] transition-all"
                title="回到開頭"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="text-[#3D5240] bg-[#E3E8E1] px-3 py-1 rounded-full">
                音準：{practice.ai_feedback_json.pitch_accuracy}%
              </span>
              <span className="text-[#8C6D53] bg-[#FAF2EC] px-3 py-1 rounded-full">
                節奏：{practice.ai_feedback_json.rhythm_accuracy}%
              </span>
            </div>
          </div>

          {/* Timeline Markers */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-[#7A736E] block">AI 標記時間軸（點擊跳至該小節診斷）：</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {practice.ai_feedback_json.timeline_markers.map((marker, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedMarker(marker);
                    handleSeek(marker.time);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    selectedMarker?.time === marker.time
                      ? 'bg-white border-[#8C6D53] shadow-sm ring-2 ring-[#8C6D53]/20'
                      : 'bg-[#FAF2EC]/50 border-[#E8D4C5] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-[#8C6D53]">00:0{marker.time}</span>
                    <span className="text-xs font-semibold text-[#332C27] line-clamp-1">{marker.title}</span>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
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
          <div className="p-6 rounded-3xl bg-[#FAF2EC] border border-[#E8D4C5] space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedMarker.severity === 'error'
                      ? 'bg-[#FCEADE] text-[#B85536] border border-[#F6D0B8]'
                      : selectedMarker.severity === 'warning'
                      ? 'bg-white text-[#8C6D53] border border-[#E8D4C5]'
                      : 'bg-[#E3E8E1] text-[#3D5240] border border-[#C5D2C2]'
                  }`}
                >
                  {selectedMarker.type === 'pitch' ? '音高誤差' : selectedMarker.type === 'rhythm' ? '節奏搶拍' : '姿態建議'}
                </span>
                <h3 className="font-bold text-sm text-[#332C27]">
                  {selectedMarker.title} (時間點: {selectedMarker.time} 秒)
                </h3>
              </div>

              <button
                onClick={() => handleSeek(selectedMarker.time)}
                className="text-xs text-[#8C6D53] hover:text-[#765942] font-bold"
              >
                重播此片段
              </button>
            </div>

            <p className="text-xs text-[#7A736E] font-medium leading-relaxed">{selectedMarker.description}</p>

            <div className="p-3.5 rounded-2xl bg-white border border-[#EFECE6] text-xs text-[#332C27] font-medium">
              💡 <span className="font-bold text-[#8C6D53]">AI 改善建議：</span> {selectedMarker.recommendation}
            </div>
          </div>
        )}
      </div>

      {/* 學生專屬固定底部導航列 */}
      <StudentBottomNav />
    </div>
  );
}
