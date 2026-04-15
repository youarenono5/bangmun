import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

// 전문의 전문과목 리스트 (대한민국 공식 26개 과목)
const SPECIALIST_DEPTS = [
  '내과', '외과', '소아청소년과', '산부인과', '정신건강의학과', '신경과', '피부과', '비뇨의학과', '안과', '이비인후과', 
  '정형외과', '신경외과', '심장혈관흉부외과', '성형외과', '마취통증의학과', '영상의학과', '방사선종양학과', '병리과', 
  '진단검사의학과', '재활의학과', '가정의학과', '예방의학과', '응급의학과', '핵의학과', '직업환경의학과', '결핵과'
];

const Signup = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(''); // 'patient' or 'medical'

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Medical only states
  const [licenseNo, setLicenseNo] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [specialistDept, setSpecialistDept] = useState('');
  const [specialistNo, setSpecialistNo] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(null);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (passwordConfirm.length > 0) {
      setPasswordMatch(password === passwordConfirm);
    } else {
      setPasswordMatch(null);
    }
  }, [password, passwordConfirm]);

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (password.length < 8) {
      setError('비밀번호는 8자리 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: authData, error: authError } = await signUp({
        email,
        password,
        options: {
          data: { full_name: name, role: role }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        const profileData = {
          id: authData.user.id,
          role,
          full_name: name,
          phone,
          address,
          email,
          ...(role === 'medical' && {
            license_no: licenseNo,
            specialty: specialty,
            specialist_dept: specialistDept || null,
            specialist_no: specialistNo || null
          })
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .insert([profileData]);

        if (profileError) throw profileError;

        alert('회원가입이 완료되었습니다!');
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || '회원가입 과정에서 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 py-12 relative font-sans">
        {/* Top Navigation */}
        <div className="absolute top-8 left-8">
          <button 
            onClick={() => navigate(-1)} 
            className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl text-slate-400 hover:text-slate-900 shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
        </div>

        <div className="w-full max-w-lg space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-xl shadow-blue-900/5 mb-2">
              <span className="material-symbols-outlined text-[#0047AB] text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>home_health</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">반갑습니다!</h1>
            <p className="text-slate-500 font-medium text-sm leading-relaxed">방문닥터 서비스 이용을 위한 가입 유형을 선택해 주세요.</p>
          </div>

          <div className="grid gap-6">
            <button 
              onClick={() => handleRoleSelect('patient')}
              className="relative overflow-hidden group p-5 bg-white border border-slate-200 rounded-3xl hover:ring-4 ring-[#0047AB]/10 transition-all text-left shadow-sm hover:shadow-2xl hover:shadow-blue-900/5"
            >
              <div className="relative z-10 flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-[#0047AB] transition-colors">일반 회원가입</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">거동이 불편한 가족을 위해<br/>방문 진료/재활을 신청합니다.</p>
                </div>
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                  <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-[#0047AB] transition-all group-hover:scale-110">person</span>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#0047AB]/5 to-transparent rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>

            <button 
              onClick={() => handleRoleSelect('medical')}
              className="relative overflow-hidden group p-5 bg-white border border-slate-200 rounded-3xl hover:ring-4 ring-[#0047AB]/10 transition-all text-left shadow-sm hover:shadow-2xl hover:shadow-blue-900/5"
            >
              <div className="relative z-10 flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-[#0047AB] transition-colors">의료진 / 병원 가입</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">따뜻한 마음을 가진 의료진으로서<br/>찾아가는 진료 서비스를 제공합니다.</p>
                </div>
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                  <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-[#0047AB] transition-all group-hover:scale-110">medical_services</span>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#0047AB]/5 to-transparent rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </div>

          <p className="text-center text-slate-400 text-sm font-bold">
            이미 계정이 있으신가요? <Link to="/login" className="text-[#0047AB] hover:underline decoration-2 underline-offset-4 ml-1">로그인 하기</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-6">
      <div className="w-full max-w-lg mx-auto space-y-10">
        <div className="flex items-center justify-between">
          <button onClick={() => setStep(1)} className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0047AB] bg-blue-50 px-3 py-1 rounded-full mb-2 inline-block">SignUp</span>
            <h1 className="text-2xl font-black text-slate-900">
              {role === 'patient' ? '일반 회원가입' : '의료진 / 병원 가입'}
            </h1>
          </div>
          <div className="w-10"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            {/* Common Section */}
            <div className="space-y-4">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest pl-1">기본 정보</h2>
              
              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 ml-1">이메일 계정 <span className="text-red-500">*</span></label>
                  <input 
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 ring-blue-500/5 focus:bg-white focus:border-[#0047AB] transition-all font-bold text-slate-900"
                    placeholder="example@email.com"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 ml-1">비밀번호 <span className="text-red-500">*</span></label>
                    <input 
                      type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 ring-blue-500/5 focus:bg-white focus:border-[#0047AB] transition-all font-bold text-slate-900"
                      placeholder="8자리 이상"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 ml-1">비밀번호 확인 <span className="text-red-500">*</span></label>
                    <input 
                      type="password" required value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)}
                      className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 ring-blue-500/5 focus:bg-white focus:border-[#0047AB] transition-all font-bold text-slate-900"
                      placeholder="한 번 더 입력"
                    />
                  </div>
                </div>
                {passwordMatch !== null && (
                  <p className={`text-[11px] font-bold ml-1 ${passwordMatch ? 'text-green-600' : 'text-red-500'}`}>
                    <span className="material-symbols-outlined text-[14px] align-middle mr-1">{passwordMatch ? 'check_circle' : 'cancel'}</span>
                    {passwordMatch ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'}
                  </p>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 ml-1">이름 <span className="text-red-500">*</span></label>
                    <input 
                      type="text" required value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 ring-blue-500/5 focus:bg-white focus:border-[#0047AB] transition-all font-bold text-slate-900"
                      placeholder="성함 입력"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 ml-1">연락처 <span className="text-red-500">*</span></label>
                    <input 
                      type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 ring-blue-500/5 focus:bg-white focus:border-[#0047AB] transition-all font-bold text-slate-900"
                      placeholder="010-0000-0000"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 ml-1">거주지 주소 (방문용) <span className="text-red-500">*</span></label>
                  <input 
                    type="text" required value={address} onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 ring-blue-500/5 focus:bg-white focus:border-[#0047AB] transition-all font-bold text-slate-900"
                    placeholder="상세 주소를 입력하세요"
                  />
                </div>
              </div>
            </div>

            {/* Medical Section */}
            {role === 'medical' && (
              <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-top-2 duration-500">
                <h2 className="text-sm font-black text-[#0047AB] uppercase tracking-widest pl-1">의료 전문 정보</h2>
                
                <div className="grid gap-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 ml-1">면허 번호 <span className="text-red-500">*</span></label>
                      <input 
                        type="text" required value={licenseNo} onChange={(e) => setLicenseNo(e.target.value)}
                        className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 ring-blue-500/5 focus:bg-white focus:border-[#0047AB] transition-all font-bold text-slate-900"
                        placeholder="면허 번호"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 ml-1">전문 분야 <span className="text-red-500">*</span></label>
                      <input 
                        type="text" required value={specialty} onChange={(e) => setSpecialty(e.target.value)}
                        className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 ring-blue-500/5 focus:bg-white focus:border-[#0047AB] transition-all font-bold text-slate-900"
                        placeholder="예: 재활, 내과 등"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 ml-1">전문의 진료과</label>
                      <div className="relative">
                        <select 
                          value={specialistDept} onChange={(e) => setSpecialistDept(e.target.value)}
                          className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 ring-blue-500/5 focus:bg-white focus:border-[#0047AB] transition-all font-bold text-slate-900 appearance-none cursor-pointer"
                        >
                          <option value="">과목 선택 (선택 사항)</option>
                          {SPECIALIST_DEPTS.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 ml-1">전문의 번호</label>
                      <input 
                        type="text" value={specialistNo} onChange={(e) => setSpecialistNo(e.target.value)}
                        className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 ring-blue-500/5 focus:bg-white focus:border-[#0047AB] transition-all font-bold text-slate-900"
                        placeholder="전문의 번호 (선택)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-5 bg-red-50 border border-red-100 rounded-3xl flex items-start gap-3">
              <span className="material-symbols-outlined text-red-500">error</span>
              <p className="text-xs font-bold text-red-600 leading-relaxed">{error}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-[#0047AB] text-white font-black text-sm rounded-xl active:scale-[0.98] transition-all shadow-lg shadow-blue-900/15 mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>처리 중...</span>
              </>
            ) : (
              <span>가입 완료</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
