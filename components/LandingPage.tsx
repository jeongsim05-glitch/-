import React, { useState } from 'react';
import { Member } from '../types';
import { ArrowRight, Search, Lock, AlertCircle } from 'lucide-react';

interface LandingPageProps {
  members: Member[];
  onLogin: (member: Member) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ members, onLogin }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Logo Component
  const ClubLogo = () => (
    <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sunGradBig" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="40" r="28" fill="url(#sunGradBig)" />
      <path d="M 15 65 Q 50 50 85 65" stroke="#fbbf24" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );

  const isExecutive = (position: string) => {
    return ['회장', '부회장', '이사', '국장', '감사', '총무', '재무', '고문'].some(role => position.includes(role));
  };

  const handleMemberSelect = (member: Member) => {
    setSelectedMember(member);
    setPassword('');
    setError('');
    
    // If not an executive and no password set, login immediately as read-only user
    if (!isExecutive(member.position) && !member.password) {
        onLogin(member);
    }
  };

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    if (selectedMember.password === password) {
        onLogin(selectedMember);
    } else {
        setError('비밀번호가 일치하지 않습니다.');
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.includes(searchTerm) || m.phone.includes(searchTerm)
  );

  return (
    <div className="relative min-h-screen overflow-hidden font-sans flex flex-col items-center justify-center bg-black">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0 select-none">
          <img 
            src="https://images.unsplash.com/photo-1626224583764-84786c719088?q=80&w=2070&auto=format&fit=crop" 
            alt="Badminton Court" 
            className="w-full h-full object-cover opacity-60"
          />
          {/* Dark Overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/90"></div>
          
          {/* Giant Watermark Logo Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] md:w-[800px] md:h-[800px] opacity-10 blur-sm pointer-events-none animate-in spin-in-180 duration-[30s]">
              <ClubLogo />
          </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-5xl px-6 text-center text-white flex flex-col items-center">
        
        {/* Brand Section */}
        <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
           {/* Small Logo Icon */}
           <div className="w-20 h-20 md:w-24 md:h-24 mb-8 drop-shadow-[0_0_25px_rgba(234,88,12,0.6)]">
             <ClubLogo />
           </div>

           <h2 className="text-sm md:text-lg font-medium text-orange-200 tracking-[0.3em] uppercase mb-4 opacity-80">
             Sunrise of your new day
           </h2>
           
           <h1 className="font-serif-display text-6xl md:text-8xl lg:text-9xl font-black mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-orange-50 to-orange-200 drop-shadow-lg">
             Haeoreum
           </h1>
           
           <div className="flex items-center gap-4 w-full justify-center">
               <div className="h-[1px] w-12 md:w-24 bg-gradient-to-r from-transparent to-white/40"></div>
               <p className="text-2xl md:text-4xl font-light tracking-[0.15em] text-white/90 uppercase font-serif-display">
                 Badminton Club
               </p>
               <div className="h-[1px] w-12 md:w-24 bg-gradient-to-l from-transparent to-white/40"></div>
           </div>
        </div>

        {/* Enter Button */}
        <div className="mt-20 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            <button 
                onClick={() => setShowLoginModal(true)}
                className="group relative inline-flex items-center gap-4 px-12 py-5 bg-white/5 backdrop-blur-md border border-white/20 text-white rounded-full text-lg font-medium transition-all duration-300 hover:bg-white/15 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,165,0,0.3)] hover:border-orange-500/50"
            >
                <span className="tracking-widest text-sm font-bold">ENTER CLUB</span>
                <ArrowRight className="w-5 h-5 text-orange-400 group-hover:translate-x-2 transition-transform duration-300" />
            </button>
        </div>

        <div className="absolute -bottom-32 md:-bottom-40 left-0 right-0 text-center">
            <p className="text-[10px] text-slate-500 font-light tracking-[0.2em] uppercase mb-2">
                EST. 2024 • BORYEONG CITY
            </p>
            <p className="text-[10px] text-slate-600">
                Authorized Personnel Only
            </p>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh] border border-white/10">
            
            {!selectedMember ? (
                // Step 1: Select Member
                <>
                    <div className="p-6 bg-slate-50 border-b">
                        <h2 className="text-xl font-bold text-slate-800 font-serif-display">Member Login</h2>
                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Select your profile to continue</p>
                    </div>
                    <div className="p-4 border-b bg-white">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-orange-500 transition-colors" />
                            <input 
                                type="text" 
                                placeholder="이름 검색 (Search Name)" 
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none bg-gray-50 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-white">
                        {filteredMembers.map(member => (
                            <button 
                                key={member.id}
                                onClick={() => handleMemberSelect(member)}
                                className="w-full flex items-center justify-between p-3 hover:bg-orange-50 rounded-xl transition-all text-left group border border-transparent hover:border-orange-100"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${isExecutive(member.position) ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-orange-600'}`}>
                                        {member.name.slice(0,1)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800 group-hover:text-orange-700">{member.name}</div>
                                        <div className="text-xs text-gray-400 group-hover:text-orange-400">{member.position} • {member.rank}조</div>
                                    </div>
                                </div>
                                {isExecutive(member.position) && <Lock className="w-3 h-3 text-gray-300" />}
                            </button>
                        ))}
                        {filteredMembers.length === 0 && (
                            <div className="text-center py-10 text-gray-400 text-sm">검색 결과가 없습니다.</div>
                        )}
                    </div>
                    <div className="p-4 border-t bg-gray-50 text-center">
                        <button onClick={() => setShowLoginModal(false)} className="text-gray-400 hover:text-gray-800 text-xs font-bold uppercase tracking-widest transition-colors">Close</button>
                    </div>
                </>
            ) : (
                // Step 2: Password (If Executive)
                <form onSubmit={handlePasswordLogin} className="p-8 flex flex-col items-center bg-white">
                    <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-6 ring-4 ring-orange-50">
                        <Lock className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 font-serif-display">{selectedMember.name}</h3>
                    <p className="text-xs text-gray-400 mb-8 uppercase tracking-widest">Administrator Access Required</p>
                    
                    <div className="w-full relative">
                        <input 
                            type="password" 
                            placeholder="Password" 
                            className="w-full text-center text-lg px-4 py-4 border-b-2 border-gray-200 focus:border-orange-500 outline-none mb-6 tracking-[0.5em] bg-transparent transition-colors placeholder:tracking-normal placeholder:text-gray-300"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoFocus
                        />
                    </div>
                    
                    {error && (
                        <div className="flex items-center gap-2 text-red-500 text-xs mb-6 bg-red-50 px-4 py-2 rounded-full w-full justify-center">
                            <AlertCircle className="w-3 h-3" /> {error}
                        </div>
                    )}

                    <button 
                        type="submit"
                        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                    >
                        LOGIN
                    </button>
                    <button 
                        type="button"
                        onClick={() => setSelectedMember(null)}
                        className="mt-6 text-gray-400 hover:text-gray-600 text-xs underline"
                    >
                        Back to Selection
                    </button>
                </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;