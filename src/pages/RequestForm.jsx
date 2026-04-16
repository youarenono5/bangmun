import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const RequestForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { institution, type } = location.state || {};

  // States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [ssn, setSsn] = useState('');
  const [address, setAddress] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [wishDate, setWishDate] = useState('');
  const [wishTime, setWishTime] = useState('오전'); // '오전' or '오후'
  const [loading, setLoading] = useState(false);

  if (!institution) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <span className="material-symbols-outlined text-6xl text-slate-200">error</span>
          <p className="text-slate-500 font-bold">정보를 불러올 수 없습니다.</p>
          <button onClick={() => navigate('/')} className="text-primary font-bold underline">홈으로 이동</button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mock database insertion logic
      const applicationData = {
        user_id: user?.id,
        institution_id: institution.id,
        institution_name: institution.name,
        type: type, // 'doctor' or 'rehab'
        patient_name: name,
        patient_phone: phone,
        patient_ssn: ssn,
        address: address,
        symptoms: symptoms,
        wish_date: wishDate,
        wish_time: wishTime,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      console.log('Submitting application:', applicationData);

      // In a real app, you would uncomment this:
      // const { data, error } = await supabase.from('applications').insert([applicationData]);
      // if (error) throw error;

      alert('의료기관에서 확인후 전화로 연락드릴 예정입니다.');
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Submission error:', err);
      alert('요청 제출 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-12">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 h-16 flex items-center px-4 md:px-8">
        <div className="max-w-[800px] mx-auto w-full flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="material-symbols-outlined text-slate-600 hover:text-primary transition-colors">arrow_back</button>
          <h1 className="text-lg md:text-xl font-bold text-slate-900">방문 요청서 작성</h1>
        </div>
      </header>

      <main className="pt-24 max-w-[800px] mx-auto px-4 md:px-0 space-y-8">
        {/* Selected Institution Card */}
        <section className="bg-white p-5 rounded-lg shadow-sm border border-slate-100 flex gap-5 items-center">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden shrink-0 border border-slate-50">
            <img src={institution.image} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded">
                {type === 'doctor' ? '방문 진료' : '방문 재활'}
              </span>
            </div>
            <h2 className="font-bold text-slate-900 text-lg md:text-xl truncate">{institution.name}</h2>
            <p className="text-xs md:text-sm text-slate-400 font-medium">{institution.category}</p>
          </div>
        </section>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-8 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Service Type (Read-only display) */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-700 ml-1">서비스 유형</label>
              <div className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-lg text-primary font-black">
                {type === 'doctor' ? '방문 진료 서비스' : '방문 재활 서비스'}
              </div>
            </div>

            {/* Name and Phone */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">환자 성함</label>
              <input 
                required
                type="text"
                placeholder="성함을 입력하세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">연락처</label>
              <input 
                required
                type="tel"
                placeholder="'-' 없이 숫자만 입력"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
              />
            </div>

            {/* SSN */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-700 ml-1">주민등록번호 전체</label>
              <input 
                required
                type="text"
                placeholder="000000-0000000"
                value={ssn}
                onChange={(e) => setSsn(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium tracking-widest"
              />
            </div>

            {/* Address */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-700 ml-1">방문 받으실 상세 주소</label>
              <textarea 
                required
                rows={2}
                placeholder="상세 주소를 입력해주세요"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium resize-none"
              ></textarea>
            </div>

            {/* Symptoms */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-700 ml-1">주요 증상 및 참고사항</label>
              <textarea 
                required
                rows={4}
                placeholder="현 상태, 기저질환 등 의료진이 알아야 할 내용을 상세히 적어주세요"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium resize-none"
              ></textarea>
            </div>

            {/* Wish Date and Time */}
            <div className="space-y-2 md:col-span-2 pt-4 border-t border-slate-100">
               <label className="text-sm font-bold text-slate-700 ml-1">희망 일시</label>
               <div className="flex flex-col md:flex-row gap-3">
                 <input 
                   required
                   type="date"
                   value={wishDate}
                   onChange={(e) => setWishDate(e.target.value)}
                   className="w-full md:flex-1 px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-slate-900 text-sm md:text-base min-h-[52px]"
                 />
                 <div className="flex p-1 bg-slate-100 rounded-lg md:w-48">
                   <button 
                     type="button"
                     onClick={() => setWishTime('오전')}
                     className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${wishTime === '오전' ? 'bg-white text-primary shadow-sm' : 'text-slate-400'}`}
                   >오전</button>
                   <button 
                     type="button"
                     onClick={() => setWishTime('오후')}
                     className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${wishTime === '오후' ? 'bg-white text-primary shadow-sm' : 'text-slate-400'}`}
                   >오후</button>
                 </div>
               </div>
               <p className="text-[11px] text-slate-400 font-medium mt-1">※ 정확한 방문 시간은 담당 의료기관과 협의 후 확정됩니다.</p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 md:py-5 bg-primary text-white text-base md:text-lg font-black rounded-lg shadow-lg shadow-primary/25 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? '신청 처리 중...' : '방문 요청 제출하기'}
            </button>
            <p className="text-center text-xs text-slate-400 mt-4 font-medium">제출된 정보는 의료기관의 진료 목적으로만 사용됩니다.</p>
          </div>
        </form>
      </main>
    </div>
  );
};

export default RequestForm;
