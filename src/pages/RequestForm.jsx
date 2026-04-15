import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const RequestForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { institution, type } = location.state || {};

  const [symptoms, setSymptoms] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  if (!institution) {
    return <div className="p-8 text-center">정보를 불러올 수 없습니다. <button onClick={() => navigate('/')} className="text-primary font-bold underline">홈으로</button></div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('requests')
        .insert([
          {
            user_id: user.id,
            institution_id: institution.id,
            institution_name: institution.name,
            type: type, // 'doctor' or 'rehab'
            symptoms: symptoms,
            address: address,
            status: 'pending', // 'pending', 'accepted', 'rejected', 'calling'
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;

      alert('방문 요청이 성공적으로 접수되었습니다!');
      navigate('/history');
    } catch (err) {
      console.error('Submission error:', err);
      alert('요청 제출 중 오류가 발생했습니다. (주의: Supabase 테이블이 생성되어 있어야 합니다)');
      // For demo purposes, we can navigate anyway to history if we want to show mock flow
      navigate('/history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface min-h-screen">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 px-6 py-4 flex items-center gap-4">
        <span className="material-symbols-outlined cursor-pointer text-primary" onClick={() => navigate(-1)}>arrow_back</span>
        <h1 className="text-lg font-headline font-extrabold text-on-surface">방문 요청서 작성</h1>
      </header>

      <main className="max-w-md mx-auto p-6 space-y-6">
        {/* Selected Institution Info */}
        <section className="bg-white p-4 rounded-2xl shadow-sm border border-outline-variant/20 flex gap-4 items-center">
          <img src={institution.image} alt="" className="w-16 h-16 rounded-xl object-cover" />
          <div className="min-w-0">
            <h2 className="font-bold text-primary">{institution.name}</h2>
            <p className="text-xs text-on-surface-variant">{institution.category}</p>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-primary tracking-tight">서비스 유형</label>
            <div className="px-4 py-3 bg-blue-50 text-primary font-bold rounded-xl border border-primary/10">
              {type === 'doctor' ? '방문 진료' : '방문 재활'}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-primary tracking-tight">방문 받으실 주소</label>
            <textarea 
              required
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-outline-variant/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
              placeholder="상세 주소를 입력해주세요"
            ></textarea>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-primary tracking-tight">주요 증상 및 참고사항</label>
            <textarea 
              required
              rows={5}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-outline-variant/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
              placeholder="증상이나 의료진이 알아야 할 내용을 적어주세요"
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-primary text-white font-extrabold rounded-2xl active:scale-95 transition-all shadow-lg shadow-primary/25 disabled:opacity-50"
          >
            {loading ? '신청 중...' : '방문 요청 제출하기'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default RequestForm;
