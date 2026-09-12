'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  NOTIFICATION_SCENARIOS,
  THEME_COLORS,
  VERCEL_BASE_URL,
  NotificationScenario,
} from '@/lib/lineFlexTemplates';
import {
  Bell,
  Send,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  Code,
  Sparkles,
  RefreshCw,
  Info,
  Calendar,
  CreditCard,
  Award,
  Database,
  ArrowLeft,
  Palette,
  Sliders,
  Layers,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function NotificationManagementPage() {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'A' | 'B' | 'C' | 'D'>('ALL');
  const [activeScenarioId, setActiveScenarioId] = useState<string>('A1');
  const [mobileTab, setMobileTab] = useState<'preview' | 'scenarios' | 'edit'>('preview');
  const [customData, setCustomData] = useState<Record<string, Record<string, any>>>({});
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);
  const [targetUserId, setTargetUserId] = useState('Uf2457bf35e0d6d3060b60838d9a9c91c'); // 預設學員 LINE ID
  const [activeViewMode, setActiveViewMode] = useState<'preview' | 'json'>('preview');

  const scenarioList = useMemo(() => Object.values(NOTIFICATION_SCENARIOS), []);

  const filteredScenarios = useMemo(() => {
    if (selectedCategory === 'ALL') return scenarioList;
    return scenarioList.filter((s) => s.category === selectedCategory);
  }, [scenarioList, selectedCategory]);

  const currentScenario = NOTIFICATION_SCENARIOS[activeScenarioId] || scenarioList[0];

  // 取得當前情境表單參數 (客製化 or 預設)
  const currentFormData = useMemo(() => {
    return {
      ...currentScenario.defaultData,
      ...(customData[currentScenario.id] || {}),
    };
  }, [currentScenario, customData]);

  // 生成最新 Flex Message JSON
  const currentFlexBubble = useMemo(() => {
    return currentScenario.generateFlex(currentFormData);
  }, [currentScenario, currentFormData]);

  // 處理表單欄位變更
  const handleFieldChange = (key: string, value: any) => {
    setCustomData((prev) => ({
      ...prev,
      [currentScenario.id]: {
        ...(prev[currentScenario.id] || {}),
        [key]: value,
      },
    }));
  };

  // 重設表單欄位為預設值
  const handleResetFields = () => {
    setCustomData((prev) => {
      const next = { ...prev };
      delete next[currentScenario.id];
      return next;
    });
  };

  // 複製 Flex Message JSON
  const handleCopyJson = () => {
    const fullMessage = {
      type: 'flex',
      altText: `【MusiMate ${currentScenario.categoryName}】${currentScenario.title}`,
      contents: currentFlexBubble,
    };
    navigator.clipboard.writeText(JSON.stringify(fullMessage, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // 發送真實 LINE 推播
  const handleSendPush = async () => {
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: currentScenario.id,
          customData: currentFormData,
          targetUserId: targetUserId.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSendResult({
          success: true,
          message: data.message || '✅ 推播已成功發送至您的 LINE！請打開手機查看。',
        });
      } else {
        setSendResult({
          success: false,
          message: data.error || '推播發送失敗，請確認伺服器連線。',
        });
      }
    } catch (err: any) {
      setSendResult({
        success: false,
        message: err.message || '網路連線錯誤',
      });
    } finally {
      setSending(false);
    }
  };

  // 取得主題色彩標籤
  const getThemeBadge = (scenario: NotificationScenario) => {
    return (
      <span
        className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5"
        style={{
          backgroundColor: `${scenario.themeColor}15`,
          borderColor: `${scenario.themeColor}40`,
          color: scenario.themeColor,
        }}
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: scenario.themeColor }}
        />
        {scenario.categoryName} ({scenario.themeColor})
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2B3049] pb-24 font-['Sora',sans-serif]">
      {/* 頂部導航列 */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#EAE3D6] px-4 sm:px-6 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Link
              href="/student/schedule"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#FAF7F2] hover:bg-[#EFECE6] border border-[#EAE3D6] flex items-center justify-center text-[#2B3049] transition-all shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#68C5AB] animate-pulse shrink-0" />
                <h1 className="text-sm sm:text-base font-extrabold text-[#2B3049] tracking-tight">
                  LINE 通知情境測試中心
                </h1>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-[#FAF7F2] text-[#2B3049] text-[10px] font-bold border border-[#EAE3D6]">
                  11 大官方情境
                </span>
              </div>
              <p className="text-[11px] text-[#7A7E90] truncate max-w-[240px] sm:max-w-none">
                莫蘭迪色系 · 100% 擬真 LINE Flex 卡片
              </p>
            </div>
          </div>

          <button
            onClick={handleCopyJson}
            className="px-3 py-1.5 rounded-full bg-[#FAF7F2] hover:bg-[#EFECE6] border border-[#EAE3D6] text-xs font-bold text-[#2B3049] flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? '已複製 JSON' : '複製 Flex JSON'}</span>
            <span className="sm:hidden">{copied ? '已複製' : 'JSON'}</span>
          </button>
        </div>

        {/* 手機版專屬分頁切換器 (Mobile Segmented Tabs) */}
        <div className="lg:hidden mt-2.5 grid grid-cols-3 gap-1 bg-[#FAF7F2] p-1 rounded-xl border border-[#EAE3D6]">
          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === 'preview'
                ? 'bg-white text-[#2B3049] shadow-xs'
                : 'text-[#7A7E90] hover:text-[#2B3049]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            📱 卡片預覽
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('scenarios')}
            className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === 'scenarios'
                ? 'bg-white text-[#2B3049] shadow-xs'
                : 'text-[#7A7E90] hover:text-[#2B3049]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            📋 挑選情境
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('edit')}
            className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === 'edit'
                ? 'bg-white text-[#2B3049] shadow-xs'
                : 'text-[#7A7E90] hover:text-[#2B3049]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            ✏️ 參數調整
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* 左欄：11 大情境切換清單 (手機版在 scenarios tab 顯示，桌面版常駐) */}
          <div className={`lg:col-span-4 space-y-4 ${mobileTab === 'scenarios' ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl p-4 border border-[#EAE3D6] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-[#2B3049] flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#CEAB98]" />
                  情境分類篩選
                </h2>
                <span className="text-xs text-[#7A7E90] font-bold">
                  共 {scenarioList.length} 款
                </span>
              </div>

              {/* 分類標籤頁 */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'ALL', label: '全部 (11)' },
                  { id: 'A', label: '📅 課程調課 (4)' },
                  { id: 'B', label: '📖 作業練習 (3)' },
                  { id: 'C', label: '💳 學費續約 (3)' },
                  { id: 'D', label: '💜 學員關懷 (1)' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedCategory(tab.id as any)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      selectedCategory === tab.id
                        ? 'bg-[#2B3049] text-white shadow-xs'
                        : 'bg-[#FAF7F2] text-[#7A7E90] hover:bg-[#EFECE6]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 情境項目清單 */}
            <div className="space-y-2.5">
              {filteredScenarios.map((sc) => {
                const isActive = sc.id === activeScenarioId;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => {
                      setActiveScenarioId(sc.id);
                      setMobileTab('preview'); // 手機版選取後自動切回預覽
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isActive
                        ? 'bg-[#FFFDF9] border-2 shadow-sm scale-[1.01]'
                        : 'bg-white border-[#EAE3D6] hover:bg-[#FAF7F2]'
                    }`}
                    style={{
                      borderColor: isActive ? sc.themeColor : undefined,
                    }}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 rounded-md text-[10px] font-black text-white"
                          style={{ backgroundColor: sc.themeColor }}
                        >
                          {sc.id}
                        </span>
                        <h3 className="font-extrabold text-xs sm:text-sm text-[#2B3049] truncate">
                          {sc.title}
                        </h3>
                      </div>
                      <p className="text-[11px] text-[#7A7E90] truncate">
                        {sc.description}
                      </p>
                    </div>

                    <ChevronRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isActive ? 'text-[#2B3049] translate-x-1' : 'text-[#A3A7BA]'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* 中欄：真實手機 LINE Flex 卡片預覽 (手機版在 preview tab 顯示，桌面版常駐) */}
          <div className={`lg:col-span-5 space-y-4 ${mobileTab === 'preview' ? 'block' : 'hidden lg:block'}`}>
            
            {/* 情境標題與切換 */}
            <div className="bg-white rounded-2xl p-4 border border-[#EAE3D6] shadow-xs flex items-center justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-0.5 rounded-md text-xs font-black text-white"
                    style={{ backgroundColor: currentScenario.themeColor }}
                  >
                    {currentScenario.id}
                  </span>
                  <h2 className="text-sm sm:text-base font-extrabold text-[#2B3049] truncate">
                    {currentScenario.title}
                  </h2>
                </div>
                <p className="text-xs text-[#7A7E90] line-clamp-1">
                  {currentScenario.description}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveViewMode(activeViewMode === 'preview' ? 'json' : 'preview')}
                  className="p-2 rounded-xl bg-[#FAF7F2] hover:bg-[#EFECE6] border border-[#EAE3D6] text-xs font-bold text-[#2B3049] transition-all"
                  title="切換 JSON 檢視"
                >
                  <Code className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 手機擬真外框 */}
            <div className="w-full max-w-sm mx-auto bg-[#232733] rounded-[32px] p-3 shadow-2xl border-4 border-[#353A4B]">
              {/* LINE 聊天室頂部 */}
              <div className="bg-[#2B3049] rounded-t-[24px] px-4 py-2.5 flex items-center justify-between text-white text-xs border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#68C5AB]" />
                  <span className="font-extrabold">林佩芬老師 音樂教室</span>
                </div>
                <span className="text-[10px] text-white/70">官方帳號</span>
              </div>

              {/* 聊天室內容區 */}
              <div className="bg-[#8594A6] p-3 min-h-[380px] flex flex-col justify-start">
                {activeViewMode === 'preview' ? (
                  <div className="flex items-start gap-2 max-w-full">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-xs text-[#2B3049] shrink-0 overflow-hidden shadow-xs">
                      🎹
                    </div>

                    {/* Flex 卡片容器 */}
                    <div className="flex-1 min-w-0">
                      <div className="w-full bg-white rounded-2xl overflow-hidden shadow-md border border-black/10 flex flex-col">
                        
                        {/* 卡片 Header */}
                        <div
                          className="p-4 flex flex-col gap-1 text-white"
                          style={{ backgroundColor: currentScenario.themeColor }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold bg-white/25 px-2 py-0.5 rounded-full">
                              {currentScenario.categoryName}
                            </span>
                            <span className="text-[10px] font-mono opacity-90">
                              {currentScenario.id}
                            </span>
                          </div>
                          <h3 className="text-base font-extrabold leading-snug">
                            {currentScenario.title}
                          </h3>
                        </div>

                        {/* 卡片 Body */}
                        <div className="p-3.5 space-y-2 bg-white text-xs">
                          {Object.entries(currentFormData).map(([k, v]) => {
                            if (typeof v === 'boolean' || k.endsWith('_id')) return null;
                            if (k === 'teacher_message' || k === 'notes') {
                              return (
                                <div
                                  key={k}
                                  className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EAE3D6] text-[11px] text-[#4A3A31] space-y-0.5"
                                >
                                  <span className="font-bold text-[#8C6D53]">👩‍🏫 老師留言：</span>
                                  <p className="italic">「{String(v)}」</p>
                                </div>
                              );
                            }
                            return (
                              <div
                                key={k}
                                className="flex items-start justify-between gap-2 border-b border-[#FAF7F2] pb-1.5 last:border-0"
                              >
                                <span className="text-[#7A7E90] text-[11px] shrink-0">
                                  {k}
                                </span>
                                <span className="text-[11px] font-bold text-[#2B3049] text-right break-all">
                                  {String(v)}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* 卡片 Footer 按鈕群 */}
                        {currentScenario.buttons.length > 0 && (
                          <div className="p-3 pt-0 bg-white space-y-1.5">
                            {currentScenario.buttons.map((btn, bIdx) => (
                              <a
                                key={bIdx}
                                href={btn.url}
                                target="_blank"
                                rel="noreferrer"
                                className={`w-full py-2.5 rounded-xl font-bold text-xs text-center transition-all flex items-center justify-center gap-1 ${
                                  btn.style === 'secondary'
                                    ? 'bg-[#FAF7F2] text-[#2B3049] border border-[#EAE3D6]'
                                    : 'text-white shadow-xs'
                                }`}
                                style={{
                                  backgroundColor:
                                    btn.style === 'secondary'
                                      ? undefined
                                      : btn.color || currentScenario.themeColor,
                                }}
                              >
                                {btn.label} ↗
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#1E1E1E] text-emerald-400 p-3 rounded-xl font-mono text-[10px] overflow-x-auto max-h-[360px]">
                    <pre>{JSON.stringify(currentFlexBubble, null, 2)}</pre>
                  </div>
                )}
              </div>

              {/* 聊天室底部 */}
              <div className="bg-white rounded-b-[24px] px-3 py-2 flex items-center gap-2">
                <div className="flex-1 bg-[#FAF7F2] rounded-full px-3 py-1 text-[10px] text-[#A3A7BA]">
                  點擊卡片按鈕可測試功能...
                </div>
                <div className="w-6 h-6 rounded-full bg-[#68C5AB] text-white flex items-center justify-center text-xs font-bold">
                  +
                </div>
              </div>
            </div>

            {/* 即時發送真實推播控制面板 */}
            <div className="bg-white rounded-2xl p-4 border border-[#EAE3D6] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-extrabold text-[#2B3049] flex items-center gap-1.5">
                  <Send className="w-4 h-4 text-emerald-600" />
                  發送這張卡片至手機 LINE
                </h3>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                  真實推播
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#7A7E90]">
                  接收者 LINE User ID
                </label>
                <input
                  type="text"
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  placeholder="Uxxxxxxxx..."
                  className="w-full bg-[#FAF7F2] border border-[#EAE3D6] rounded-xl px-3 py-2 text-xs font-mono text-[#2B3049] focus:outline-none focus:border-[#2B3049]"
                />
              </div>

              <button
                type="button"
                onClick={handleSendPush}
                disabled={sending}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    正在發送推播...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    🚀 立即發送「{currentScenario.title}」至手機
                  </>
                )}
              </button>

              {sendResult && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    sendResult.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {sendResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{sendResult.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* 右欄：動態參數表單調整 (手機版在 edit tab 顯示，桌面版常駐) */}
          <div className={`lg:col-span-3 space-y-4 ${mobileTab === 'edit' ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl p-4 border border-[#EAE3D6] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-[#2B3049] flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#CEAB98]" />
                  動態欄位自訂
                </h3>
                <button
                  type="button"
                  onClick={handleResetFields}
                  className="text-[11px] font-bold text-[#7A7E90] hover:text-[#2B3049] flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  還原預設
                </button>
              </div>
              <p className="text-[11px] text-[#7A7E90]">
                修改下方內容，左側卡片會即時動態連動更新！
              </p>

              {/* 動態表單項目 */}
              <div className="space-y-3 pt-1">
                {Object.entries(currentFormData).map(([key, value]) => {
                  if (typeof value === 'boolean') return null;
                  return (
                    <div key={key} className="space-y-1">
                      <label className="text-[11px] font-bold text-[#7A7E90] flex items-center justify-between">
                        <span>{key}</span>
                      </label>
                      <input
                        type="text"
                        value={String(value)}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        className="w-full bg-[#FAF7F2] border border-[#EAE3D6] rounded-xl px-3 py-2 text-xs font-semibold text-[#2B3049] focus:outline-none focus:border-[#2B3049]"
                      />
                    </div>
                  );
                })}
              </div>

              {/* 手機版完成按鈕 */}
              <button
                type="button"
                onClick={() => setMobileTab('preview')}
                className="lg:hidden w-full py-2.5 rounded-xl bg-[#2B3049] text-white text-xs font-bold mt-3"
              >
                查看更新後的卡片預覽 →
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
