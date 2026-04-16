import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MOCK_INSTITUTIONS } from '../lib/constants';
import { useAuth } from '../contexts/AuthContext';
import BottomNav from '../components/BottomNav';

const InstitutionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('info'); // 'info' or 'reviews'
  const [reviewSort, setReviewSort] = useState('기본순');

  // Find institution from constants if not in state
  const institution = useMemo(() => {
    if (state?.institution) return state.institution;
    const all = [...MOCK_INSTITUTIONS.doctor, ...MOCK_INSTITUTIONS.rehab];
    return all.find(inst => inst.id === parseInt(id));
  }, [id, state]);

  if (!institution) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <span className="material-symbols-outlined text-6xl text-slate-200">error</span>
          <p className="text-slate-500 font-bold">병원을 찾을 수 없습니다.</p>
          <button onClick={() => navigate(-1)} className="text-primary font-bold underline">돌아가기</button>
        </div>
      </div>
    );
  }

  const handleReservation = () => {
    if (!user) {
      alert('로그인 회원만 이용 가능합니다. 로그인 페이지로 이동합니다.');
      navigate('/login');
      return;
    }
    navigate(`/request/${institution.id}`, { state: { institution, type: state?.type || 'doctor' } });
  };

  const doctorInfo = {
    departments: institution.category,
    background: [
      '경희대학교 의과대학 졸업',
      `${institution.category.split(',')[0]} 전문의`,
      '대한의사협회 정회원',
      '전) 서울대학교병원 외래교수',
      '국가공인 방문진료 인증의'
    ],
    intro: `${institution.name}은 20년 이상의 풍부한 임상 경험을 바탕으로, 거동이 불편하신 환자분들을 위해 직접 찾아가는 고품질 의료 서비스를 제공합니다. 환자 한 분 한 분을 내 가족처럼 정성껏 모시는 것이 저희의 진료 철학입니다.`,
    hours: [
      { day: '월요일', time: '09:30 ~ 17:30', lunch: '점심 12:00 ~ 13:00' },
      { day: '화요일', time: '09:30 ~ 17:30', lunch: '점심 12:00 ~ 13:00' },
      { day: '수요일', time: '09:30 ~ 17:30', lunch: '점심 12:00 ~ 13:00' },
      { day: '목요일', time: '09:30 ~ 17:30', lunch: '점심 12:00 ~ 13:00' },
      { day: '금요일', time: '09:30 ~ 17:30', lunch: '점심 12:00 ~ 13:00' },
      { day: '토요일', time: '09:30 ~ 13:00', lunch: '점심시간 없음' },
    ],
    address: '서울시 광진구 구의동 80-25번지 000 병원',
  };

  const reviewStats = {
    rating: institution.rating,
    total: institution.reviews,
    tags: [
      { label: '친절한 진료', count: Math.floor(institution.reviews * 0.8) },
      { label: '예약시간 준수', count: Math.floor(institution.reviews * 0.6) },
      { label: '자세한 설명', count: Math.floor(institution.reviews * 0.75) },
    ]
  };

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Mobile Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100 h-14 flex items-center px-4 md:hidden">
        <button onClick={() => navigate(-1)} className="material-symbols-outlined text-slate-800">arrow_back</button>
        <span className="flex-1 text-center font-bold text-slate-900 pr-8">{institution.name}</span>
      </header>

      {/* PC Header Sync (Simplified for detail page) */}
      <nav className="hidden md:flex fixed top-0 w-full z-50 glass-nav shadow-[0_4px_20px_rgba(0,0,0,0.04)] h-[70px] justify-center items-center px-6 max-w-full">
        <div className="flex justify-between items-center w-full max-w-[1280px]">
          <div className="flex items-center gap-2 text-primary cursor-pointer" onClick={() => navigate('/')}>
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>home_health</span>
            <span className="text-2xl font-headline font-black tracking-tight">방문닥터</span>
          </div>
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-slate-500 hover:text-primary transition-colors font-bold">
            <span className="material-symbols-outlined">close</span>
            닫기
          </button>
        </div>
      </nav>

      <main className="pt-14 md:pt-[70px] max-w-[800px] mx-auto overflow-hidden">
        {/* Main Image */}
        <div className="aspect-[16/10] md:aspect-[21/9] w-full bg-slate-100 overflow-hidden">
          <img src={institution.image} alt={institution.name} className="w-full h-full object-cover" />
        </div>

        {/* Basic Info */}
        <div className="p-5 md:p-8 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            {institution.category.split(',').slice(0, 3).map((cat, idx) => (
              <span key={idx} className="bg-primary/5 text-primary border border-primary/20 px-2 py-0.5 rounded text-[10px] md:text-xs font-medium">
                {cat.trim()} 전문의
              </span>
            ))}
          </div>
          
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">{institution.name}</h1>
            <div className="flex items-center gap-3">
              <span className="bg-green-50 text-green-600 px-2 py-1 rounded text-[10px] md:text-xs font-medium uppercase">예약가능</span>
              <div className="flex items-center gap-1 text-red-600 font-bold">
                <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                <span className="text-sm">{institution.rating}</span>
                <span className="text-slate-400 text-xs font-medium">({institution.reviews.toLocaleString()})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab System */}
        <div className="sticky top-14 md:top-[70px] bg-white border-b border-slate-100 z-40 flex">
          <button 
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-4 text-sm md:text-base font-bold transition-all border-b-2 ${activeTab === 'info' ? 'border-primary text-primary' : 'border-transparent text-slate-400'}`}
          >
            병원 및 의사 정보
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-4 text-sm md:text-base font-bold transition-all border-b-2 ${activeTab === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-slate-400'}`}
          >
            리뷰
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 md:p-8">
          {activeTab === 'info' ? (
            <div className="space-y-10">
              {/* Doctor Profile */}
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">clinical_notes</span>
                  진료과목
                </h3>
                <p className="text-slate-600 font-bold text-sm md:text-base">{doctorInfo.departments}</p>
              </section>

              <section className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">school</span>
                  의료진 약력
                </h3>
                <ul className="space-y-2">
                  {doctorInfo.background.map((item, idx) => (
                    <li key={idx} className="text-slate-600 text-sm md:text-base font-medium flex gap-2">
                      <span className="text-primary">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">person</span>
                  의사소개
                </h3>
                <p className="text-slate-600 text-sm md:text-base leading-relaxed font-medium">
                  {doctorInfo.intro}
                </p>
              </section>

              <section className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary">schedule</span>
                  진료시간
                </h3>
                <div className="space-y-2">
                  {doctorInfo.hours.map((hour, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm md:text-base">
                      <span className="text-slate-500 font-bold w-16">{hour.day}</span>
                      <div className="flex-1 flex justify-between gap-4">
                        <span className="text-slate-900 font-black">{hour.time}</span>
                        <span className="text-slate-400 text-xs font-medium shrink-0 pt-0.5">({hour.lunch})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                  병원위치
                </h3>
                <p className="text-slate-600 text-sm md:text-base font-bold mb-4">{doctorInfo.address}</p>
                {/* Map Placeholder */}
                <div className="aspect-video w-full bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden group">
                   <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/127.087,37.545,14,0/800x450?access_token=none')] bg-cover opacity-50 grayscale"></div>
                   <div className="relative z-10 flex flex-col items-center gap-2">
                     <span className="material-symbols-outlined text-4xl text-primary animate-bounce">location_on</span>
                     <span className="text-xs font-black text-slate-500 bg-white/90 px-3 py-1 rounded-full shadow-sm">지도 로딩 중...</span>
                   </div>
                </div>
              </section>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Review Summary */}
              <div className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-100 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                <div className="text-center md:border-r border-slate-200 md:pr-12">
                   <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-2">{reviewStats.rating}</h2>
                   <div className="flex items-center gap-0.5 text-red-600 justify-center mb-1">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                      ))}
                   </div>
                   <p className="text-slate-400 text-xs font-bold leading-tight">{reviewStats.total.toLocaleString()}개 후기</p>
                </div>
                <div className="flex-1 space-y-3 w-full">
                  {reviewStats.tags.map((tag, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-xs md:text-sm font-black text-slate-700 w-24">{tag.label}</span>
                      <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: `${(tag.count / reviewStats.total) * 100}%` }}></div>
                      </div>
                      <span className="text-[10px] md:text-xs font-black text-slate-400 w-10 text-right">{tag.count}명</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review List Actions */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex gap-4">
                  <button onClick={() => setReviewSort('기본순')} className={`text-xs md:text-sm font-black transition-colors ${reviewSort === '기본순' ? 'text-slate-900 border-b-2 border-slate-900 pb-2' : 'text-slate-400 pb-2'}`}>기본순</button>
                  <button onClick={() => setReviewSort('최신순')} className={`text-xs md:text-sm font-black transition-colors ${reviewSort === '최신순' ? 'text-slate-900 border-b-2 border-slate-900 pb-2' : 'text-slate-400 pb-2'}`}>최신순</button>
                </div>
              </div>

              {/* Review List Item Placeholder */}
              <div className="space-y-6">
                {[1, 2, 3].map(item => (
                  <div key={item} className="space-y-3 border-b border-slate-50 pb-6 last:border-0 relative">
                    {reviewSort === '기본순' && item <= 3 && (
                      <span className="inline-block bg-primary/10 text-primary text-[9px] font-black px-1.5 py-0.5 rounded-full mb-1">BEST REVIEW</span>
                    )}
                    <div className="flex justify-between items-start">
                       <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                            <span className="material-symbols-outlined text-slate-300 text-xl">person</span>
                          </div>
                          <div>
                            <p className="text-[11px] md:text-xs font-black text-slate-800">user_{Math.random().toString(36).substring(7)}</p>
                            <p className="text-[10px] text-slate-400 font-medium">2024.03.{Math.floor(Math.random() * 20) + 10}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-0.5 text-red-600">
                          {[1,2,3,4,5].map(s => (
                            <span key={s} className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: s <= 4 ? "'FILL' 1" : "" }}>favorite</span>
                          ))}
                       </div>
                    </div>
                    <p className="text-sm md:text-base text-slate-700 font-medium leading-relaxed">
                      방문진료는 처음이라 걱정했는데, 원장님께서 너무 친절하게 설명해 주시고 꼼꼼하게 진찰해 주셔서 감동받았습니다. 거동이 불편하신 어머니께서도 편안하게 치료받으실 수 있어 정말 좋았어요. 감사합니다!
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Fixed Bottom Action Button */}
      <div className="fixed bottom-20 md:bottom-0 w-full bg-white/90 backdrop-blur-md border-t border-slate-100 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] z-40 flex justify-center">
        <button 
          onClick={handleReservation}
          className="w-full max-w-[800px] h-14 md:h-16 bg-primary text-white text-lg md:text-xl font-black rounded-xl shadow-lg shadow-primary/25 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-2xl">event_available</span>
          진료 예약하기
        </button>
      </div>

      {/* Bottom Nav Sync */}
      <div className="md:hidden">
        <BottomNav active="home" />
      </div>
    </div>
  );
};

export default InstitutionDetail;
