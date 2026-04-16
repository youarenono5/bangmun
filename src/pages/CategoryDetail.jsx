import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_INSTITUTIONS, DEPARTMENTS } from '../lib/constants';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';

const CategoryDetail = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // States
  const [activeCategory, setActiveCategory] = useState(categoryName || '전체');
  const [activeSort, setActiveSort] = useState('기본순');
  const [activeFilter, setActiveFilter] = useState('전체');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const filteredInstitutions = useMemo(() => {
    let list = [...MOCK_INSTITUTIONS.doctor];
    
    // 1. Category Filtering
    if (activeCategory !== '전체') {
      list = list.filter(inst => inst.category.includes(activeCategory));
    }

    // 2. Additional Filter (회복기 재활병원, 주치의제도병원, 진료받은병원, 저장한병원)
    if (activeFilter === '회복기 재활병원') {
      list = list.slice(0, Math.ceil(list.length * 0.7)); 
    } else if (activeFilter === '주치의제도병원') {
      list = list.slice(0, Math.ceil(list.length * 0.5));
    } else if (activeFilter === '진료받은병원' || activeFilter === '저장한병원') {
      list = []; 
    }

    // 3. Sorting
    if (activeSort === '평점높은순') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (activeSort === '리뷰많은순') {
      list.sort((a, b) => b.reviews - a.reviews);
    }
    
    return list;
  }, [activeCategory, activeSort, activeFilter]);

  const sortOptions = ['기본순', '평점높은순', '리뷰많은순'];

  const handleInstitutionClick = (inst) => {
    navigate(`/institution/${inst.id}`, { state: { institution: inst, type: 'doctor' } });
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20 md:pb-0" onClick={() => setIsSortDropdownOpen(false)}>
      {/* Desktop Header Sync */}
      <nav className="hidden md:flex fixed top-0 w-full z-50 glass-nav shadow-[0_4px_20px_rgba(0,0,0,0.04)] h-[70px] justify-center items-center px-6 max-w-full">
        <div className="flex justify-between items-center w-full max-w-[1280px]">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-primary cursor-pointer" onClick={() => navigate('/')}>
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>home_health</span>
              <span className="text-2xl font-headline font-black tracking-tight">방문닥터</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
               <span className="text-sm font-bold text-on-surface-variant">{user?.email?.split('@')[0]}님</span>
            ) : (
               <button onClick={() => navigate('/login')} className="text-sm font-bold text-primary">로그인</button>
            )}
            <button className="p-2 text-slate-600 hover:text-primary transition-colors" onClick={() => navigate('/mypage')}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Header Sync */}
      <header className="md:hidden fixed top-0 w-full z-50 bg-slate-50/80 backdrop-blur-md shadow-sm border-b border-slate-100 h-14 flex items-center px-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="material-symbols-outlined text-slate-600">arrow_back</button>
          <span className="font-bold text-sm text-slate-900">{activeCategory}</span>
        </div>
      </header>

      <main className="pt-20 md:pt-28 container mx-auto max-w-[1280px] px-4 md:px-6">
        {/* Breadcrumb */}
        <div className="mb-4 md:mb-6">
          <p className="text-xs md:text-sm text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
            <span className="cursor-pointer hover:text-primary" onClick={() => navigate('/')}>방문진료</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary">{activeCategory}</span>
          </p>
        </div>

        {/* Category Header & Slider */}
        <div className="mb-6 md:mb-8 space-y-4 md:space-y-6">
          <div className="flex items-center gap-4 overflow-hidden">
            <h2 className="text-xl md:text-3xl font-black text-slate-900 shrink-0 leading-none">{activeCategory}</h2>
            <div className="flex gap-2.5 md:gap-3 overflow-x-auto no-scrollbar items-center py-1">
              {DEPARTMENTS.map(dept => (
                <button 
                  key={dept.name} 
                  onClick={() => {
                    setActiveCategory(dept.name);
                    navigate(`/category/${dept.name}`, { replace: true });
                  }}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-[11px] md:text-sm font-bold transition-all whitespace-nowrap ${activeCategory === dept.name ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-slate-500 border border-slate-100 hover:border-primary/30'}`}
                >
                  {dept.emoji} {dept.name}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Section */}
          <div className="flex items-start gap-2 mb-6 md:mb-8 relative z-30">
            {/* Sort Dropdown (Static) */}
            <div className="relative shrink-0">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSortDropdownOpen(!isSortDropdownOpen);
                }}
                className={`flex items-center gap-1 h-[34px] md:h-[38px] px-3 md:px-4 rounded-lg text-[10px] md:text-xs font-bold border transition-all whitespace-nowrap bg-slate-900 text-white border-slate-900 shadow-sm`}
              >
                {activeSort}
                <span className={`material-symbols-outlined text-[14px] md:text-[18px] transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
              </button>

              {/* Sort Dropdown Menu */}
              {isSortDropdownOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-36 md:w-40 bg-white border border-slate-100 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-3 py-1.5 md:py-2 bg-slate-50 border-b border-slate-100">
                    <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-tighter">정렬순서</span>
                  </div>
                  {sortOptions.map(option => (
                    <button
                      key={option}
                      onClick={() => {
                        setActiveSort(option);
                        setIsSortDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 md:px-4 py-2 md:py-2.5 text-[11px] md:text-sm font-bold transition-colors ${activeSort === option ? 'text-primary bg-primary/5' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Scrollable Filters */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1.5 px-1 -my-1.5 flex-1">
              {['회복기 재활병원', '주치의제도병원', '진료받은병원', '저장한병원'].map(filter => (
                <button 
                  key={filter} 
                  onClick={() => setActiveFilter(activeFilter === filter ? '전체' : filter)}
                  className={`h-[34px] md:h-[38px] px-3 md:px-4 rounded-lg text-[10px] md:text-xs font-bold border transition-all whitespace-nowrap ${activeFilter === filter ? 'bg-primary/5 border-primary text-primary shadow-[0_0_0_1px_rgba(25,118,210,1)]' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Institution List */}
        <div className="grid gap-3 md:gap-6 md:grid-cols-2 lg:grid-cols-2">
          {filteredInstitutions.length > 0 ? (
            filteredInstitutions.map((inst) => (
              <div 
                key={inst.id}
                onClick={() => handleInstitutionClick(inst)}
                className="flex bg-white rounded-lg md:rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all group cursor-pointer border border-slate-100 h-24 md:h-32"
              >
                <div className="w-24 md:w-40 overflow-hidden shrink-0">
                  <img src={inst.image} alt={inst.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="flex-1 p-2.5 md:p-4 flex flex-col justify-between overflow-hidden">
                  <div className="space-y-0.5 md:space-y-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-sm md:text-lg text-slate-900 group-hover:text-primary transition-colors truncate pr-2">{inst.name}</h4>
                      <span className={`${inst.status === 'open' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'} px-1.5 py-0.5 rounded text-[8px] md:text-[10px] font-black uppercase shrink-0`}>
                        {inst.status === 'open' ? 'Open' : 'Closed'}
                      </span>
                    </div>
                    <p className="text-[10px] md:text-xs text-slate-500 line-clamp-1">{inst.category}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-0 text-red-700 font-bold">
                         <span className="material-symbols-outlined text-[14px] scale-[0.7] origin-center -mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                         <span className="text-[10px] md:text-xs">{inst.rating}</span>
                         <span className="text-slate-400 text-[9px] md:text-[10px] font-medium ml-0.5">({inst.reviews.toLocaleString()})</span>
                      </div>
                      <span className="text-[10px] md:text-xs text-slate-400 font-medium">📍 {inst.distance}</span>
                    </div>
                    <span className="material-symbols-outlined text-primary text-lg md:text-xl group-hover:translate-x-1 transition-transform">chevron_right</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center space-y-4">
              <span className="material-symbols-outlined text-5xl md:text-6xl text-slate-200">event_busy</span>
              <p className="text-slate-400 font-bold text-sm md:text-base">{activeSort} 내역이 없습니다.</p>
              <button 
                onClick={() => {setActiveSort('기본순'); setActiveCategory('전체'); navigate('/category/전체');}} 
                className="text-primary font-bold text-xs underline"
              >
                전체보기로 돌아가기
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden">
        <BottomNav active="home" />
      </div>
    </div>
  );
};

export default CategoryDetail;
