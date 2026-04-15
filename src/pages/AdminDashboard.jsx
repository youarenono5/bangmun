import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
    
    // Subscribe to all changes in requests table for admin
    const subscription = supabase
      .channel('admin-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, () => {
        fetchRequests();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setRequests(data);
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    const { error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', id);

    if (error) {
      alert('상태 변경 실패: ' + error.message);
    }
  };

  return (
    <div className="bg-[#181c1e] min-h-screen text-white p-6 font-body">
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-headline font-extrabold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">admin_panel_settings</span>
            의료기관 관리자 데모
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">실시간 요청 관리 및 상태 변경</p>
        </div>
        <button onClick={() => window.location.href='/'} className="text-xs bg-white/10 px-4 py-2 rounded-lg font-bold">사용자 앱으로 가기</button>
      </header>

      <main className="max-w-4xl mx-auto space-y-4">
        {loading ? (
          <div>로딩 중...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
            <p className="text-on-surface-variant">들어온 방문 요청이 없습니다.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {requests.map((req) => (
              <div key={req.id} className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${req.type === 'doctor' ? 'bg-primary/20 text-primary' : 'bg-orange-500/20 text-orange-400'}`}>
                      {req.type === 'doctor' ? '진료' : '재활'}
                    </span>
                    <span className="text-xs text-on-surface-variant">{new Date(req.created_at).toLocaleString()}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{req.institution_name}</h3>
                    <p className="text-sm text-on-surface-variant mt-1"><span className="text-white">주소:</span> {req.address}</p>
                    <div className="mt-3 bg-white/5 p-4 rounded-xl text-sm italic">
                      "{req.symptoms}"
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col gap-2 justify-center shrink-0">
                   <button 
                    onClick={() => updateStatus(req.id, 'accepted')}
                    disabled={req.status === 'accepted'}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${req.status === 'accepted' ? 'bg-green-500/50 text-white cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`}
                   >
                    {req.status === 'accepted' ? '수락됨' : '수락하기'}
                   </button>
                   <button 
                    onClick={() => updateStatus(req.id, 'calling')}
                    disabled={req.status === 'calling'}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${req.status === 'calling' ? 'bg-blue-500/50 text-white cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                   >
                    {req.status === 'calling' ? '전화예정' : '전화하기'}
                   </button>
                   <button 
                    onClick={() => updateStatus(req.id, 'rejected')}
                    disabled={req.status === 'rejected'}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${req.status === 'rejected' ? 'bg-red-500/50 text-white cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600'}`}
                   >
                    {req.status === 'rejected' ? '거절됨' : '거절하기'}
                   </button>
                   <button 
                    onClick={() => updateStatus(req.id, 'pending')}
                    className="px-4 py-2 rounded-xl text-sm font-bold bg-white/10 text-white hover:bg-white/20"
                   >
                    대기로 복구
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
