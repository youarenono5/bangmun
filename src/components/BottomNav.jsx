import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const BottomNav = ({ active }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNavClick = (path) => {
    if (!user && (path === '/history' || path === '/mypage')) {
      alert('로그인 회원만 이용 가능합니다.');
      navigate('/login');
      return;
    }
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl z-50 rounded-t-2xl border-t border-slate-100 flex justify-around items-center px-4 py-3 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] max-w-md mx-auto">
      <div 
        onClick={() => handleNavClick('/')}
        className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all cursor-pointer ${active === 'home' ? 'text-primary bg-blue-50' : 'text-slate-400'}`}
      >
        <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: active === 'home' ? "'FILL' 1" : "''" }}>home</span>
        <span className="text-[10px] font-bold">홈</span>
      </div>
      <div 
        onClick={() => handleNavClick('/history')}
        className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all cursor-pointer ${active === 'history' ? 'text-primary bg-blue-50' : 'text-slate-400'}`}
      >
        <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: active === 'history' ? "'FILL' 1" : "''" }}>history</span>
        <span className="text-[10px] font-bold">진료내역</span>
      </div>
      <div 
        onClick={() => handleNavClick('/mypage')}
        className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all cursor-pointer ${active === 'profile' ? 'text-primary bg-blue-50' : 'text-slate-400'}`}
      >
        <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: active === 'profile' ? "'FILL' 1" : "''" }}>person</span>
        <span className="text-[10px] font-bold">내 정보</span>
      </div>
    </nav>
  );
};

export default BottomNav;
