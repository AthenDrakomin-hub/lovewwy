"use client";

import React, { useState } from 'react';
import { getAccessToken } from '../src/lib/supabaseClient';

interface Props {
  amount?: string;
  onSuccess?: () => void;
  translations?: any;
}

const SubscribeButton: React.FC<Props> = ({ amount = '9.9', onSuccess, translations }) => {
  const [loading, setLoading] = useState(false);
  const [orderNo, setOrderNo] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const startCheckout = async () => {
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setOrderNo(data?.orderNo ?? data?.order_no ?? data?.orderNo ?? null);
      setStatusMsg('Order created. Follow the instructions to send payment with Memo = orderNo.');
    } catch (e: any) {
      setStatusMsg(`Failed to create order: ${e?.message || String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  const checkPayment = async () => {
    if (!orderNo) return;
    setChecking(true);
    setStatusMsg('Checking...');
    try {
      const res = await fetch(`/api/payments/status?orderNo=${encodeURIComponent(orderNo)}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (data?.status === 'paid') {
        // confirm and persist
        const token = await getAccessToken();
        const confirmRes = await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ orderNo }),
        });
        if (!confirmRes.ok) throw new Error(await confirmRes.text());
        const conf = await confirmRes.json();
        setStatusMsg('Payment confirmed. Access unlocked.');
        onSuccess?.();
      } else {
        setStatusMsg(`Current status: ${data?.status ?? 'unknown'}`);
      }
    } catch (e: any) {
      setStatusMsg(`Error checking payment: ${e?.message ?? String(e)}`);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div>
      {!orderNo ? (
        <button
          onClick={startCheckout}
          disabled={loading}
          className="w-full py-6 bg-white text-black font-black rounded-[28px] hover:bg-amber-500 hover:text-white transition-all transform hover:-translate-y-1 active:scale-[0.98] shadow-2xl shadow-white/10 text-base"
        >
          {loading ? 'Creating...' : translations?.unlockBtn ?? 'Subscribe Now'}
        </button>
      ) : (
        <div>
          <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900">
            <p className="font-mono text-sm text-zinc-400 break-words">Order: <span className="text-amber-400 font-bold">{orderNo}</span></p>
            <p className="text-zinc-400 text-sm mt-2">请使用你的 TRC20 USDT 钱包发送 <strong>{amount} USDT</strong>，并将 Memo/备注 设置为上面的订单号，系统会自动检测到账后解锁访问权限。</p>
            <div className="flex gap-2 mt-4">
              <button onClick={checkPayment} disabled={checking} className="px-4 py-2 bg-amber-500 text-black font-bold rounded">{checking ? 'Checking...' : 'Check Payment'}</button>
              <button onClick={() => { setOrderNo(null); setStatusMsg(null); }} className="px-4 py-2 border border-zinc-800 rounded text-zinc-400">Cancel</button>
            </div>
            {statusMsg && <p className="mt-3 text-sm text-zinc-300">{statusMsg}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscribeButton;
