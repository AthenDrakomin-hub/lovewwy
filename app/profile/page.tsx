'use client'
import React, { useEffect, useState } from 'react';
import SharedNavbar from '../../components/SharedNavbar';
import { getAccessToken } from '../../src/lib/supabaseClient';

const ProfilePage: React.FC = () => {
  const [subscription, setSubscription] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await getAccessToken();
        const headers: Record<string,string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch('/api/subscriptions/status', { headers });
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) setSubscription(data.subscription ?? null);
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <SharedNavbar />
      <div className="pt-24 max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-black mb-4">Profile</h1>
        {subscription ? (
          <div className="p-6 bg-zinc-900 rounded-lg border border-zinc-800">
            <h2 className="text-xl font-bold mb-2">Subscription</h2>
            <p>Order: <strong>{subscription.order_no}</strong></p>
            <p>Status: <strong>{subscription.status}</strong></p>
            <p>Tx: <strong>{subscription.tx_hash ?? '—'}</strong></p>
            <pre className="mt-4 text-xs bg-black/30 p-3 rounded">{JSON.stringify(subscription.metadata ?? subscription, null, 2)}</pre>
          </div>
        ) : (
          <div className="p-6 bg-zinc-900 rounded-lg border border-zinc-800">No subscription found.</div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;