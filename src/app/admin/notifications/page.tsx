'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  NOTIFICATION_SCENARIOS,
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
} from 'lucide-react';

export default function NotificationManagementPage() {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'A' | 'B' | 'C'>('ALL');
  const [activeScenarioId, setActiveScenarioId] = useState<string>('A1');
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

  // 取得當前情境的表單數據 (客製化 or 預設)
  const currentFormData = useMemo(() => {
    return {
      ...currentScenario.defaultData,
      ...(customData[currentScenario.id] || {}),
    };
  }, [currentScenario, customData]);

  // 生成當前 Flex Message JSON
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
          message: data.message || '推播成功發送至 LINE！',
        });
      } else {
        setSendResult({
          success: false,
          message: data.error || '推播發送失敗，請檢查 LINE Token 或 User ID',
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

  // 取得色彩體系標籤
  const getThemeBadge = (scenario: NotificationScenario) => {
    if (scenario.id.startsWith('A')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FDF1EC] text-[#E8734A] border border-[#F6D0B8] flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#E8734A]" />
          課程相關 (紅色)
        </span>
      );
    }
    if (scenario.id === 'B1') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF7E6] text-[#B87D00] border border-[#FDE5A3] flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#E5A100]" />
          聯絡簿相關 (黃色)
        </span>
      );
    }
    if (scenario.id === 'B2' || scenario.id === 'B3') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ECFAF3] text-[#2E7D32] border border-[#C8E6C9] flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#49BB87]" />
          打卡相關 (綠色)
        </span>
      );
    }
    if (scenario.id.startsWith('C')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EEF4FC] text-[#4A8FD9] border border-[#D5E4F8] flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#4A8FD9]" />
          繳費相關 (藍色)
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F6F2FB] text-[#9B7EC8] border border-[#E8DEF8] flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-[#9B7EC8]" />
        新課程/系統 (紫色)
      </span>
    );
  };

  // 取得 Header 背景漸層
  const getHeaderGradient = (id: string) => {
    if (id.startsWith('A')) return 'linear-gradient(45deg, #FF8B66 0%, #E8734A 100%)';
    if (id === 'B1') return 'linear-gradient(45deg, #F6C744 0%, #E5A100 100%)';
    if (id === 'B2' || id === 'B3') return 'linear-gradient(45deg, #6BD4A7 0%, #49BB87 100%)';
    if (id.startsWith('C')) return 'linear-gradient(45deg, #6BAFF4 0%, #4A8FD9 100%)';
    return 'linear-gradient(45deg, #BA9FE0 0%, #9B7EC8 100%)';
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2B3049] pb-16 font-['Sora',sans-serif]">
      {/* 頂部導航列 */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#EAE3D6] px-6 py-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/student/schedule"
              className="w-9 h-9 rounded-full bg-[#FAF7F2] hover:bg-[#EFECE6] border border-[#EAE3D6] flex items-center justify-center text-[#2B3049] transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#49BB87] animate-pulse" />
                <h1 className="text-lg font-extrabold text-[#2B3049] tracking-tight">
                  LINE 推播卡片通知管理中心
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F2] text-[#2B3049] text-[11px] font-bold border border-[#EAE3D6] flex items-center gap-1">
                  <Palette className="w-3 h-3 text-[#E8734A]" />
                  style_0824 色彩規範體系
                </span>
              </div>
              <p className="text-xs text-[#7A7E90] mt-0.5">
                課程(紅) · 聯絡簿(黃) · 打卡(綠) · 繳費(藍) · 系統(紫) 5 大體系全面套用
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/student/schedule"
              className="px-3.5 py-1.5 rounded-full bg-white hover:bg-[#FAF7F2] text-xs font-bold text-[#7A7E90] hover:text-[#2B3049] border border-[#EAE3D6] flex items-center gap-1.5 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              前往學生端
            </Link>
            <button
              onClick={handleCopyJson}
              className="px-4 py-1.5 rounded-full bg-[#2B3049] hover:bg-[#1E2235] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? '已複製 JSON' : '複製 Flex JSON'}
            </button>
          </div>
        </div>
      </header>

      {/* 色彩體系快速說明條 */}
      <div className="bg-white border-b border-[#EAE3D6] px-6 py-2.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-[#7A7E90] font-bold flex items-center gap-1.5">
            🎨 色彩規範對應表：
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 text-[#E8734A] font-bold bg-[#FDF1EC] px-2.5 py-0.5 rounded-full border border-[#F6D0B8]">
              <span className="w-2 h-2 rounded-full bg-[#E8734A]" /> 課程相關 (紅色)
            </span>
            <span className="flex items-center gap-1.5 text-[#B87D00] font-bold bg-[#FEF7E6] px-2.5 py-0.5 rounded-full border border-[#FDE5A3]">
              <span className="w-2 h-2 rounded-full bg-[#E5A100]" /> 聯絡簿相關 (黃色)
            </span>
            <span className="flex items-center gap-1.5 text-[#2E7D32] font-bold bg-[#ECFAF3] px-2.5 py-0.5 rounded-full border border-[#C8E6C9]">
              <span className="w-2 h-2 rounded-full bg-[#49BB87]" /> 打卡相關 (綠色)
            </span>
            <span className="flex items-center gap-1.5 text-[#4A8FD9] font-bold bg-[#EEF4FC] px-2.5 py-0.5 rounded-full border border-[#D5E4F8]">
              <span className="w-2 h-2 rounded-full bg-[#4A8FD9]" /> 繳費相關 (藍色)
            </span>
            <span className="flex items-center gap-1.5 text-[#9B7EC8] font-bold bg-[#F6F2FB] px-2.5 py-0.5 rounded-full border border-[#E8DEF8]">
              <span className="w-2 h-2 rounded-full bg-[#9B7EC8]" /> 新課程/系統 (紫色)
            </span>
          </div>
        </div>
      </div>

      {/* 主內容區 */}
      <main className="max-w-7xl mx-auto px-6 pt-6">
        {/* 類別切換 Tabs */}
        <div className="flex flex-wrap items-center gap-2 pb-5 border-b border-[#EAE3D6]">
          {[
            { id: 'ALL', label: '全部通知情境 (11)', count: 11 },
            { id: 'A', label: '🔴 A. 課程排程與出席 (4)', count: 4, icon: Calendar },
            { id: 'B', label: '🟡🟢 B. AI 週報與打卡 (3)', count: 3, icon: Award },
            { id: 'C', label: '🔵 C. 堂數續約與繳費核銷 (4)', count: 4, icon: CreditCard },
          ].map((tab) => {
            const isSelected = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id as any)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#2B3049] text-white shadow-sm'
                    : 'bg-white hover:bg-[#FAF2EC] text-[#7A7E90] hover:text-[#2B3049] border border-[#EAE3D6]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 雙欄主架構：左側情境選擇與表單參數編輯器、右側擬真手機模擬器 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* 左欄：情境清單與參數編輯器 (佔 7 欄) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* 情境快速切換清單 */}
            <div className="bg-white rounded-2xl p-5 border border-[#EAE3D6] shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-[#2B3049] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#E8734A]" />
                  選擇通知情境 ({filteredScenarios.length})
                </h2>
                <span className="text-[11px] text-[#A3A7BA]">點擊即時切換卡片</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {filteredScenarios.map((scenario) => {
                  const isActive = activeScenarioId === scenario.id;
                  return (
                    <button
                      key={scenario.id}
                      onClick={() => setActiveScenarioId(scenario.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                        isActive
                          ? 'bg-[#FAF7F2] shadow-xs ring-2'
                          : 'bg-[#FAF7F2]/40 hover:bg-[#FAF7F2] border-[#EAE3D6] text-[#7A7E90] hover:text-[#2B3049]'
                      }`}
                      style={{
                        borderColor: isActive ? scenario.themeColor : '#EAE3D6',
                        boxShadow: isActive ? `0 0 0 2px ${scenario.themeColor}33` : undefined,
                      }}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span
                          className="text-[10px] font-extrabold px-1.5 py-0.5 rounded text-white"
                          style={{ backgroundColor: scenario.themeColor }}
                        >
                          {scenario.id}
                        </span>
                        <span className="text-[10px] text-[#7A7E90] font-semibold truncate max-w-[85px]">
                          {scenario.themeColorName}
                        </span>
                      </div>
                      <div
                        className={`text-xs font-bold leading-tight ${
                          isActive ? 'text-[#2B3049]' : 'text-[#555555]'
                        }`}
                      >
                        {scenario.title}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 參數編輯器面板 */}
            <div className="bg-white rounded-2xl p-6 border border-[#EAE3D6] shadow-xs flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    {getThemeBadge(currentScenario)}
                    <h3 className="text-base font-bold text-[#2B3049]">
                      【{currentScenario.id}】{currentScenario.title}
                    </h3>
                  </div>
                  <p className="text-xs text-[#7A7E90] mt-1 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#7A7E90]" />
                    觸發情境：{currentScenario.triggerTiming}
                  </p>
                </div>

                <button
                  onClick={handleResetFields}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-[#7A7E90] hover:text-[#2B3049] hover:bg-[#FAF7F2] border border-[#EAE3D6] flex items-center gap-1 transition-all cursor-pointer"
                  title="還原為預設範例資料"
                >
                  <RefreshCw className="w-3 h-3" />
                  還原預設值
                </button>
              </div>

              {/* DB 欄位對應參考區 */}
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EAE3D6] flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#7A7E90]">
                  <Database className="w-3.5 h-3.5 text-[#2B3049]" />
                  <span>資料庫 (DB) 所需對應欄位清單：</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  {currentScenario.dbFields.map((df, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-[#EAE3D6]">
                      <span className="font-bold text-[#2B3049]">{df.label}:</span>
                      <code className="text-[#2B3049] font-mono text-[10px] bg-[#FAF7F2] px-1 rounded">{df.field}</code>
                    </div>
                  ))}
                </div>
              </div>

              {/* 動態表單欄位 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.keys(currentScenario.defaultData).map((fieldKey) => {
                  const currentValue = currentFormData[fieldKey];
                  const isLongText =
                    typeof currentValue === 'string' && currentValue.length > 25;
                  const isBoolean = typeof currentValue === 'boolean';

                  if (isBoolean) {
                    return (
                      <div key={fieldKey} className="sm:col-span-2 flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#EAE3D6]">
                        <span className="text-xs font-bold text-[#2B3049] capitalize">
                          {fieldKey} (審核狀態)
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleFieldChange(fieldKey, true)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                              currentValue === true
                                ? 'bg-[#49BB87] text-white shadow-xs'
                                : 'bg-white text-[#7A7E90] border border-[#EAE3D6]'
                            }`}
                          >
                            ✅ 核准 / 通過
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFieldChange(fieldKey, false)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                              currentValue === false
                                ? 'bg-[#E8734A] text-white shadow-xs'
                                : 'bg-white text-[#7A7E90] border border-[#EAE3D6]'
                            }`}
                          >
                            ❌ 未核准 / 駁回
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={fieldKey}
                      className={`flex flex-col gap-1.5 ${isLongText ? 'sm:col-span-2' : ''}`}
                    >
                      <label className="text-[11px] font-bold text-[#7A7E90] uppercase tracking-wider">
                        {fieldKey}
                      </label>
                      {isLongText ? (
                        <textarea
                          rows={3}
                          value={currentValue ?? ''}
                          onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF7F2] border border-[#EAE3D6] focus:border-[#2B3049] focus:bg-white focus:outline-none transition-all resize-none text-[#2B3049] font-medium"
                          placeholder={`請輸入 ${fieldKey}`}
                        />
                      ) : (
                        <input
                          type="text"
                          value={currentValue ?? ''}
                          onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF7F2] border border-[#EAE3D6] focus:border-[#2B3049] focus:bg-white focus:outline-none transition-all text-[#2B3049] font-medium"
                          placeholder={`請輸入 ${fieldKey}`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 卡片按鈕設計與跳轉清單 */}
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EAE3D6] flex flex-col gap-2.5">
                <span className="text-xs font-bold text-[#2B3049] flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5" />
                  按鈕設計與跳轉連結 ({currentScenario.buttons.length} 個按鈕)
                </span>

                {currentScenario.buttons.length === 0 ? (
                  <div className="text-xs text-[#7A7E90] bg-white p-3 rounded-lg border border-[#EAE3D6]">
                    ℹ️ 本卡片為純狀態通知，依規範不設按鈕（避免重複送出）。
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {currentScenario.buttons.map((btn, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white px-3.5 py-2 rounded-lg border border-[#EAE3D6] gap-2 overflow-hidden"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold text-white shrink-0"
                            style={{ backgroundColor: btn.color || currentScenario.themeColor }}
                          >
                            Button {index + 1}
                          </span>
                          <span className="text-xs font-bold text-[#2B3049] shrink-0">
                            {btn.label}
                          </span>
                          <span className="text-[11px] text-[#A3A7BA] truncate font-mono">
                            ➔ {btn.url}
                          </span>
                        </div>
                        <a
                          href={btn.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded bg-[#FAF7F2] hover:bg-[#EFECE6] text-[#2B3049] text-xs font-bold border border-[#EAE3D6] shrink-0 transition-all shadow-2xs"
                        >
                          測試跳轉 ↗
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 真實 LINE 推播發送測試區 */}
              <div className="border-t border-[#F0EBE1] pt-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#2B3049] flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-[#49BB87]" />
                    真實 LINE 推播發送測試 (Messaging API)
                  </h4>
                  <span className="text-[10px] text-[#A3A7BA]">填入用戶 LINE ID 即刻推播</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="text"
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    placeholder="請輸入目標 LINE User ID (例如 Uf2457bf3...)"
                    className="flex-1 w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF7F2] border border-[#EAE3D6] focus:border-[#49BB87] focus:bg-white focus:outline-none transition-all font-mono text-[#2B3049]"
                  />
                  <button
                    onClick={handleSendPush}
                    disabled={sending}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#2B3049] hover:bg-[#1E2235] active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    {sending ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    {sending ? '發送中...' : '立即推播至手機'}
                  </button>
                </div>

                {sendResult && (
                  <div
                    className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                      sendResult.success
                        ? 'bg-[#ECFAF3] text-[#2E7D32] border border-[#C8E6C9]'
                        : 'bg-[#FDF1EC] text-[#B85536] border border-[#F6D0B8]'
                    }`}
                  >
                    {sendResult.success ? <Check className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                    {sendResult.message}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右欄：擬真 LINE 手機對話框模擬器 (佔 5 欄) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="sticky top-24 w-full max-w-[380px]">
              {/* 預覽模式切換開關 */}
              <div className="flex items-center justify-between mb-3 px-2">
                <div className="flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-[#7A7E90]" />
                  <span className="text-xs font-bold text-[#7A7E90]">LINE 手機渲染效果</span>
                </div>

                <div className="flex items-center bg-white p-1 rounded-full border border-[#EAE3D6] shadow-2xs">
                  <button
                    onClick={() => setActiveViewMode('preview')}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                      activeViewMode === 'preview'
                        ? 'bg-[#2B3049] text-white shadow-2xs'
                        : 'text-[#7A7E90] hover:text-[#2B3049]'
                    }`}
                  >
                    📱 卡片預覽
                  </button>
                  <button
                    onClick={() => setActiveViewMode('json')}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                      activeViewMode === 'json'
                        ? 'bg-[#2B3049] text-white shadow-2xs'
                        : 'text-[#7A7E90] hover:text-[#2B3049]'
                    }`}
                  >
                    <Code className="w-3 h-3 inline mr-1" />
                    JSON
                  </button>
                </div>
              </div>

              {/* 手機外框 */}
              <div className="w-full bg-[#1F2430] rounded-[38px] p-3 shadow-2xl border-4 border-[#2B3049] relative overflow-hidden">
                {/* 頂部動態島 / 聽筒 */}
                <div className="w-28 h-4 bg-black rounded-full mx-auto mb-2 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#1F2430] mr-2" />
                  <div className="w-10 h-1 bg-[#1F2430] rounded-full" />
                </div>

                {/* 手機螢幕內部 (LINE 聊天介面) */}
                <div className="w-full bg-[#849EB0] rounded-[28px] overflow-hidden flex flex-col min-h-[580px] max-h-[660px]">
                  {/* LINE 聊天室 Header */}
                  <div className="bg-[#2B3049]/95 backdrop-blur-md px-4 py-3 flex items-center justify-between text-white border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C8A2D0] to-[#A8D8EA] p-0.5 flex items-center justify-center">
                        <img
                          src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100"
                          alt="MusiMate"
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold tracking-tight">MusiMate 音樂小助教</span>
                        <span className="text-[10px] text-emerald-400 font-medium">● 官方帳號</span>
                      </div>
                    </div>
                    <span className="text-xs text-white/70">•••</span>
                  </div>

                  {/* 聊天室內容區 */}
                  <div className="flex-1 p-3.5 overflow-y-auto flex flex-col gap-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {/* 日期分隔膠囊 */}
                    <div className="self-center bg-black/20 text-white/90 text-[10px] font-bold px-3 py-0.5 rounded-full backdrop-blur-xs">
                      今天 上午 10:30
                    </div>

                    {activeViewMode === 'preview' ? (
                      /* 訊息氣泡 + Flex Message 擬真卡片 */
                      <div className="flex items-start gap-2 max-w-[96%] animate-in fade-in duration-300">
                        {/* 機器人頭像 */}
                        <div className="w-7 h-7 rounded-full bg-white shadow-xs p-0.5 shrink-0 overflow-hidden">
                          <img
                            src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100"
                            alt="MusiMate"
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>

                        {/* Flex 卡片本體 (遵循 LINE 官方樣式) */}
                        <div className="flex flex-col gap-1 flex-1">
                          <span className="text-[10px] text-white/80 font-medium ml-1">
                            MusiMate 助教
                          </span>

                          <div className="w-full bg-white rounded-[18px] overflow-hidden shadow-lg border border-black/10 flex flex-col transition-all">
                            {/* Flex 卡片 Header (色彩體系漸層) */}
                            <div
                              className="p-4 flex flex-col gap-1.5"
                              style={{
                                background: getHeaderGradient(currentScenario.id),
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-extrabold text-white bg-white/30 backdrop-blur-xs px-2 py-0.5 rounded-full">
                                  {currentScenario.categoryName}
                                </span>
                                <span className="text-[10px] text-white/90 font-mono font-bold">
                                  {currentScenario.id}
                                </span>
                              </div>
                              <h3 className="text-base font-extrabold text-white leading-tight tracking-tight drop-shadow-2xs">
                                {currentScenario.title}
                              </h3>
                            </div>

                            {/* Flex 卡片 Body */}
                            <div className="p-4 flex flex-col gap-2.5 bg-white text-xs">
                              {Object.entries(currentFormData).map(([key, value]) => {
                                if (
                                  typeof value === 'boolean' ||
                                  key.endsWith('_id')
                                )
                                  return null;
                                return (
                                  <div
                                    key={key}
                                    className="flex items-start justify-between gap-2 border-b border-[#FAF7F2] pb-1.5 last:border-0"
                                  >
                                    <span className="text-[#7A7E90] text-[11px] font-medium shrink-0">
                                      {key}
                                    </span>
                                    <span
                                      className={`text-[11px] text-right font-semibold break-all ${
                                        String(value).includes('核准') ||
                                        String(value).includes('開通') ||
                                        String(value).includes('優異') ||
                                        String(value).includes('91%') ||
                                        String(value).includes('成功')
                                          ? 'text-[#2E7D32] font-bold'
                                          : String(value).includes('缺席') ||
                                            String(value).includes('扣款') ||
                                            String(value).includes('催繳') ||
                                            String(value).includes('倒數') ||
                                            String(value).includes('最後')
                                          ? 'text-[#E8734A] font-bold'
                                          : 'text-[#2B3049]'
                                      }`}
                                    >
                                      {String(value)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Flex 卡片 Footer (多按鈕渲染區) */}
                            {currentScenario.buttons.length > 0 && (
                              <div className="p-3 pt-0 bg-white flex flex-col gap-1.5">
                                {currentScenario.buttons.map((btn, bIdx) => (
                                  <a
                                    key={bIdx}
                                    href={btn.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`w-full py-2.5 rounded-xl font-bold text-xs text-center shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1 ${
                                      btn.style === 'secondary'
                                        ? 'bg-[#FAF7F2] hover:bg-[#EFECE6] text-[#2B3049] border border-[#EAE3D6]'
                                        : 'text-white'
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

                          {/* 訊息時間戳記 */}
                          <span className="text-[9px] text-white/70 self-end mr-1">
                            10:30
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* JSON 原始碼檢視器 */
                      <div className="bg-[#1E1E1E] text-[#D4D4D4] p-3 rounded-xl font-mono text-[10px] overflow-x-auto max-h-[500px]">
                        <pre>{JSON.stringify(currentFlexBubble, null, 2)}</pre>
                      </div>
                    )}
                  </div>

                  {/* 底部輸入列裝飾 */}
                  <div className="bg-white px-3 py-2 flex items-center gap-2 border-t border-slate-200 shrink-0">
                    <div className="flex-1 bg-[#FAF7F2] rounded-full px-3 py-1.5 text-[11px] text-[#A3A7BA]">
                      點擊卡片按鈕進行互動測試...
                    </div>
                    <div className="w-7 h-7 rounded-full bg-[#49BB87] text-white flex items-center justify-center text-xs">
                      ➤
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
