import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BottomNav from '../components/BottomNav';
import { MOCK_INSTITUTIONS, DEPARTMENTS } from '../lib/constants';

const REGION_DATA = [
  { name: '서울', sub: ['강남구', '강서구', '강동구', '강북구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'] },
  { name: '경기', sub: ['수원시', '고양시', '용인시', '성남시', '부천시', '화성시', '안산시', '남양주시', '안양시', '평택시', '시흥시', '파주시', '의정부시', '김포시', '광명시', '광주시', '군포시', '이천시', '오산시', '하남시', '양주시', '구리시', '안성시', '포천시', '의왕시', '여주시', '양평군', '동두천시', '가평군', '과천시', '연천군'] },
  { name: '인천', sub: ['계양구', '미추홀구', '남동구', '동구', '부평구', '서구', '연수구', '중구', '강화군', '옹진군'] },
  { name: '부산', sub: ['강서구', '금정구', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구', '기장군'] },
  { name: '대구', sub: ['남구', '달서구', '동구', '북구', '서구', '수성구', '중구', '달성군', '군위군'] },
  { name: '광주', sub: ['광산구', '남구', '동구', '북구', '서구'] },
  { name: '대전', sub: ['대덕구', '동구', '서구', '유성구', '중구'] },
  { name: '울산', sub: ['남구', '동구', '북구', '중구', '울주군'] },
  { name: '세종', sub: ['세종시'] },
  { name: '강원', sub: ['춘천시', '원주시', '강릉시', '동해시', '태백시', '속초시', '삼척시', '홍천군', '횡성군', '영월군', '평창군', '정선군', '철원군', '화천군', '양구군', '인제군', '고성군', '양양군'] },
  { name: '충북', sub: ['청주시', '충주시', '제천시', '보은군', '옥천군', '영동군', '증평군', '진천군', '괴산군', '음성군', '단양군'] },
  { name: '충남', sub: ['천안시', '공주시', '보령시', '아산시', '서산시', '논산시', '계룡시', '당진시', '금산군', '부여군', '서천군', '청양군', '홍성군', '예산군', '태안군'] },
  { name: '전북', sub: ['전주시', '군산시', '익산시', '정읍시', '남원시', '김제시', '완주군', '진안군', '무주군', '장수군', '임실군', '순창군', '고창군', '부안군'] },
  { name: '전남', sub: ['목포시', '여수시', '순천시', '나주시', '광양시', '담양군', '곡성군', '구례군', '고흥군', '보성군', '화순군', '장흥군', '강진군', '해남군', '영암군', '무안군', '함평군', '영광군', '장성군', '완도군', '진도군', '신안군'] },
  { name: '경북', sub: ['포항시', '경주시', '김천시', '안동시', '구미시', '영주시', '영천시', '상주시', '문경시', '경산시', '의성군', '청송군', '영양군', '영덕군', '청도군', '고령군', '성주군', '칠곡군', '예천군', '봉화군', '울진군', '울릉군'] },
  { name: '경남', sub: ['창원시', '진주시', '통영시', '사천시', '김해시', '밀양시', '거제시', '양산시', '의령군', '함안군', '창녕군', '고성군', '남해군', '하동군', '산청군', '함양군', '거창군', '합천군'] },
  { name: '제주', sub: ['제주시', '서귀포시'] },
];

const BANNERS = [
  {
    id: 1,
    title: <>방문진료, 방문재활 1위<br/>방문닥터와 함께하세요</>,
    subtitle: "어디서든 전문 의료진을 만나는 새로운 방법, 방문닥터가 찾아갑니다.",
    image: "https://images.unsplash.com/photo-1505751172107-1bc329bc03d6?auto=format&fit=crop&q=80&w=2000",
    gradient: "from-primary to-[#004BB3]",
    tag: "Clinical Sanctuary",
    icon: "home_health"
  },
  {
    id: 2,
    title: <>당일도 바로 방문하는<br/>방문닥터</>,
    subtitle: "갑자기 아프실 때, 주저하지 말고 방문닥터로 신청하세요.",
    image: "https://images.unsplash.com/photo-1559839734-2b71f1e598c6?auto=format&fit=crop&q=80&w=2000",
    gradient: "from-teal-600 to-emerald-800",
    tag: "Fast Care",
    icon: "bolt"
  },
  {
    id: 3,
    title: <>나의 주치의를<br/>선정하세요.</>,
    subtitle: "나와 우리 가족을 가장 잘 아는 전문의를 직접 선택할 수 있습니다.",
    image: "https://images.unsplash.com/photo-1581056770617-bc73070445d4?auto=format&fit=crop&q=80&w=2000",
    gradient: "from-blue-600 to-indigo-800",
    tag: "Personal Doctor",
    icon: "person_check"
  },
  {
    id: 4,
    title: <>방문진료 누구나<br/>받을 수 있습니다.</>,
    subtitle: "거동이 불편하거나 병원 방문이 힘든 모든 분들을 위해 존재합니다.",
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=2000",
    gradient: "from-slate-700 to-slate-900",
    tag: "Universal Health",
    icon: "groups"
  }
];

const Home = () => {
  const [activeTab, setActiveTab] = useState('doctor'); // 'doctor' or 'rehab'
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('전체');
  
  // Regional Search States (for Rehab tab)
  const [activeSido, setActiveSido] = useState('전체'); // Si/Do
  const [activeSigungu, setActiveSigungu] = useState('전체'); // Si/Gun/Gu
  
  // Banner Loop States
  const extendedBanners = [BANNERS[BANNERS.length - 1], ...BANNERS, BANNERS[0]];
  const [currentIndex, setCurrentIndex] = useState(1);
  const [transitionTime, setTransitionTime] = useState(700); // ms
  const [isPaused, setIsPaused] = useState(false);

  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, currentIndex]);

  const handleNext = () => {
    setTransitionTime(700);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleTransitionEnd = () => {
    if (currentIndex === 0) {
      setTransitionTime(0);
      setCurrentIndex(BANNERS.length);
    } else if (currentIndex === extendedBanners.length - 1) {
      setTransitionTime(0);
      setCurrentIndex(1);
    }
  };

  const goToBanner = (idx) => {
    setTransitionTime(700);
    setCurrentIndex(idx + 1);
  };

  const checkActive = (idx) => {
    if (currentIndex === idx) return true;
    if (currentIndex === extendedBanners.length - 1 && idx === 1) return true;
    if (currentIndex === 0 && idx === BANNERS.length) return true;
    if (currentIndex === 1 && idx === extendedBanners.length - 1) return true;
    if (currentIndex === BANNERS.length && idx === 0) return true;
    return false;
  };

  const filteredInstitutions = useMemo(() => {
    let list = MOCK_INSTITUTIONS[activeTab];

    if (activeTab === 'doctor' && activeFilter !== '전체') {
      list = list.filter(inst => inst.category.includes(activeFilter));
    }

    if (activeTab === 'rehab') {
      if (activeSido !== '전체') {
        list = list.filter(inst => inst.region === activeSido);
      }
      if (activeSigungu !== '전체') {
        list = list.filter(inst => inst.sigungu === activeSigungu);
      }
    }

    if (activeTab === 'doctor' && searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(inst => 
        inst.name.toLowerCase().includes(term) || 
        inst.category.toLowerCase().includes(term) || 
        inst.symptoms.toLowerCase().includes(term)
      );
    }

    return list;
  }, [activeTab, searchTerm, activeFilter, activeSido, activeSigungu]);

  const handleInstitutionClick = (inst) => {
    navigate(`/institution/${inst.id}`, { state: { institution: inst, type: activeTab } });
  };

  return (
    <div className="bg-surface min-h-screen">
      {/* Desktop Header */}
      <nav className="hidden md:flex fixed top-0 w-full z-50 glass-nav shadow-[0_4px_20px_rgba(0,0,0,0.04)] h-[70px] justify-center items-center px-6 max-w-full">
        <div className="flex justify-between items-center w-full max-w-[1280px]">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-primary cursor-pointer" onClick={() => navigate('/')}>
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>home_health</span>
              <span className="text-2xl font-headline font-black tracking-tight">방문닥터</span>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              {user ? (
                <span className="text-sm font-bold text-on-surface-variant">{user?.email?.split('@')[0]}님</span>
              ) : (
                <>
                  <Link className="text-slate-600 font-bold hover:text-primary transition-colors text-sm" to="/login">로그인</Link>
                  <Link className="bg-primary text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-primary-container transition-all shadow-md shadow-primary/20" to="/signup">회원가입</Link>
                </>
              )}
            </div>
            <div className="flex items-center gap-4 border-l border-slate-200 pl-8">
              <button className="p-2 text-slate-600 hover:text-primary transition-colors">
                <span className="material-symbols-outlined">favorite</span>
              </button>
              <button className="p-2 text-slate-600 hover:text-primary transition-colors relative">
                <span className="material-symbols-outlined">notifications</span>
                {user && <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full animate-pulse"></span>}
              </button>
              <button className="p-2 text-slate-600 hover:text-primary transition-colors" onClick={() => navigate('/mypage')}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 w-full z-50 bg-slate-50/80 backdrop-blur-md shadow-sm border-b border-slate-100">
        <div className="flex items-center justify-between px-6 pt-[13px] pb-[11px] w-full max-w-md mx-auto">
          <h1 className="text-primary font-headline font-extrabold tracking-tight text-lg cursor-pointer" onClick={() => navigate('/')}>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>home_health</span>
              <span>방문닥터</span>
            </div>
          </h1>
          <div className="flex items-center gap-0.5">
            <button className="p-2 text-primary hover:bg-primary/5 rounded-full transition-colors">
              <span className="material-symbols-outlined text-[22px]">search</span>
            </button>
            <button className="p-2 text-primary hover:bg-primary/5 rounded-full transition-colors relative">
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              {user && <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-error rounded-full"></span>}
            </button>
            {!user && (
              <div className="flex items-center ml-1 pl-2 border-l border-slate-200">
                <Link to="/login" className="text-[11px] font-extrabold text-primary px-2 py-1">로그인</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="pt-16 md:pt-20">
        {/* Desktop Hero Section */}
        <section 
          className="hidden md:block relative h-[360px] w-full overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div 
            className="flex h-full" 
            style={{ 
              transform: `translateX(-${currentIndex * 100}%)`,
              transition: transitionTime > 0 ? `transform ${transitionTime}ms ease-in-out` : 'none'
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {extendedBanners.map((banner, idx) => (
              <div 
                key={`${banner.id}-${idx}`}
                className={`min-w-full h-full relative flex items-center bg-gradient-to-br ${banner.gradient}`}
              >
                <div className="absolute inset-0 opacity-10">
                  <img src={banner.image} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="container mx-auto px-6 relative z-10 max-w-[1280px]">
                  <div className={`max-w-2xl space-y-4 transition-all duration-700 delay-300 ${checkActive(idx) ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white font-bold text-xs tracking-wider uppercase">{banner.tag}</span>
                    <h1 className="text-5xl font-extrabold text-white leading-tight">
                      {banner.title}
                    </h1>
                    <p className="text-blue-100 text-lg font-body">{banner.subtitle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Banner dots */}
          <div className="absolute bottom-10 right-10 z-20 flex gap-2">
            {BANNERS.map((_, idx) => (
              <button 
                key={idx} 
                onClick={() => goToBanner(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${((currentIndex - 1 + BANNERS.length) % BANNERS.length) === idx ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/60'}`}
              />
            ))}
          </div>
        </section>

        <div className="container mx-auto px-4 md:px-6 py-6 md:py-12 flex flex-col gap-3 md:gap-10 max-w-[1280px]">
          
          {/* Mobile Banner (Hero Section) */}
          <div className="md:hidden">
            <div className="relative w-full h-[102px] rounded-lg md:rounded-2xl overflow-hidden shadow-md">
              <div 
                className="flex h-full"
                style={{ 
                  transform: `translateX(-${currentIndex * 100}%)`,
                  transition: transitionTime > 0 ? `transform ${transitionTime}ms ease-in-out` : 'none'
                }}
                onTransitionEnd={handleTransitionEnd}
              >
                {extendedBanners.map((banner, idx) => (
                  <section 
                    key={`${banner.id}-${idx}`}
                    className={`min-w-full h-full relative bg-gradient-to-r ${banner.gradient} flex items-center px-6`}
                  >
                    <div className={`space-y-1 transition-all duration-500 ${checkActive(idx) ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
                      <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm uppercase">{banner.tag}</span>
                      <h2 className="text-white font-headline font-bold text-lg leading-tight">{banner.title}</h2>
                    </div>
                    <span className={`material-symbols-outlined text-6xl ml-auto opacity-30 text-white transition-all duration-700 ${checkActive(idx) ? 'scale-100' : 'scale-50'}`} style={{ fontVariationSettings: "'wght' 200" }}>{banner.icon}</span>
                  </section>
                ))}
              </div>
              
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1 bg-black/10 backdrop-blur-sm rounded-full">
                {BANNERS.map((_, idx) => (
                  <div key={idx} className={`w-1 h-1 rounded-full transition-all ${((currentIndex - 1 + BANNERS.length) % BANNERS.length) === idx ? 'bg-white' : 'bg-white/30'}`} />
                ))}
              </div>
            </div>
          </div>

          {/* Service & Department Integrated Selector (Unified PC/Mobile Design) */}
          <section className="md:-mt-24 relative z-20">
            <div className="bg-white p-4 md:p-10 rounded-xl md:rounded-xl shadow-xl shadow-primary/5 border border-primary/5 space-y-4 md:space-y-12">
              
              {/* Service Tabs */}
              <div className="flex flex-row gap-3 md:gap-8 max-w-full">
                <button 
                  onClick={() => { setActiveTab('doctor'); setSearchTerm(''); }}
                  className={`relative flex-1 h-16 md:h-auto px-5 md:p-8 rounded-lg md:rounded-lg transition-all duration-500 flex flex-row items-center justify-center md:justify-between group cursor-pointer overflow-hidden ${
                    activeTab === 'doctor' 
                    ? 'bg-gradient-to-br from-primary to-blue-700 text-white shadow-2xl shadow-primary/30 scale-[1.02] -translate-y-1' 
                    : 'bg-slate-100 border-[1.5px] border-slate-200 text-slate-400 grayscale opacity-80 hover:opacity-100 hover:shadow-lg'
                  }`}
                >
                  {/* Decorative Background Element */}
                  {activeTab === 'doctor' && (
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                  )}
                  
                  <div className="text-center md:text-left z-10 flex items-center md:block gap-2">
                    <h3 className={`text-base md:text-2xl font-bold tracking-tight ${activeTab === 'doctor' ? 'text-white' : 'text-slate-600'}`}>
                      방문진료 <span className="md:hidden">🩺</span>
                    </h3>
                    <p className={`hidden md:block text-sm font-medium leading-relaxed mt-1 ${activeTab === 'doctor' ? 'text-white/80' : 'text-slate-500'}`}>
                      거동이 불편하신 분들을 위한 의료진 방문진료
                    </p>
                  </div>

                  <div className={`hidden md:flex relative w-16 h-16 items-center justify-center rounded-2xl transition-all duration-500 ${
                    activeTab === 'doctor' 
                    ? 'bg-white/20 backdrop-blur-md shadow-inner' 
                    : 'bg-white/50 group-hover:bg-primary/5'
                  }`}>
                    <span className={`material-symbols-outlined text-4xl transition-all duration-500 ${
                      activeTab === 'doctor' ? 'text-white scale-110' : 'text-slate-400 group-hover:text-primary'
                    }`} style={{ fontVariationSettings: activeTab === 'doctor' ? "'FILL' 1" : "'FILL' 0" }}>
                      home_health
                    </span>
                  </div>
                </button>

                <button 
                  onClick={() => { setActiveTab('rehab'); setSearchTerm(''); }}
                  className={`relative flex-1 h-16 md:h-auto px-5 md:p-8 rounded-lg md:rounded-lg transition-all duration-500 flex flex-row items-center justify-center md:justify-between group cursor-pointer overflow-hidden ${
                    activeTab === 'rehab' 
                    ? 'bg-gradient-to-br from-teal-600 to-emerald-800 text-white shadow-2xl shadow-teal-900/20 scale-[1.02] -translate-y-1' 
                    : 'bg-slate-100 border-[1.5px] border-slate-200 text-slate-400 grayscale opacity-80 hover:opacity-100 hover:shadow-lg'
                  }`}
                >
                  {/* Decorative Background Element */}
                  {activeTab === 'rehab' && (
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                  )}

                  <div className="text-center md:text-left z-10 flex items-center md:block gap-2">
                    <h3 className={`text-base md:text-2xl font-bold tracking-tight ${activeTab === 'rehab' ? 'text-white' : 'text-slate-600'}`}>
                      방문재활 <span className="md:hidden">🧘</span>
                    </h3>
                    <p className={`hidden md:block text-sm font-medium leading-relaxed mt-1 ${activeTab === 'rehab' ? 'text-white/80' : 'text-slate-500'}`}>
                      일상 복귀를 돕는 1:1 체계적 재활
                    </p>
                  </div>

                  <div className={`hidden md:flex relative w-16 h-16 items-center justify-center rounded-2xl transition-all duration-500 ${
                    activeTab === 'rehab' 
                    ? 'bg-white/20 backdrop-blur-md shadow-inner' 
                    : 'bg-white/50 group-hover:bg-teal-50'
                  }`}>
                    <span className={`material-symbols-outlined text-4xl transition-all duration-500 ${
                      activeTab === 'rehab' ? 'text-white scale-110' : 'text-slate-400 group-hover:text-teal-600'
                    }`} style={{ fontVariationSettings: activeTab === 'rehab' ? "'FILL' 1" : "'FILL' 0" }}>
                      physical_therapy
                    </span>
                  </div>
                </button>
              </div>

              {/* Conditional Filter Section (Department for Doctor, Region for Rehab) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary rounded-full md:hidden"></div>
                  <h2 className="text-base md:text-2xl font-bold text-on-surface">
                    {activeTab === 'doctor' ? '진료과목별 찾기' : '지역으로 찾기'}
                  </h2>
                </div>
                
                {activeTab === 'doctor' ? (
                  <>
                    <div className="grid grid-cols-5 md:grid-cols-7 gap-x-2 gap-y-2 md:gap-x-4 md:gap-y-6">
                      {DEPARTMENTS.map((dept) => (
                        <button
                          key={dept.name}
                          onClick={() => navigate(`/category/${dept.name}`)}
                          className={`flex flex-col items-center justify-center p-1 md:p-2 rounded-lg transition-all group opacity-80 hover:opacity-100`}
                        >
                          <div className={`w-10 h-10 md:w-16 md:h-16 rounded-lg ${dept.bgColor} flex items-center justify-center mb-2 shadow-sm transition-all group-hover:scale-110 group-hover:shadow-md`}>
                            <span className="text-xl md:text-3xl filter drop-shadow-sm">{dept.emoji}</span>
                          </div>
                          <span className={`text-[10px] md:text-xs font-medium truncate w-full text-center leading-tight transition-colors text-on-surface-variant`}>{dept.name}</span>
                        </button>
                      ))}
                    </div>
                    
                    {/* Integrated Search Bar inside Visiting Doctor Tab */}
                    <div className="mt-6 flex items-center bg-surface-container-lowest border-2 border-primary/10 px-5 py-2.5 rounded-lg shadow-sm gap-4 focus-within:ring-4 ring-primary/5 transition-all group focus-within:border-primary/30">
                      <span className="material-symbols-outlined text-primary font-black group-focus-within:scale-110 transition-transform">search</span>
                      <input 
                        className="bg-transparent border-none focus:ring-0 text-sm w-full font-medium text-on-surface placeholder:text-on-surface-variant/40" 
                        placeholder="병원이름, 진료과목, 증상을 입력하세요" 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    {/* Step 1: Si/Do */}
                    <div className="relative group w-full md:flex-1">
                      <select 
                        value={activeSido}
                        onChange={(e) => {
                          setActiveSido(e.target.value);
                          setActiveSigungu('전체');
                        }}
                        className="w-full bg-surface-container-low border-2 border-primary/10 rounded-lg px-5 py-4 text-base font-medium text-on-surface appearance-none focus:ring-4 ring-primary/5 focus:border-primary transition-all cursor-pointer"
                      >
                        <option value="전체">전국 전체</option>
                        {REGION_DATA.map(region => (
                          <option key={region.name} value={region.name}>{region.name}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-primary pointer-events-none group-hover:translate-y-[-40%] transition-transform">expand_more</span>
                    </div>

                    {/* Step 2: Si/Gun/Gu */}
                    <div className="relative group w-full md:flex-1">
                      <select 
                        value={activeSigungu}
                        onChange={(e) => setActiveSigungu(e.target.value)}
                        disabled={activeSido === '전체'}
                        className={`w-full bg-surface-container-low border-2 border-primary/10 rounded-lg px-5 py-4 text-base font-medium text-on-surface appearance-none focus:ring-4 ring-primary/5 focus:border-primary transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <option value="전체">시/군/구 전체</option>
                        {activeSido !== '전체' && 
                          REGION_DATA.find(r => r.name === activeSido)?.sub.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))
                        }
                      </select>
                      <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-primary pointer-events-none group-hover:translate-y-[-40%] transition-transform">expand_more</span>
                    </div>

                    <div className="hidden md:flex items-center text-primary/40">
                      <span className="material-symbols-outlined">chevron_right</span>
                    </div>
                    
                    <button className="w-full md:w-auto bg-primary text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                      지역별 검색
                    </button>
                  </div>
                )}
              </div>

            </div>
          </section>

          {/* Institution List (Responsive Layout) */}
          <section className="space-y-6">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 md:gap-4">
               <div className="flex items-center gap-3">
                  <h3 className="text-xl md:text-2xl font-extrabold text-primary shrink-0">우리 동네 추천 {activeTab === 'doctor' ? '병원' : '센터'}</h3>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pt-1">
                    {['지금 진료중', '토요일 진료'].map((filter) => (
                      <button key={filter} className={`px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold border transition-all whitespace-nowrap ${filter === '지금 진료중' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white border-outline-variant/30 text-outline'}`}>
                        {filter === '지금 진료중' && <span className="inline-block w-1 h-1 bg-green-500 rounded-full mr-1 animate-pulse"></span>}
                        {filter}
                      </button>
                    ))}
                  </div>
               </div>
               <p className="text-on-surface-variant text-[10px] md:text-sm font-bold bg-white px-3 py-1 rounded-full border border-outline-variant/20 shadow-sm">검색 결과: <span className="text-primary">{filteredInstitutions.length}</span>건</p>
             </div>

             <div className={`grid gap-2 md:gap-5 ${filteredInstitutions.length === 0 ? 'place-items-center py-20' : 'md:grid-cols-2 lg:grid-cols-2'}`}>
               {filteredInstitutions.length === 0 ? (
                 <div className="text-center space-y-4 col-span-full">
                    <span className="material-symbols-outlined text-6xl text-outline-variant">search_off</span>
                    <p className="font-bold text-on-surface-variant">검색 결과가 없습니다.</p>
                    <button onClick={() => {setSearchTerm(''); setActiveFilter('전체');}} className="text-primary font-bold underline">초기화하기</button>
                 </div>
               ) : (
                filteredInstitutions.map((inst) => (
                  <div 
                    key={inst.id}
                    onClick={() => handleInstitutionClick(inst)}
                    className="flex bg-white rounded-lg md:rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all group cursor-pointer border border-outline-variant/10 hover:border-primary/20 h-24 md:h-32"
                  >
                    <div className="w-24 md:w-40 overflow-hidden shrink-0">
                      <img src={inst.image} alt={inst.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 p-2.5 md:p-4 flex flex-col justify-between">
                      <div className="space-y-0.5 md:space-y-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-base md:text-xl text-on-surface group-hover:text-primary transition-colors truncate pr-2">{inst.name}</h4>
                          <span className={`${inst.status === 'open' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'} px-2 py-1 rounded text-[10px] md:text-xs font-black uppercase shrink-0`}>
                            {inst.status === 'open' ? 'Open' : 'Closed'}
                          </span>
                        </div>
                        <p className="text-xs md:text-sm text-on-surface-variant line-clamp-1">{inst.category}</p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-0 text-red-700">
                             <span className="material-symbols-outlined text-[14px] scale-[0.7] origin-center inline-block -mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                             <span className="font-black text-xs md:text-sm">{inst.rating}</span>
                             <span className="text-slate-400 text-[10px] md:text-xs font-medium ml-0.5">({inst.reviews.toLocaleString()})</span>
                          </div>
                          <span className="text-xs md:text-sm text-outline font-medium">📍 {inst.distance}</span>
                        </div>
                        <span className="material-symbols-outlined text-primary text-lg md:text-xl group-hover:translate-x-1 transition-transform">chevron_right</span>
                      </div>
                    </div>
                  </div>
                ))
               )}
             </div>

             <button className="w-full py-3 md:py-5 bg-primary text-white text-sm md:text-base font-bold rounded-lg hover:bg-primary-container active:scale-95 transition-all shadow-md shadow-primary/20 border-none">
                기관 더보기
             </button>
          </section>
        </div>
      </main>

      {/* Unified Footer */}
      <footer className="w-full border-t border-slate-200/50 bg-slate-50 py-6 md:py-10 px-6 mt-12 mb-20 md:mb-0">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-start gap-4 md:gap-8 max-w-[1280px]">
          <div className="space-y-4 max-w-sm">
            <div className="flex items-center gap-2 text-primary font-headline">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>home_health</span>
              <span className="font-bold text-xl">방문닥터</span>
            </div>
            <p className="text-sm text-slate-500 font-body leading-relaxed">
              임상적 전문성과 따뜻한 돌봄으로 새로운 의료 경험을 제공합니다. 집에서 편안하게 최고의 의료 서비스를 만나보세요.
            </p>
            <div className="space-y-1 text-[10px] text-slate-500 font-bold opacity-80">
              <p>블루프라임 | 대표 : 김덕규 | 사업자등록번호 : 153-87-03544</p>
              <p>문의 : goodduck2@naver.com</p>
              <p className="pt-1 text-[9px] text-slate-400">© 2026 Bangmun Doctor. All rights reserved.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 md:mt-0">
            <div className="flex items-center gap-3">
              <h4 className="font-black text-slate-900 uppercase tracking-widest text-[9px]">Support</h4>
              <a className="text-xs text-slate-500 hover:text-primary transition-all" href="#">자주묻는 질문</a>
            </div>
            <div className="hidden md:block w-px h-3 bg-slate-200"></div>
            <div className="flex items-center gap-3">
              <h4 className="font-black text-slate-900 uppercase tracking-widest text-[9px]">Policy</h4>
              <a className="text-xs text-slate-500 hover:text-primary transition-all" href="#">이용약관</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden">
        <BottomNav active="home" />
      </div>
    </div>
  );
};

export default Home;
