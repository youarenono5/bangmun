import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import BottomNav from '../components/BottomNav';

const History = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Fetch initial requests
    const fetchRequests = async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setRequests(data);
      setLoading(false);
    };

    fetchRequests();

    // Subscribe to Realtime changes for 'requests' table
    const subscription = supabase
      .channel('request-status-updates')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'applications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('Change received!', payload);
        
        // Update the list
        setRequests(prev => prev.map(req => req.id === payload.new.id ? payload.new : req));

        // Show a notification if status changed
        const statusMap = {
          accepted: '방문 요청이 수락되었습니다!',
          rejected: '방문 요청이 거절되었습니다.',
          calling: '의료기관에서 곧 전화를 드릴 예정입니다.'
        };

        if (statusMap[payload.new.status]) {
          setNotification({
            msg: `${payload.new.institution_name}: ${statusMap[payload.new.status]}`,
            type: payload.new.status
          });
          // Auto-hide notification after 5 seconds
          setTimeout(() => setNotification(null), 5000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending': return { label: '대기 중', color: 'bg-surface-container text-on-surface-variant' };
      case 'accepted': return { label: '수락됨', color: 'bg-green-100 text-green-700' };
      case 'rejected': return { label: '거절됨', color: 'bg-red-100 text-red-700' };
      case 'calling': return { label: '전화 예정', color: 'bg-blue-100 text-primary' };
      default: return { label: '알 수 없음', color: 'bg-slate-100' };
    }
  };

  return (
    <div className="pb-24 bg-surface min-h-screen">
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-50">
        <div className="flex items-center px-6 py-4 w-full max-w-md mx-auto text-lg font-headline font-extrabold text-on-surface">
          진료/재활 내역
        </div>
      </header>

      <main className="mt-16 w-full max-w-md mx-auto px-4 space-y-4 pt-4">
        {notification && (
          <div className={`p-4 rounded-2xl shadow-lg border-2 animate-bounce ${notification.type === 'accepted' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">{notification.type === 'accepted' ? 'check_circle' : 'notifications_active'}</span>
              <p className="text-sm font-bold">{notification.msg}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-10 text-on-surface-variant font-medium">내역을 불러오는 중...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <span className="material-symbols-outlined text-4xl text-outline-variant">history</span>
            <p className="text-on-surface-variant font-medium text-sm">진료/재활 내역이 없습니다.</p>
          </div>
        ) : (
          requests.map((req) => {
            const status = getStatusInfo(req.status);
            return (
              <div key={req.id} className="bg-white p-5 rounded-2xl shadow-sm border border-outline-variant/20 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${req.type === 'doctor' ? 'bg-blue-50 text-primary' : 'bg-orange-50 text-orange-600'}`}>
                      {req.type === 'doctor' ? '방문 진료' : '방문 재활'}
                    </span>
                    <h3 className="font-extrabold text-on-surface">{req.institution_name}</h3>
                  </div>
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-lg ${status.color}`}>
                    {status.label}
                  </span>
                </div>
                
                <div className="text-xs text-on-surface-variant line-clamp-2 bg-surface-container-low p-2 rounded-lg">
                  {req.symptoms}
                </div>
                
                <div className="flex justify-between items-center text-[11px] text-outline pt-1">
                   <span>{new Date(req.created_at).toLocaleDateString()}</span>
                   {req.status === 'calling' && <button className="text-primary font-bold">전화 걸기</button>}
                </div>
              </div>
            );
          })
        )}
      </main>

      <BottomNav active="history" />
    </div>
  );
};

export default History;
