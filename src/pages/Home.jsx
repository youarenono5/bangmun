import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BottomNav from '../components/BottomNav';

const MOCK_INSTITUTIONS = {
  doctor: [
    { id: 1, name: '바른마음 내과의원', category: '내과, 가정의학과, 검진센터', symptoms: '감기, 기침, 복통, 소화불량, 고혈압, 당뇨', rating: 4.9, reviews: 128, distance: '1.2km', image: 'https://images.unsplash.com/photo-1519494140261-d586d6a6711d?auto=format&fit=crop&q=80&w=400', status: 'open', region: '서울' },
    { id: 2, name: '아이꿈 소아청소년과', category: '소아과, 이비인후과, 예방접종', symptoms: '열남, 기침, 비염, 영유아검진, 예방접종, 중이염', rating: 5.0, reviews: 89, distance: '2.5km', image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=400', status: 'open', region: '경기' },
    { id: 3, name: '더맑은 피부과의원', category: '피부과, 레이저클리닉', symptoms: '아토피, 피부염, 여드름, 점, 기미, 알러지', rating: 4.7, reviews: 215, distance: '1.9km', image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&q=80&w=400', status: 'closed', region: '서울' },
    { id: 6, name: '서울 아산 힐링 내과', category: '내과, 가정의학과', symptoms: '검진, 위시경, 대장내시경, 가슴통증', rating: 4.9, reviews: 1240, distance: '800m', image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400', status: 'open', region: '서울' },
  ],
  rehab: [
    { id: 4, name: '서울 연세 재활의학센터', category: '재활의학과, 도수치료, 통증의학', symptoms: '허리디스크, 목디스크, 관절염, 오십견, 거북목', rating: 4.8, reviews: 342, distance: '0.8km', image: 'https://images.unsplash.com/photo-1576091160550-217359f41f48?auto=format&fit=crop&q=80&w=400', status: 'open', region: '서울' },
    { id: 5, name: '튼튼 마디 재활원', category: '노인재활, 거동불편 케어', symptoms: '중풍, 뇌졸중 후유증, 보행훈련, 근력강화', rating: 4.6, reviews: 56, distance: '3.1km', image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=400', status: 'open', region: '경기' },
    { id: 7, name: '연세 바른 재활의학과', category: '재활의학과, 정형외과, 도수치료', symptoms: '어깨통증, 골반교정, 체형교정, 스포츠부상', rating: 4.8, reviews: 856, distance: '1.2km', image: 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?auto=format&fit=crop&q=80&w=400', status: 'open', region: '서울' },
    { id: 8, name: '다움 방문재활센터', category: '방문재활, 인지재활, 운동치료', symptoms: '치매예방, 거동불편 케어, 일상동작 훈련, 연하장애', rating: 4.9, reviews: 112, distance: '2.4km', image: 'https://images.unsplash.com/photo-1576091160550-217359f41f48?auto=format&fit=crop&q=80&w=400', status: 'open', region: '부산' },
  ]
};

const DEPARTMENTS = [
  { name: '전체', icon: 'grid_view' },
  { name: '내과', icon: 'stethoscope' },
  { name: '재활의학', icon: 'accessibility_new' },
  { name: '가정의학', icon: 'family_restroom' },
  { name: '정형외과', icon: 'orthopedics' },
  { name: '소아청소년', icon: 'child_care' },
  { name: '이비인후', icon: 'hearing' },
  { name: '피부과', icon: 'face_6' },
  { name: '정신의학', icon: 'psychiatry' },
  { name: '산부인과', icon: 'female' },
  { name: '한방과', icon: 'spa' },
  { name: '신경과', icon: 'neurology' },
  { name: '신경외과', icon: 'psychology' },
  { name: '안과', icon: 'visibility' },
];

const REGIONS = [
  '서울', '경기', '부산', '강원', '경남', '경북', '광주', '대구', '대전', '울산', '인천', '전북', '제주', '충남', '충북'
];

const Home = () => {
  const [activeTab, setActiveTab] = useState('doctor'); // 'doctor' or 'rehab'
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('전체');
  const [activeRegion, setActiveRegion] = useState('서울');
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const filteredInstitutions = useMemo(() => {
    let list = MOCK_INSTITUTIONS[activeTab];

    if (activeTab === 'doctor' && activeFilter !== '전체') {
      list = list.filter(inst => inst.category.includes(activeFilter));
    }

    if (activeTab === 'rehab' && activeRegion !== '전체') {
      list = list.filter(inst => inst.region === activeRegion);
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
  }, [activeTab, searchTerm, activeFilter, activeRegion]);

  const handleInstitutionClick = (inst) => {
    if (!user) {
      alert('로그인 회원만 이용 가능합니다. 로그인 페이지로 이동합니다.');
      navigate('/login');
      return;
    }
    navigate(`/request/${inst.id}`, { state: { institution: inst, type: activeTab } });
  };

  return (
    <div className="bg-surface min-h-screen">
      {/* Desktop Header */}
      <nav className="hidden md:flex fixed top-0 w-full z-50 glass-nav shadow-[0_4px_20px_rgba(0,0,0,0.04)] h-20 justify-center items-center px-6 max-w-full">
        <div className="flex justify-between items-center w-full max-w-[1280px]">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-primary cursor-pointer" onClick={() => navigate('/')}>
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>home_health</span>
              <span className="text-2xl font-black tracking-tight">방문닥터</span>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              {user ? (
                <span className="text-sm font-bold text-on-surface-variant">{user.email.split('@')[0]}님</span>
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
              {user && (
                <button className="p-2 text-slate-600 hover:text-error transition-colors" onClick={signOut}>
                   <span className="material-symbols-outlined">logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 w-full z-50 bg-slate-50/80 backdrop-blur-md shadow-sm border-b border-slate-100">
        <div className="flex items-center justify-between px-6 py-4 w-full max-w-md mx-auto">
          <h1 className="text-primary font-headline font-extrabold tracking-tight text-lg">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>home_health</span>
              <span>방문닥터</span>
            </div>
          </h1>
          <div className="flex items-center gap-2">
            {!user ? (
              <>
                <Link to="/login" className="text-[11px] font-bold text-primary px-3 py-1.5 rounded-lg border border-primary/10 bg-white shadow-sm">로그인</Link>
                <Link to="/signup" className="text-[11px] font-bold bg-primary text-white px-3 py-1.5 rounded-lg shadow-sm shadow-primary/20">회원가입</Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary cursor-pointer hover:bg-slate-100 p-1 rounded-full overflow-hidden" onClick={signOut}>logout</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="pt-20 md:pt-20">
        {/* Desktop Hero Section */}
        <section className="hidden md:flex relative h-[360px] w-full items-center overflow-hidden bg-gradient-to-br from-primary to-[#004BB3]">
          <div className="absolute inset-0 opacity-10">
            <img src="https://images.unsplash.com/photo-1505751172107-1bc329bc03d6?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover" alt="" />
          </div>
          <div className="container mx-auto px-6 relative z-10 max-w-[1280px]">
            <div className="max-w-2xl space-y-4">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white font-bold text-xs tracking-wider uppercase">Clinical Sanctuary</span>
              <h1 className="text-5xl font-extrabold text-white leading-tight">
                방문진료, 방문재활 1위<br/>방문닥터와 함께하세요
              </h1>
              <p className="text-blue-100 text-lg font-body">어디서든 전문 의료진을 만나는 새로운 방법, 방문닥터가 찾아갑니다.</p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 md:px-6 py-6 md:py-12 flex flex-col gap-6 md:gap-10 max-w-[1280px]">
          
          {/* Mobile Banner (Hero Section) */}
          <div className="md:hidden">
            <section className="relative w-full h-32 rounded-2xl overflow-hidden bg-gradient-to-r from-[#004BB3] to-primary flex items-center px-6 shadow-md">
              <div className="space-y-1">
                <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm uppercase">Hot Issue</span>
                <h2 className="text-white font-headline font-bold text-lg leading-tight">방문진료, 방문재활 1위<br/>방문닥터와 함께하세요</h2>
              </div>
              <span className="material-symbols-outlined text-6xl ml-auto opacity-30 text-white" style={{ fontVariationSettings: "'wght' 200" }}>medical_services</span>
            </section>
          </div>

          {/* Service & Department Integrated Selector (Unified PC/Mobile Design) */}
          <section className="md:-mt-24 relative z-20">
            <div className="bg-white p-4 md:p-10 rounded-3xl shadow-xl shadow-primary/5 border border-primary/5 space-y-8 md:space-y-12">
              
              {/* Service Tabs */}
              <div className="flex flex-row gap-3 md:gap-8 max-w-full">
                <button 
                  onClick={() => { setActiveTab('doctor'); setSearchTerm(''); }}
                  className={`flex-1 p-3 md:p-6 rounded-2xl shadow-md md:shadow-lg border-2 transition-all flex flex-col md:flex-row items-center justify-center md:justify-between group h-24 ${activeTab === 'doctor' ? 'bg-white border-primary scale-[1.02]' : 'bg-surface-container-low border-transparent grayscale opacity-80'}`}
                >
                  <div className="text-center md:text-left">
                    <h3 className={`text-base md:text-xl font-bold mb-0.5 md:mb-1 ${activeTab === 'doctor' ? 'text-primary' : 'text-on-surface-variant'}`}>방문진료</h3>
                    <p className="hidden md:block text-on-surface-variant text-xs md:text-sm">거동이 불편하신 분들을 위한 전문 진료</p>
                  </div>
                  <span className={`material-symbols-outlined text-3xl md:text-4xl transition-all ${activeTab === 'doctor' ? 'text-primary' : 'text-outline-variant'}`}>home_health</span>
                </button>
                <button 
                  onClick={() => { setActiveTab('rehab'); setSearchTerm(''); }}
                  className={`flex-1 p-3 md:p-6 rounded-2xl shadow-md md:shadow-lg border-2 transition-all flex flex-col md:flex-row items-center justify-center md:justify-between group h-24 ${activeTab === 'rehab' ? 'bg-white border-primary scale-[1.02]' : 'bg-surface-container-low border-transparent grayscale opacity-80'}`}
                >
                  <div className="text-center md:text-left">
                    <h3 className={`text-base md:text-xl font-bold mb-0.5 md:mb-1 ${activeTab === 'rehab' ? 'text-primary' : 'text-on-surface-variant'}`}>방문재활</h3>
                    <p className="hidden md:block text-on-surface-variant text-xs md:text-sm">일상 복귀를 돕는 체계적인 1:1 재활</p>
                  </div>
                  <span className={`material-symbols-outlined text-3xl md:text-4xl transition-all ${activeTab === 'rehab' ? 'text-primary' : 'text-outline-variant'}`}>physical_therapy</span>
                </button>
              </div>

              {/* Conditional Filter Section (Department for Doctor, Region for Rehab) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary rounded-full md:hidden"></div>
                  <h2 className="text-lg md:text-2xl font-black text-on-surface">
                    {activeTab === 'doctor' ? '진료과목별 찾기' : '지역으로 찾기'}
                  </h2>
                </div>
                
                {activeTab === 'doctor' ? (
                  <>
                    <div className="grid grid-cols-5 md:grid-cols-7 gap-1.5 md:gap-3">
                      {DEPARTMENTS.map((dept) => (
                        <button
                          key={dept.name}
                          onClick={() => setActiveFilter(dept.name)}
                          className={`flex flex-col items-center justify-center p-2 md:p-3 rounded-xl border transition-all group ${activeFilter === dept.name ? 'bg-primary border-primary text-white shadow-md scale-105 z-10' : 'bg-white border-outline-variant/10 text-on-surface-variant hover:border-primary/30'}`}
                        >
                          <span className={`material-symbols-outlined text-[18px] md:text-[24px] ${activeFilter === dept.name ? 'text-white' : 'text-primary group-hover:scale-110 transition-transform'}`}>{dept.icon}</span>
                          <span className="text-[10px] md:text-xs font-bold mt-1.5 truncate w-full text-center leading-tight">{dept.name}</span>
                        </button>
                      ))}
                    </div>
                    
                    {/* Integrated Search Bar inside Visiting Doctor Tab */}
                    <div className="mt-6 flex items-center bg-surface-container-lowest border-2 border-primary/10 px-5 py-4 rounded-2xl shadow-sm gap-4 focus-within:ring-4 ring-primary/5 transition-all group focus-within:border-primary/30">
                      <span className="material-symbols-outlined text-primary font-black group-focus-within:scale-110 transition-transform">search</span>
                      <input 
                        className="bg-transparent border-none focus:ring-0 text-base w-full font-bold text-on-surface placeholder:text-on-surface-variant/40" 
                        placeholder="병원이름, 진료과목, 증상을 입력하세요" 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </>
                ) : (
                  <div className="relative group max-w-md">
                    <select 
                      value={activeRegion}
                      onChange={(e) => setActiveRegion(e.target.value)}
                      className="w-full bg-surface-container-low border-2 border-primary/10 rounded-2xl px-5 py-4 text-base font-bold text-on-surface appearance-none focus:ring-4 ring-primary/5 focus:border-primary transition-all cursor-pointer"
                    >
                      <option value="전체">전국 전체</option>
                      {REGIONS.map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-primary pointer-events-none group-hover:translate-y-[-40%] transition-transform">expand_more</span>
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
                    className="flex bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all group cursor-pointer border border-outline-variant/10 hover:border-primary/20 h-24 md:h-32"
                  >
                    <div className="w-24 md:w-40 overflow-hidden shrink-0">
                      <img src={inst.image} alt={inst.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 p-2.5 md:p-4 flex flex-col justify-between">
                      <div className="space-y-0.5 md:space-y-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-sm md:text-lg text-on-surface group-hover:text-primary transition-colors truncate pr-2">{inst.name}</h4>
                          <span className={`${inst.status === 'open' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'} px-1.5 py-0.5 rounded text-[8px] md:text-[10px] font-black uppercase shrink-0`}>
                            {inst.status === 'open' ? 'Open' : 'Closed'}
                          </span>
                        </div>
                        <p className="text-[10px] md:text-xs text-on-surface-variant line-clamp-1">{inst.category}</p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-orange-500">
                             <span className="material-symbols-outlined text-[14px] md:text-base" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                             <span className="font-black text-[10px] md:text-xs">{inst.rating}</span>
                          </div>
                          <span className="text-[10px] md:text-xs text-outline font-medium">{inst.distance}</span>
                        </div>
                        <span className="material-symbols-outlined text-primary text-lg md:text-xl group-hover:translate-x-1 transition-transform">chevron_right</span>
                      </div>
                    </div>
                  </div>
                ))
               )}
             </div>

             <button className="w-full py-3 md:py-5 bg-primary text-white font-black rounded-2xl hover:bg-primary-container active:scale-95 transition-all shadow-md shadow-primary/20 border-none">
                기관 더보기
             </button>
          </section>
        </div>
      </main>

      {/* Unified Footer */}
      <footer className="w-full border-t border-slate-200/50 bg-slate-50 py-16 px-6 md:px-6 mt-12 mb-20 md:mb-0">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-start gap-12 max-w-[1280px]">
          <div className="space-y-6 max-w-sm">
            <div className="flex items-center gap-2 text-primary font-headline">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>home_health</span>
              <span className="font-bold text-xl">방문닥터</span>
            </div>
            <p className="text-sm text-slate-500 font-body leading-relaxed">
              임상적 전문성과 따뜻한 돌봄으로 새로운 의료 경험을 제공합니다. 집에서 편안하게 최고의 의료 서비스를 만나보세요.
            </p>
            <div className="space-y-1 text-xs text-slate-500 font-bold opacity-80">
              <p>블루프라임</p>
              <p>대표 : 김덕규</p>
              <p>사업자등록번호 : 153-87-03544</p>
              <p>연락처 : goodduck2@naver.com</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-10 md:gap-16">
            <div className="space-y-4">
              <h4 className="font-black text-slate-900 uppercase tracking-widest text-[10px]">Services</h4>
              <nav className="flex flex-col gap-3">
                <a className="text-sm text-slate-500 hover:text-primary transition-all" href="#">방문진료</a>
                <a className="text-sm text-slate-500 hover:text-primary transition-all" href="#">방문재활</a>
              </nav>
            </div>
            <div className="space-y-4">
              <h4 className="font-black text-slate-900 uppercase tracking-widest text-[10px]">Support</h4>
              <nav className="flex flex-col gap-3">
                <a className="text-sm text-slate-500 hover:text-primary transition-all" href="#">자주묻는 질문</a>
              </nav>
            </div>
            <div className="space-y-4 col-span-2 md:col-span-1">
              <h4 className="font-black text-slate-900 uppercase tracking-widest text-[10px]">Policy</h4>
              <nav className="flex flex-col gap-3">
                <a className="text-sm text-slate-500 hover:text-primary transition-all" href="#">이용약관</a>
              </nav>
            </div>
          </div>
        </div>
        <div className="container mx-auto mt-16 pt-8 border-t border-slate-200/30 max-w-[1280px]">
          <p className="text-xs font-bold text-slate-400">© 2026 Bangmun Doctor. All rights reserved.</p>
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
