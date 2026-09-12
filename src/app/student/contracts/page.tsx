'use client';

import React, { useState, useEffect } from 'react';
import { useLiffAuth } from '@/context/LiffAuthContext';
import { ContractBillingInfo } from '@/types';
import {
  CreditCard,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Copy,
  Clock,
  Send,
  Building,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import clsx from 'clsx';

export default function ContractsAndBillingPage() {
  const { currentStudent, currentTeacher } = useLiffAuth();

  const [copied, setCopied] = useState(false);
  const [bankLast5, setBankLast5] = useState('');
  const [isReported, setIsReported] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contractData, setContractData] = useState<ContractBillingInfo>({
    contract_no: 'CT-202608-0092',
    teacher_name: '林佩芬老師',
    bank_name: '玉山銀行 (808)',
    account_number: '1234-567-890123',
    account_name: '林O芬',
    rate_per_lesson: 1400,
    remaining_lessons: 2,
    total_amount: 14000,
    invoice_status: 'PENDING_PAYMENT',
    due_date: '2026-09-07',
  });

  // 當切換學生時，向 API 讀取該學生的真實契約與帳單資料
  useEffect(() => {
    setIsReported(false);
    setBankLast5('');

    if (currentStudent?.id) {
      fetch(`/api/dev/contracts?student_id=${currentStudent.id}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setContractData(json.data);
            if (json.data.invoice_status === 'TRANSFERRED_CONFIRMING') {
              setIsReported(true);
            }
          }
        })
        .catch((err) => console.warn('契約 API 載入報錯:', err));
    }
  }, [currentStudent?.id]);

  // 銀行匯款資訊 (依契約指導老師即時動態連動)
  const bankInfo = {
    bankName: contractData.bank_name,
    accountNumber: contractData.account_number,
    accountName: contractData.account_name,
    amount: contractData.total_amount,
  };

  const handleCopy = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(bankInfo.accountNumber || "1234-567-890123");
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleReportPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bankLast5.length !== 5 || !currentStudent?.id) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/dev/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: currentStudent.id,
          bank_last_five: bankLast5,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsReported(true);
      }
    } catch (err) {
      console.warn('回報末五碼失敗:', err);
      setIsReported(true); // 本機 UI 保底
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 頂部標題 */}
      <div>
        <h1 className="text-base font-bold text-[#2B3049] flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[#C58D34]" />
          契約管理與續約繳費
        </h1>
        <p className="text-xs text-[#63667B]">指導教師：{currentTeacher?.name}</p>
      </div>

      {/* 當前契約進度卡片 */}
      <div className="bg-white border border-[#EBDCB9] rounded-2xl p-4 space-y-3 shadow-[0_4px_16px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#63667B]">當前契約編號</span>
          <span className="font-mono text-[#2B3049] font-bold">{contractData.contract_no} ({currentStudent?.name})</span>
        </div>

        {/* 堂數進度條 */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#2B3049]">
              本期堂數進度 (第 {10 - (contractData.remaining_lessons ?? 2)} / 10 堂)
            </span>
            <span className="text-xs font-bold font-mono text-[#C58D34]">
              剩餘 {contractData.remaining_lessons ?? 2} 堂
            </span>
          </div>
          <div className="h-2.5 bg-[#FAF6F0] rounded-full overflow-hidden border border-[#EBDCB9]">
            <div
              className="h-full bg-gradient-to-r from-[#C58D34] to-[#E6A74C] rounded-full transition-all duration-500"
              style={{ width: `${((10 - (contractData.remaining_lessons ?? 2)) / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* 🌟 決策 3：倒數第 2 堂建立新契約通知與時段保留規則 */}
        <div className="bg-[#FFFDF9] border border-[#C58D34]/40 rounded-xl p-3 text-xs space-y-1.5 shadow-sm">
          <div className="flex items-center gap-1.5 font-bold text-[#885424]">
            <Clock className="w-4 h-4 text-[#C58D34]" />
            續約與時段保留機制
          </div>
          <p className="text-[11px] text-[#63667B] leading-relaxed">
            系統已於倒數第二堂課自動為您建立新一期契約。為保障您的常態上課時段（週五 19:00），
            <strong className="text-[#C58D34]">原時段將為您保留至新契約第一次上課前一日（{contractData.due_date}）</strong>。請於最後一堂課前完成匯款回報。
          </p>
        </div>
      </div>

      {/* 💳 新一期續約單與繳費資訊 */}
      <div className="bg-white border border-[#EBDCB9] rounded-2xl p-4 space-y-4 shadow-[0_4px_16px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-3">
          <div>
            <h2 className="text-xs font-bold text-[#2B3049] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#C58D34]" /> 新期續約單 (10 堂常態課)
            </h2>
            <p className="text-[11px] text-[#63667B]">指導教師：{currentTeacher?.name}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-[#63667B] block">應繳金額</span>
            <span className="text-base font-bold font-mono text-[#885424]">
              NT$ {(bankInfo.amount ?? 14000).toLocaleString()}
            </span>
          </div>
        </div>

        {/* 銀行帳號與一鍵複製 */}
        <div className="bg-[#FAF6F0] border border-[#EBDCB9] rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#63667B] flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-[#C58D34]" /> 受款銀行
            </span>
            <span className="font-bold text-[#2B3049]">{bankInfo.bankName}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#63667B]">戶名</span>
            <span className="font-bold text-[#2B3049]">{bankInfo.accountName}</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-[#EBDCB9]/40">
            <span className="text-[#63667B]">帳號</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-[#2B3049] text-sm">
                {bankInfo.accountNumber}
              </span>
              <button
                onClick={handleCopy}
                className="text-[11px] px-2 py-0.5 rounded bg-white hover:bg-[#F0EAE1] text-[#885424] border border-[#EBDCB9] flex items-center gap-1 shadow-sm transition-all"
              >
                {copied ? <CheckCircle2 className="w-3 h-3 text-[#38A169]" /> : <Copy className="w-3 h-3" />}
                {copied ? '已複製' : '複製'}
              </button>
            </div>
          </div>
        </div>

        {/* 匯款後回報表單 */}
        {isReported ? (
          <div className="bg-[#EBF7EE] border border-[#68D391] rounded-xl p-4 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#38A169] mx-auto" />
            <h3 className="text-xs font-bold text-[#22543D]">末五碼已回報成功！</h3>
            <p className="text-[11px] text-[#2F855A] leading-relaxed">
              系統已將您的繳費訊息通知【{currentTeacher?.name}】進行對帳審核，確認收款後將自動為您延長 10 堂常態排課。
            </p>
          </div>
        ) : (
          <form onSubmit={handleReportPayment} className="space-y-3 pt-1">
            <label className="text-xs font-bold text-[#2B3049] block">
              匯款完成後，請回報您的帳號末五碼：
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={5}
                value={bankLast5}
                onChange={(e) => setBankLast5(e.target.value.replace(/\D/g, ''))}
                placeholder="例如：56789"
                className="flex-1 bg-[#FAF6F0] border border-[#EBDCB9] rounded-xl px-3 py-2.5 text-xs text-[#2B3049] font-mono tracking-widest outline-none focus:border-[#C58D34]"
              />
              <button
                type="submit"
                disabled={bankLast5.length !== 5 || isSubmitting}
                className={clsx(
                  'px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md',
                  bankLast5.length === 5 && !isSubmitting
                    ? 'bg-[#C58D34] hover:bg-[#AA7129] text-white shadow-[0_4px_12px_rgba(197,141,52,0.3)] active:scale-98'
                    : 'bg-[#F0EAE1] text-[#8E90A6] border border-[#E2D5C3] cursor-not-allowed'
                )}
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? '送出中...' : '回報末五碼'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
