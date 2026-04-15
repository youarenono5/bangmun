import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await signIn({ email, password });
    if (error) {
      setError('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-surface">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>home_health</span>
            <h1 className="text-3xl font-headline font-extrabold text-primary">방문닥터</h1>
          </div>
          <p className="text-on-surface-variant font-medium text-sm">우리 동네 방문 진료의 시작</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-primary ml-1 uppercase tracking-wider">Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
              placeholder="이메일을 입력하세요"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-primary ml-1 uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          {error && <p className="text-error text-xs font-semibold text-center">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-primary text-white font-bold rounded-xl active:scale-95 transition-all shadow-lg shadow-primary/25 disabled:opacity-50"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="text-center space-y-4">
          <Link to="/signup" className="text-sm font-bold text-primary hover:underline">회원가입 하기</Link>
          <div className="pt-4 border-t border-outline-variant/10">
            <Link to="/admin" className="text-xs text-on-surface-variant hover:text-primary transition-colors">의료기관 전용 (데모)</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
