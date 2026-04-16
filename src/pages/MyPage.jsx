import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const MyPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [doctorRegs, setDoctorRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); // doctor: dashboard, profile, visit_reg, rehab_reg
  const [selectedRequest, setSelectedRequest] = useState(null);
  const fileInputRef = useRef(null);

  // Profile Form States
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchInitialData();
  }, [user]);

  const fetchInitialData = async () => {
    setLoading(true);
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileData) {
      setProfile(profileData);
      setFullName(profileData.full_name || '');
      setPhone(profileData.phone || '');
      setAddress(profileData.address || '');
      
      const userRole = profileData.role === 'medical' ? 'doctor' : 'user';
      setRole(userRole);
      if (userRole === 'user' && activeTab === 'dashboard') setActiveTab('profile');
    }

    if (profileData?.role === 'medical') {
      const { data: reqs } = await supabase
        .from('applications')
        .select('*')
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false });
      setRequests(reqs || []);

      const { data: regs } = await supabase
        .from('doctor_registrations')
        .select('*')
        .eq('user_id', user.id);
      setDoctorRegs(regs || []);
    } else {
      const { data: reqs } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setRequests(reqs || []);
    }
    setLoading(false);
  };

  const handleUpdateProfileData = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone: phone,
        address: address
      })
      .eq('id', user.id);
    
    if (error) {
      alert('저장 실패: ' + error.message);
    } else {
      setProfile({ ...profile, full_name: fullName, phone, address });
      alert('회원 정보가 성공적으로 수정되었습니다.');
    }
    setIsUpdatingProfile(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    if (newPassword.length < 6) {
      alert('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    setIsUpdatingPassword(true);
    
    // 1. Verify Current Password by re-signing in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      alert('현재 비밀번호가 올바르지 않습니다.');
      setIsUpdatingPassword(false);
      return;
    }

    // 2. Update to New Password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      alert('비밀번호 변경 실패: ' + updateError.message);
    } else {
      alert('비밀번호가 성공적으로 변경되었습니다. 보안을 위해 다시 로그인해주세요.');
      signOut().then(() => navigate('/login'));
    }
    setIsUpdatingPassword(false);
  };

  const handleUpdateStatus = async (id, status) => {
    const { error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', id);
    if (!error) {
      setRequests(requests.map(r => r.id === id ? { ...r, status } : r));
      setSelectedRequest(prev => prev ? { ...prev, status } : null);
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 800;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.7);
        };
      };
    });
  };

  const handleUploadPhoto = async (file, type) => {
    const compressedBlob = await compressImage(file);
    const fileName = `${user.id}_${type}_${Date.now()}.jpg`;
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, compressedBlob);
    if (error) {
      alert('이미지 업로드 실패: ' + error.message);
      return null;
    }
    const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
    return publicUrl;
  };

  // --- Views ---
  const ProfileSettingsView = () => (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl">
      {/* Basic Info Section */}
      <section className="bg-white p-5 md:p-10 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-base md:text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-2xl md:text-3xl">manage_accounts</span>
          회원 정보 설정
        </h2>
        <form onSubmit={handleUpdateProfileData} className="space-y-6">
          <div className="space-y-1.5 opacity-60">
            <label className="text-[9px] md:text-[11px] font-bold text-slate-400 ml-3 uppercase tracking-wider">이메일 아이디 (변경 불가)</label>
            <input type="text" value={user?.email} readOnly className="w-full px-4 py-3 bg-slate-100 border-2 border-transparent rounded-lg text-sm md:text-base font-medium cursor-not-allowed" />
          </div>
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-1.5">
              <label className="text-[9px] md:text-[11px] font-bold text-primary ml-3 uppercase tracking-wider">성함</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-lg focus:bg-white focus:border-primary/20 transition-all text-sm md:text-base font-bold" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] md:text-[11px] font-bold text-primary ml-3 uppercase tracking-wider">연락처</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-lg focus:bg-white focus:border-primary/20 transition-all text-sm md:text-base font-bold" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] md:text-[11px] font-bold text-primary ml-3 uppercase tracking-wider">방문 거주지 주소</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-lg focus:bg-white focus:border-primary/20 transition-all text-sm md:text-base font-medium" />
          </div>
          <div className="pt-2">
             <button disabled={isUpdatingProfile} type="submit" className="w-full md:w-auto px-8 py-3.5 bg-primary text-white font-black rounded-lg shadow-xl shadow-primary/10 hover:bg-blue-800 transition-all text-sm md:text-base">
               {isUpdatingProfile ? '저장 중...' : '회원 정보 저장하기'}
             </button>
          </div>
        </form>
      </section>

      {/* Password Change Section */}
      <section className="bg-white p-5 md:p-10 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-base md:text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-red-500 text-2xl md:text-3xl">security</span>
          비밀번호 보안 설정
        </h2>
        <form onSubmit={handlePasswordChange} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[9px] md:text-[11px] font-bold text-slate-400 ml-3 uppercase tracking-wider">현재 비밀번호</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required placeholder="본인 확인을 위해 입력해주세요" className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-lg focus:bg-white focus:border-primary/20 transition-all text-sm md:text-base font-medium" />
          </div>
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-1.5">
              <label className="text-[9px] md:text-[11px] font-bold text-slate-400 ml-3 uppercase tracking-wider">새 비밀번호</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="6자 이상 입력" className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-lg focus:bg-white focus:border-primary/20 transition-all text-sm md:text-base font-medium" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] md:text-[11px] font-bold text-slate-400 ml-3 uppercase tracking-wider">새 비밀번호 확인</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="다시 한번 입력" className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-lg focus:bg-white focus:border-primary/20 transition-all text-sm md:text-base font-medium" />
            </div>
          </div>
          <div className="pt-2">
             <button disabled={isUpdatingPassword} type="submit" className="w-full md:w-auto px-8 py-3.5 bg-slate-900 text-white font-black rounded-lg shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all text-sm md:text-base">
               {isUpdatingPassword ? '변경 중...' : '비밀번호 변경하기'}
             </button>
             <p className="text-[9px] md:text-[11px] text-slate-400 mt-4 font-bold">※ 비밀번호 변경 시 자동으로 로그아웃되며 다시 로그인해야 합니다.</p>
          </div>
        </form>
      </section>
    </div>
  );

  const RequestHistoryView = () => (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
      <h2 className="text-base md:text-xl font-black text-slate-900 ml-2">전체 신청 내역</h2>
      {requests.length === 0 ? (
        <div className="bg-white p-12 md:p-20 rounded-xl border border-slate-100 text-center space-y-4">
          <span className="material-symbols-outlined text-4xl md:text-6xl text-slate-100">history</span>
          <p className="text-sm md:text-base text-slate-400 font-medium">아직 접수된 신청 내역이 없습니다.</p>
        </div>
      ) : (
        <div className="grid gap-3 md:gap-4 md:grid-cols-1 lg:grid-cols-2">
          {requests.map(req => (
            <div key={req.id} className="bg-white p-4 md:p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all group">
              <div className="flex items-center gap-4 md:gap-5">
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center ${req.type === 'doctor' ? 'bg-blue-50 text-primary' : 'bg-orange-50 text-orange-600'}`}>
                  <span className="material-symbols-outlined text-xl md:text-2xl">{req.type === 'doctor' ? 'medical_services' : 'exercise'}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5 md:mb-1">
                    <span className={`text-[8px] md:text-[10px] font-black px-1.5 py-0.5 rounded ${req.type === 'doctor' ? 'bg-blue-50 text-primary' : 'bg-orange-50 text-orange-600'}`}>
                      {req.type === 'doctor' ? 'VISIT MEDICAL' : 'VISIT REHAB'}
                    </span>
                    <span className="text-[9px] md:text-[11px] font-bold text-slate-300">{new Date(req.created_at).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-black text-slate-900 text-sm md:text-lg">{req.institution_name}</h3>
                </div>
              </div>
              <div className={`text-[10px] md:text-xs font-black px-3 md:px-4 py-1.5 md:py-2 rounded-lg shadow-sm ${
                req.status === 'accepted' ? 'bg-green-500 text-white' : 
                req.status === 'rejected' ? 'bg-red-50 text-red-600' :
                req.status === 'calling' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {req.status === 'pending' ? '접수 대기' : req.status === 'accepted' ? '예약 확정' : req.status === 'rejected' ? '반려됨' : '상담 예정'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const DoctorDashboard = () => (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-primary p-6 md:p-8 rounded-xl text-white shadow-2xl shadow-primary/20 col-span-2 flex justify-between items-center overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-xs md:text-sm font-bold opacity-80 mb-1 md:mb-2">오늘의 신규 신청</p>
            <h3 className="text-3xl md:text-5xl font-black">
              {requests.filter(r => r.status === 'pending').length}
              <span className="text-base md:text-xl font-medium ml-1 md:ml-2">건 대기 중</span>
            </h3>
          </div>
          <span className="material-symbols-outlined text-[80px] md:text-[120px] absolute -right-4 -bottom-4 opacity-10">pending_actions</span>
        </div>
        <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
            <p className="text-xs md:text-sm font-bold text-slate-400 mb-1 md:mb-2 truncate">누적 방문재활</p>
            <h3 className="text-2xl md:text-4xl font-black text-slate-900">{requests.filter(r => r.type === 'rehab').length}<span className="text-base md:text-lg font-medium ml-1">건</span></h3>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-base md:text-xl font-black text-slate-900">실시간 신청 리스트</h3>
          <span className="text-[10px] md:text-xs font-bold text-primary bg-blue-50 px-3 py-1 rounded-full">실시간 업데이트 중</span>
        </div>
        {requests.length === 0 ? (
          <div className="bg-white p-12 md:p-20 rounded-xl border border-slate-100 text-center">
            <p className="text-sm md:text-base text-slate-400 font-medium">관리할 신청 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="grid gap-3 md:gap-4 md:grid-cols-1 overflow-hidden">
            {requests.map(req => (
              <div 
                key={req.id} 
                onClick={() => setSelectedRequest(req)}
                className="bg-white p-4 md:p-6 rounded-xl border border-slate-50 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between hover:ring-2 ring-primary/5 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4 md:gap-5">
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center shadow-inner ${req.type === 'doctor' ? 'bg-blue-50 text-primary' : 'bg-orange-50 text-orange-600'}`}>
                    <span className="material-symbols-outlined text-xl md:text-2xl">{req.type === 'doctor' ? 'medical_services' : 'exercise'}</span>
                  </div>
                  <div>
                    <h4 className="text-sm md:text-lg font-black text-slate-900 group-hover:text-primary transition-colors">{req.full_name || '익명 환자'}</h4>
                    <p className="text-xs md:text-sm text-slate-400 font-medium truncate max-w-[200px] md:max-w-xs">{req.address}</p>
                  </div>
                </div>
                <div className="mt-3 md:mt-0 flex items-center gap-6 w-full md:w-auto">
                  <div className="text-left md:text-right hidden sm:block">
                    <p className="text-[9px] md:text-[11px] font-bold text-slate-300 uppercase leading-none mb-1">Received Time</p>
                    <p className="text-xs md:text-sm font-black text-slate-400">{new Date(req.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                  <div className={`px-4 md:px-5 py-2 md:py-2.5 rounded-lg text-[10px] md:text-xs font-black ml-auto md:ml-0 ${
                    req.status === 'accepted' ? 'bg-green-500 text-white shadow-lg shadow-green-900/10' : 
                    req.status === 'rejected' ? 'bg-red-50 text-red-600' : 
                    req.status === 'calling' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {req.status === 'pending' ? '대기 중' : req.status === 'accepted' ? '확정 완료' : req.status === 'rejected' ? '신청 반려' : '상담 예정'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedRequest(null)}></div>
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative z-20 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 md:p-10 space-y-6 md:space-y-8">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] md:text-[12px] font-black text-primary bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">{selectedRequest.type === 'doctor' ? 'MEDICAL VISIT' : 'REHAB VISIT'}</span>
                  <h3 className="text-xl md:text-3xl font-black text-slate-900">{selectedRequest.full_name || '익명 환자'} <span className="text-sm md:text-lg font-medium text-slate-400 ml-1">님</span></h3>
                </div>
                <button onClick={() => setSelectedRequest(null)} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 hover:bg-slate-100 transition-colors"><span className="material-symbols-outlined text-xl md:text-2xl">close</span></button>
              </div>

              <div className="grid gap-3 md:gap-4">
                <div className="bg-slate-50 p-4 md:p-6 rounded-xl space-y-1 border border-slate-100">
                  <p className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest">방문 요청 주소</p>
                  <p className="text-sm md:text-base font-bold text-slate-800">{selectedRequest.address}</p>
                </div>
                <div className="bg-slate-50 p-4 md:p-6 rounded-xl space-y-2 md:space-y-3 border border-slate-100">
                  <p className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest">주요 증상 및 전달사항</p>
                  <p className="text-sm md:text-base text-slate-600 leading-relaxed font-medium italic">"{selectedRequest.symptoms}"</p>
                </div>
                <div className="bg-blue-50 p-4 md:p-6 rounded-xl flex justify-between items-center border border-blue-100/50">
                   <p className="text-[9px] md:text-[11px] font-bold text-primary uppercase tracking-widest">환자 연락처</p>
                   <p className="text-base md:text-lg font-black text-primary">{selectedRequest.phone || '상담 시 노출'}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 md:gap-3">
                <button onClick={() => handleUpdateStatus(selectedRequest.id, 'calling')} className="flex flex-col items-center justify-center gap-1.5 md:gap-2 py-4 md:py-6 bg-white border border-slate-100 text-slate-600 rounded-lg hover:bg-blue-50 hover:text-primary hover:border-blue-100 transition-all font-bold">
                  <span className="material-symbols-outlined text-lg md:text-2xl">call</span>
                  <span className="text-[10px] md:text-[11px]">상담하기</span>
                </button>
                <button onClick={() => handleUpdateStatus(selectedRequest.id, 'accepted')} className="flex flex-col items-center justify-center gap-1.5 md:gap-2 py-4 md:py-6 bg-primary text-white rounded-lg shadow-xl shadow-primary/20 active:scale-95 transition-all font-bold">
                  <span className="material-symbols-outlined text-lg md:text-2xl">check_circle</span>
                  <span className="text-[10px] md:text-[11px]">예약확정</span>
                </button>
                <button onClick={() => handleUpdateStatus(selectedRequest.id, 'rejected')} className="flex flex-col items-center justify-center gap-1.5 md:gap-2 py-4 md:py-6 bg-white border border-slate-100 text-slate-600 rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all font-bold">
                  <span className="material-symbols-outlined text-lg md:text-2xl">cancel</span>
                  <span className="text-[10px] md:text-[11px]">반려처리</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const DoctorServiceForm = ({ type }) => {
    const defaultData = doctorRegs.find(d => d.type === type) || {
      institution_name: '', address: '', doctor_name: profile?.full_name || '', specialty: '',
      diagnosis_items: [], introduction: '', notice: '', visiting_hours: '', experience: '',
      is_same_day: false, is_reservation: true, photo_url: ''
    };
    const [formData, setFormData] = useState(defaultData);
    const [isSaving, setIsSaving] = useState(false);
    const categories = type === 'doctor' 
      ? ['감기-비염', '소아과', '내과질환', '관절통증', '기력저하', '뇌졸중', '편마비', '하지마비', '알츠하이머', '파킨슨', '고혈압-당뇨 합병증', '루게릭', '근육이영양증', '기타']
      : ['뇌졸중', '편마비', '하지마비', '알츠하이머', '파킨슨', '고혈압-당뇨 합병증', '루게릭', '근육이영양증', '기타'];

    const handleSave = async (e) => {
      e.preventDefault();
      setIsSaving(true);
      const { error } = await supabase.from('doctor_registrations').upsert({ ...formData, user_id: user.id, type }, { onConflict: 'user_id,type' });
      if (!error) { alert('성공적으로 저장되었습니다!'); fetchInitialData(); }
      setIsSaving(false);
    };

    const toggleItem = (item) => {
      const items = formData.diagnosis_items.includes(item) ? formData.diagnosis_items.filter(i => i !== item) : [...formData.diagnosis_items, item];
      setFormData({ ...formData, diagnosis_items: items });
    };

    const onFileChange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const url = await handleUploadPhoto(file, type);
        if (url) setFormData({ ...formData, photo_url: url });
      }
    };

    return (
      <form onSubmit={handleSave} className="bg-white p-6 md:p-10 rounded-xl border border-slate-100 shadow-sm space-y-8 md:space-y-10 animate-in slide-in-from-right-4 duration-500">
        <div className="flex justify-between items-end border-b border-slate-100 pb-5 md:pb-6">
           <h3 className="text-base md:text-2xl font-black text-slate-900">{type === 'doctor' ? '방문 진료 정보 관리' : '방문 재활 정보 관리'}</h3>
           <p className="text-[9px] md:text-xs font-bold text-slate-400">의료진 정보가 실시간 반영됩니다</p>
        </div>
        
        <div className="space-y-6 md:space-y-8">
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-1.5 md:space-y-2">
              <label className="text-[9px] md:text-[11px] font-bold text-primary ml-2 uppercase tracking-widest">의료기관 명칭</label>
              <input required value={formData.institution_name} onChange={e => setFormData({...formData, institution_name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 rounded-lg border-2 border-transparent focus:bg-white focus:border-primary/20 transition-all text-sm md:text-base font-bold" />
            </div>
            <div className="space-y-1.5 md:space-y-2">
              <label className="text-[9px] md:text-[11px] font-bold text-primary ml-2 uppercase tracking-widest">대표 의사 성함</label>
              <input required value={formData.doctor_name} onChange={e => setFormData({...formData, doctor_name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 rounded-lg border-2 border-transparent focus:bg-white focus:border-primary/20 transition-all text-sm md:text-base font-bold" />
            </div>
          </div>

          <div className="space-y-1.5 md:space-y-2">
            <label className="text-[9px] md:text-[11px] font-bold text-primary ml-2 uppercase tracking-widest">의료기관 주소</label>
            <input required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-3 bg-slate-50 rounded-lg border-2 border-transparent focus:bg-white focus:border-primary/20 transition-all text-sm md:text-base font-medium" />
          </div>

          <div className="space-y-3 md:space-y-4">
            <label className="text-[9px] md:text-[11px] font-bold text-primary ml-2 uppercase tracking-widest">전문 분야 및 진료 항목</label>
            <div className="flex flex-wrap gap-2 md:gap-2.5">
              {categories.map(cat => (
                <button key={cat} type="button" onClick={() => toggleItem(cat)} className={`px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-[10px] md:text-[12px] font-bold transition-all ${formData.diagnosis_items.includes(cat) ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 md:space-y-2">
            <label className="text-[9px] md:text-[11px] font-bold text-primary ml-2 uppercase tracking-widest">기관 소개글 및 공지사항</label>
            <textarea value={formData.introduction} onChange={e => setFormData({...formData, introduction: e.target.value})} rows={4} className="w-full px-4 py-3 bg-slate-50 rounded-lg border-2 border-transparent focus:bg-white focus:border-primary/20 transition-all text-xs md:text-sm font-medium" placeholder="병원을 소개하는 한마디를 적어주세요." />
          </div>

          <div className="grid md:grid-cols-2 gap-3 md:gap-4">
             <button type="button" onClick={() => setFormData({...formData, is_same_day: !formData.is_same_day})} className={`py-4 md:py-6 rounded-lg flex flex-col items-center gap-1.5 md:gap-2 border-2 transition-all ${formData.is_same_day ? 'border-primary bg-blue-50 text-primary scale-[1.02]' : 'border-slate-50 bg-slate-50 text-slate-400'}`}>
                <span className="material-symbols-outlined text-2xl md:text-3xl">bolt</span>
                <span className="text-[10px] md:text-[12px] font-black">당일 방문진료 가능</span>
             </button>
             <button type="button" onClick={() => setFormData({...formData, is_reservation: !formData.is_reservation})} className={`py-4 md:py-6 rounded-lg flex flex-col items-center gap-1.5 md:gap-2 border-2 transition-all ${formData.is_reservation ? 'border-primary bg-blue-50 text-primary scale-[1.02]' : 'border-slate-50 bg-slate-50 text-slate-400'}`}>
                <span className="material-symbols-outlined text-2xl md:text-3xl">calendar_today</span>
                <span className="text-[10px] md:text-[12px] font-black">예약제 시스템 운영</span>
             </button>
          </div>

          <div className="space-y-3 md:space-y-4">
            <label className="text-[9px] md:text-[11px] font-bold text-primary ml-2 uppercase tracking-widest">기관 대표 사진 (썸네일)</label>
            <div onClick={() => fileInputRef.current.click()} className="w-full h-48 md:h-64 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all overflow-hidden relative group">
              {formData.photo_url ? (
                <img src={formData.photo_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Selected" />
              ) : (
                <>
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-lg flex items-center justify-center shadow-sm mb-3 md:mb-4">
                    <span className="material-symbols-outlined text-2xl md:text-3xl text-primary">add_a_photo</span>
                  </div>
                  <span className="text-xs md:text-sm font-black text-slate-400">클릭하여 사진 업로드</span>
                  <span className="text-[9px] md:text-[10px] text-slate-300 mt-1">이미지는 웹 최적화 사이즈로 자동 처리됩니다</span>
                </>
              )}
            </div>
            <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={onFileChange} />
          </div>
        </div>

        <button disabled={isSaving} className="w-full py-4 md:py-5 bg-primary text-white font-black text-sm md:text-base rounded-lg shadow-xl shadow-primary/20 active:scale-95 transition-all mt-4 md:mt-6">
          {isSaving ? '보안 서버 저장 중...' : '서비스 등록 완료하기'}
        </button>
      </form>
    );
  };

  if (loading) return <div className="min-h-screen flex flex-col items-center justify-center font-black text-primary gap-4 animate-pulse"><span className="material-symbols-outlined text-4xl md:text-6xl">home_health</span>관리 정보를 불러오는 중입니다...</div>;

  const NAV_ITEMS = role === 'doctor' ? [
    {id: 'dashboard', label: '실시간 현황', icon: 'dashboard'},
    {id: 'profile', label: '회원/보안 설정', icon: 'manage_accounts'},
    {id: 'visit_reg', label: '방문진료 등록', icon: 'medical_services'},
    {id: 'rehab_reg', label: '방문재활 등록', icon: 'exercise'}
  ] : [
    {id: 'profile', label: '회원/보안 설정', icon: 'manage_accounts'},
    {id: 'history', label: '신청 내역', icon: 'history'}
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-on-surface">
      {/* Desktop Header Sync from Home */}
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
               <span className="text-sm font-bold text-on-surface-variant">{user?.email?.split('@')[0]}님</span>
            </div>
            <div className="flex items-center gap-4 border-l border-slate-200 pl-8">
              <button className="p-2 text-slate-600 hover:text-primary transition-colors">
                <span className="material-symbols-outlined">favorite</span>
              </button>
              <button className="p-2 text-slate-600 hover:text-primary transition-colors relative">
                <span className="material-symbols-outlined">notifications</span>
                {user && <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full animate-pulse"></span>}
              </button>
              <button className="p-2 text-primary transition-colors" onClick={() => navigate('/mypage')}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Header Sync from Home */}
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
          </div>
        </div>
      </header>

      <div className="max-w-[1280px] mx-auto pt-16 md:pt-28 px-4 md:px-6">
        <div className="md:grid md:grid-cols-[220px_1fr] gap-8 md:gap-12">
          
          {/* Sidebar (Slimmer) */}
          <aside className="hidden md:block space-y-6 sticky top-28 h-fit">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-6">
               <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
                     <span className="material-symbols-outlined text-3xl text-primary">{role === 'doctor' ? 'doctor' : 'person'}</span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900">{profile?.full_name}</h2>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{role === 'doctor' ? 'MEDICAL STAFF' : 'GENERAL USER'}</p>
               </div>
               
               <nav className="space-y-1.5 pt-4 border-t border-slate-50">
                  {NAV_ITEMS.map(item => (
                    <button 
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-black transition-all ${activeTab === item.id ? 'bg-primary text-white shadow-lg shadow-primary/10 scale-[1.02]' : 'bg-white text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
                    >
                      <span className="material-symbols-outlined text-xl">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                  <button 
                    onClick={() => signOut().then(() => navigate('/login'))}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-black transition-all bg-white text-red-400 hover:text-red-600 hover:bg-red-50 mt-4 border border-red-50"
                  >
                    <span className="material-symbols-outlined text-xl">logout</span>
                    로그아웃
                  </button>
               </nav>
            </div>
            
            <button onClick={() => navigate('/')} className="w-full py-4 bg-white border-2 border-primary/10 text-primary font-black rounded-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-2 text-xs">
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              홈으로 돌아가기
            </button>
          </aside>

          {/* Main */}
          <main className="pb-32 md:pb-20">
            {/* Mobile Tab Nav (Reduced fonts and corners) */}
            <div className="md:hidden flex gap-2 overflow-x-auto py-4 no-scrollbar border-b border-slate-100 mb-4">
              {NAV_ITEMS.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap text-[10px] font-black transition-all ${activeTab === t.id ? 'bg-primary text-white shadow-md' : 'bg-white text-slate-400 border border-slate-100'}`}>
                  <span className="material-symbols-outlined text-base">{t.icon}</span>
                  {t.label}
                </button>
              ))}
              <button 
                onClick={() => signOut().then(() => navigate('/login'))}
                className="flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap text-[10px] font-black transition-all bg-red-50 text-red-600 border border-red-100"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                로그아웃
              </button>
            </div>

            <div className="animate-in slide-in-from-right duration-500">
               {activeTab === 'profile' ? (
                 <ProfileSettingsView />
               ) : role === 'user' ? (
                 <>
                   {activeTab === 'history' && <RequestHistoryView />}
                 </>
               ) : (
                 <>
                   {activeTab === 'dashboard' && <DoctorDashboard />}
                   {activeTab === 'visit_reg' && <DoctorServiceForm type="doctor" />}
                   {activeTab === 'rehab_reg' && <DoctorServiceForm type="rehab" />}
                 </>
               )}
            </div>
          </main>
        </div>
      </div>

      <div className="md:hidden">
        <BottomNav active="profile" />
      </div>
    </div>
  );
};

export default MyPage;
