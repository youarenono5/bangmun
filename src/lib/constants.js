export const MOCK_INSTITUTIONS = {
  doctor: [
    { id: 1, name: '바른마음 내과의원', category: '내과, 가정의학과, 검진센터', symptoms: '감기, 기침, 복통, 소화불량, 고혈압, 당뇨', rating: 4.9, reviews: 128, distance: '1.2km', image: 'https://images.unsplash.com/photo-1519494140261-d586d6a6711d?auto=format&fit=crop&q=80&w=400', status: 'open', region: '서울' },
    { id: 2, name: '아이꿈 소아청소년과', category: '소아과, 이비인후과, 예방접종', symptoms: '열남, 기침, 비염, 영유아검진, 예방접종, 중이염', rating: 5.0, reviews: 89, distance: '2.5km', image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=400', status: 'open', region: '경기' },
    { id: 3, name: '더맑은 피부과의원', category: '피부과, 레이저클리닉', symptoms: '아토피, 피부염, 여드름, 점, 기미, 알러지', rating: 4.7, reviews: 215, distance: '1.9km', image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&q=80&w=400', status: 'closed', region: '서울' },
    { id: 6, name: '서울 아산 힐링 내과', category: '내과, 가정의학과', symptoms: '검진, 위시경, 대장내시경, 가슴통증', rating: 4.9, reviews: 1240, distance: '800m', image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400', status: 'open', region: '서울' },
  ],
  rehab: [
    { id: 4, name: '서울 연세 재활의학센터', category: '재활의학과, 도수치료, 통증의학', symptoms: '허리디스크, 목디스크, 관절염, 오십견, 거북목', rating: 4.8, reviews: 342, distance: '0.8km', image: 'https://images.unsplash.com/photo-1576091160550-217359f41f48?auto=format&fit=crop&q=80&w=400', status: 'open', region: '서울', sigungu: '서대문구' },
    { id: 5, name: '튼튼 마디 재활원', category: '노인재활, 거동불편 케어', symptoms: '중풍, 뇌졸중 후유증, 보행훈련, 근력강화', rating: 4.6, reviews: 56, distance: '3.1km', image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=400', status: 'open', region: '경기', sigungu: '수원시' },
    { id: 7, name: '연세 바른 재활의학과', category: '재활의학과, 정형외과, 도수치료', symptoms: '어깨통증, 골반교정, 체형교정, 스포츠부상', rating: 4.8, reviews: 856, distance: '1.2km', image: 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?auto=format&fit=crop&q=80&w=400', status: 'open', region: '서울', sigungu: '강남구' },
    { id: 8, name: '다움 방문재활센터', category: '방문재활, 인지재활, 운동치료', symptoms: '치매예방, 거동불편 케어, 일상동작 훈련, 연하장애', rating: 4.9, reviews: 112, distance: '2.4km', image: 'https://images.unsplash.com/photo-1576091160550-217359f41f48?auto=format&fit=crop&q=80&w=400', status: 'open', region: '부산', sigungu: '해운대구' },
  ]
};

export const DEPARTMENTS = [
  { name: '전체', emoji: '🏠', bgColor: 'bg-blue-50' },
  { name: '내과', emoji: '🩺', bgColor: 'bg-red-50' },
  { name: '재활의학', emoji: '🧘', bgColor: 'bg-green-50' },
  { name: '가정의학', emoji: '👨‍👩‍👧‍👦', bgColor: 'bg-orange-50' },
  { name: '정형외과', emoji: '🦴', bgColor: 'bg-slate-100' },
  { name: '소아청소년', emoji: '👶', bgColor: 'bg-pink-50' },
  { name: '이비인후', emoji: '👂', bgColor: 'bg-purple-50' },
  { name: '피구과', emoji: '✨', bgColor: 'bg-yellow-50' },
  { name: '정신의학', emoji: '🧠', bgColor: 'bg-teal-50' },
  { name: '산부인과', emoji: '🤰', bgColor: 'bg-rose-50' },
  { name: '한방과', emoji: '🌿', bgColor: 'bg-emerald-50' },
  { name: '신경과', emoji: '⚡', bgColor: 'bg-yellow-100' },
  { name: '신경외과', emoji: '🏥', bgColor: 'bg-sky-50' },
  { name: '안과', emoji: '👁️', bgColor: 'bg-cyan-50' },
];
