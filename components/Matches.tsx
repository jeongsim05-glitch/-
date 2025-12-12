import React, { useState, useEffect } from 'react';
import { Member, Match, GameType, Rank } from '../types';
import { Shuffle, Trophy, Upload, Plus, X, Copy } from 'lucide-react';
import ActionButtons from './ActionButtons';

interface MatchesProps {
  members: Member[];
  matches: Match[];
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
}

const Matches: React.FC<MatchesProps> = ({ members, matches, setMatches }) => {
  const [selectedType, setSelectedType] = useState<GameType>(GameType.MENS_DOUBLES);
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  const [matchByRank, setMatchByRank] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  
  // Manual Match State
  const [manualMatch, setManualMatch] = useState<{t1p1: string, t1p2: string, t2p1: string, t2p2: string}>({
      t1p1: '', t1p2: '', t2p1: '', t2p2: ''
  });

  // Filter members based on Game Type
  const eligibleMembers = members.filter(m => {
      if (selectedType === GameType.MENS_DOUBLES) return m.gender === 'M';
      if (selectedType === GameType.WOMENS_DOUBLES) return m.gender === 'F';
      return true; // Singles or Mixed
  });

  // Reset selection when type changes
  useEffect(() => {
    setSelectedMemberIds(new Set());
  }, [selectedType]);

  const toggleMember = (id: string) => {
    const newSet = new Set(selectedMemberIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedMemberIds(newSet);
  };

  const selectAll = () => {
    if (selectedMemberIds.size === eligibleMembers.length) {
      setSelectedMemberIds(new Set());
    } else {
      setSelectedMemberIds(new Set(eligibleMembers.map(m => m.id)));
    }
  };

  const getRankValue = (rank: Rank) => {
      switch(rank) {
          case Rank.A: return 5;
          case Rank.B: return 4;
          case Rank.C: return 3;
          case Rank.D: return 2;
          case Rank.BEGINNER: return 1;
          default: return 0;
      }
  };

  const generateBracket = () => {
    let pool = members.filter(m => selectedMemberIds.has(m.id));
    if (pool.length < 2) {
      alert("최소 2명 이상의 회원을 선택해주세요.");
      return;
    }

    let newMatches: Match[] = [];

    // --- Sorting / Shuffling Logic ---
    if (matchByRank) {
        // Sort by rank value desc
        pool.sort((a,b) => getRankValue(b.rank) - getRankValue(a.rank));
        // Add a little randomness within same rank? 
        // For strict rank matching, just keep sorted.
    } else {
        // Full Shuffle
        pool = pool.sort(() => 0.5 - Math.random());
    }

    if (selectedType === GameType.MIXED_DOUBLES) {
        // Mixed Doubles Logic: Split M and F, shuffle each, pair them
        const men = pool.filter(m => m.gender === 'M');
        const women = pool.filter(m => m.gender === 'F');
        
        if (men.length < 2 || women.length < 2) {
            alert("혼합복식은 남녀 각각 최소 2명이 필요합니다.");
            return;
        }

        // Shuffle separated lists if not ranking match
        if (!matchByRank) {
            men.sort(() => 0.5 - Math.random());
            women.sort(() => 0.5 - Math.random());
        }

        const maxTeams = Math.min(men.length, women.length);
        // We need pairs of teams (4 people). so integer division by 2
        const gamesCount = Math.floor(maxTeams / 2);

        for (let i = 0; i < gamesCount * 2; i+=2) {
             // Team 1: men[i] + women[i]
             // Team 2: men[i+1] + women[i+1]
             newMatches.push({
                id: `match-${Date.now()}-${i}`,
                type: selectedType,
                team1: [men[i], women[i]],
                team2: [men[i+1], women[i+1]],
                date: new Date().toISOString().split('T')[0],
             });
        }
        
        if (men.length !== women.length || maxTeams % 2 !== 0) {
             alert(`성비가 맞지 않거나 인원이 홀수여서 일부 인원은 대진에서 제외되었습니다.`);
        }

    } else if (selectedType !== GameType.SINGLES) {
      // Doubles (Mens/Womens)
      if (pool.length < 4) {
        alert("복식 경기는 최소 4명이 필요합니다.");
        return;
      }
      
      // If Ranked, we pair neighbors: [High, High] vs [High, High]
      // Or Balance? Usually [High, Low] vs [High, Low]? 
      // User asked for "Match by Rank" -> Similar ranks play together.
      
      for (let i = 0; i < Math.floor(pool.length / 4) * 4; i += 4) {
        newMatches.push({
          id: `match-${Date.now()}-${i}`,
          type: selectedType,
          team1: [pool[i], pool[i+1]],
          team2: [pool[i+2], pool[i+3]],
          date: new Date().toISOString().split('T')[0],
        });
      }
    } else {
      // Singles
      for (let i = 0; i < Math.floor(pool.length / 2) * 2; i += 2) {
        newMatches.push({
          id: `match-${Date.now()}-${i}`,
          type: selectedType,
          team1: [pool[i]],
          team2: [pool[i+1]],
          date: new Date().toISOString().split('T')[0],
        });
      }
    }

    setMatches(prev => [...newMatches, ...prev]);
  };

  const updateScore = (matchId: string, team: 1 | 2, score: string) => {
    const num = parseInt(score) || 0;
    setMatches(prev => prev.map(m => {
      if (m.id !== matchId) return m;
      const updated = { ...m, [team === 1 ? 'score1' : 'score2']: num };
      if (updated.score1 !== undefined && updated.score2 !== undefined) {
         if (updated.score1 > updated.score2) updated.winner = 1;
         else if (updated.score2 > updated.score1) updated.winner = 2;
         else updated.winner = undefined;
      }
      return updated;
    }));
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if(!file) return;
      
      const reader = new FileReader();
      reader.onload = (evt) => {
          const text = evt.target?.result as string;
          const lines = text.split('\n').slice(1);
          const uploadedMatches: Match[] = [];
          
          lines.forEach((line, idx) => {
             if(!line.trim()) return;
             const cols = line.split(',');
             const type = cols[0] as GameType;
             
             // Find members by name (Simple logic)
             const findM = (name: string) => members.find(m => m.name === name.trim()) || { id: 'unknown', name: name, rank: Rank.BEGINNER } as Member;
             
             const team1 = [findM(cols[2])];
             if(cols[3]) team1.push(findM(cols[3]));
             
             const team2 = [findM(cols[4])];
             if(cols[5]) team2.push(findM(cols[5]));
             
             uploadedMatches.push({
                 id: `upload-${Date.now()}-${idx}`,
                 type,
                 date: cols[1] || new Date().toISOString().split('T')[0],
                 team1,
                 team2,
                 score1: parseInt(cols[6]) || 0,
                 score2: parseInt(cols[7]) || 0
             });
          });
          setMatches(prev => [...uploadedMatches, ...prev]);
          alert(`${uploadedMatches.length}개의 경기가 업로드되었습니다.`);
      };
      reader.readAsText(file);
  };

  // --- Copy for Google Sheets ---
  const handleCopyForSheet = () => {
      // Format: Date | Type | Winner Team Names | Loser Team Names | Score
      const headers = "날짜\t종목\t승자팀\t패자팀\t점수";
      const rows = matches.filter(m => m.winner).map(m => {
          const winnerTeam = m.winner === 1 ? m.team1 : m.team2;
          const loserTeam = m.winner === 1 ? m.team2 : m.team1;
          const score = m.winner === 1 ? `${m.score1}:${m.score2}` : `${m.score2}:${m.score1}`;
          
          const wNames = winnerTeam.map(p => p.name).join(',');
          const lNames = loserTeam.map(p => p.name).join(',');
          
          return `${m.date}\t${m.type}\t${wNames}\t${lNames}\t${score}`;
      }).join('\n');

      navigator.clipboard.writeText(`${headers}\n${rows}`).then(() => {
          alert("클립보드에 복사되었습니다. 구글 스프레드시트에 바로 붙여넣으세요 (Ctrl+V).");
      });
  };

  // --- Manual Match ---
  const addManualMatch = () => {
      const p1 = members.find(m => m.id === manualMatch.t1p1);
      const p2 = members.find(m => m.id === manualMatch.t1p2);
      const p3 = members.find(m => m.id === manualMatch.t2p1);
      const p4 = members.find(m => m.id === manualMatch.t2p2);
      
      if (!p1 || !p3) {
          alert("각 팀에 최소 1명은 있어야 합니다.");
          return;
      }
      
      const team1 = [p1];
      if (p2) team1.push(p2);
      const team2 = [p3];
      if (p4) team2.push(p4);
      
      setMatches(prev => [{
          id: `manual-${Date.now()}`,
          type: selectedType,
          team1,
          team2,
          date: new Date().toISOString().split('T')[0]
      }, ...prev]);
      
      setShowManualModal(false);
      setManualMatch({t1p1: '', t1p2: '', t2p1: '', t2p2: ''});
  };


  return (
    <div className="space-y-6">
      <div className="no-print flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">대진표 생성 및 관리</h2>
          <p className="text-sm text-gray-500">참석 인원을 선택하여 대진표를 자동 생성합니다.</p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
           <ActionButtons targetId="matches-content" fileName="해오름클럽_대진표" />
           <button onClick={handleCopyForSheet} className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
            <Copy className="w-4 h-4" />
            <span className="hidden md:inline">시트용 복사</span>
          </button>
        </div>
      </div>

      {/* Control Panel (Hidden when printing) */}
      <div className="no-print bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-4">
        <div className="flex flex-wrap gap-4 items-center border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-700">종목:</span>
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value as GameType)}
              className="border rounded p-2 text-sm"
            >
              {Object.values(GameType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input type="checkbox" checked={matchByRank} onChange={e => setMatchByRank(e.target.checked)} className="rounded text-orange-600" />
              <span>급수별 매칭 (비슷한 실력 우선)</span>
          </label>

          <button onClick={selectAll} className="text-sm text-blue-600 font-medium hover:underline">
            전체 선택/해제
          </button>
          <div className="flex-1 text-right text-sm text-gray-500">
            선택된 인원: <span className="font-bold text-orange-600">{selectedMemberIds.size}</span>명
          </div>
        </div>
        
        <div className="max-h-60 overflow-y-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {eligibleMembers.map(member => (
            <label key={member.id} className={`
              flex items-center gap-2 p-2 rounded border cursor-pointer text-sm transition-colors
              ${selectedMemberIds.has(member.id) ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-transparent'}
            `}>
              <input 
                type="checkbox" 
                checked={selectedMemberIds.has(member.id)}
                onChange={() => toggleMember(member.id)}
                className="rounded text-orange-600 focus:ring-orange-500"
              />
              <div className="truncate">
                  <span className="font-bold">{member.name}</span>
                  <span className={`ml-1 text-xs px-1 rounded ${member.gender === 'M' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                      {member.rank}
                  </span>
              </div>
            </label>
          ))}
          {eligibleMembers.length === 0 && <div className="col-span-full text-center py-4 text-gray-400">해당 종목에 참여 가능한 회원이 없습니다.</div>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={generateBracket}
              className="w-full bg-slate-800 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-900"
            >
              <Shuffle className="w-5 h-5" />
              대진표 자동 생성
            </button>
            <button 
              onClick={() => setShowManualModal(true)}
              className="w-full bg-white border-2 border-slate-200 text-slate-700 py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-50"
            >
              <Plus className="w-5 h-5" />
              수동 경기 추가 (파트너 지정)
            </button>
        </div>
      </div>

      {/* Bracket Display (Printable Area) */}
      <div id="matches-content" className="print-area bg-white p-6 rounded-xl shadow-sm border border-gray-200 min-h-[500px]">
        <div className="text-center mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold text-slate-800">해오름클럽 금일 대진표</h1>
          <p className="text-gray-500 mt-2">{new Date().toLocaleDateString()}</p>
        </div>

        {matches.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>생성된 경기가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {matches.map((match, idx) => (
              <div key={match.id} className="border border-slate-200 rounded-lg overflow-hidden break-inside-avoid">
                <div className="bg-slate-100 px-4 py-2 flex justify-between items-center text-sm font-medium text-slate-600">
                  <span>Game {matches.length - idx}</span>
                  <span className="px-2 py-0.5 bg-white rounded border text-xs">{match.type}</span>
                </div>
                <div className="p-4 flex items-center justify-between gap-4">
                  {/* Team 1 */}
                  <div className={`flex-1 text-center p-2 rounded cursor-pointer ${match.winner === 1 ? 'bg-orange-50 ring-2 ring-orange-200' : ''}`}
                       onClick={() => updateScore(match.id, 1, '25')} title="승리 처리 (간편)"
                  >
                    {match.team1.map(m => (
                      <div key={m.id} className="font-bold text-gray-800">{m.name} <span className="text-xs font-normal text-gray-500">({m.rank})</span></div>
                    ))}
                    <input 
                      type="number" 
                      placeholder="점수" 
                      className="no-print mt-2 w-16 text-center border rounded p-1 text-sm"
                      value={match.score1 || ''}
                      onChange={(e) => updateScore(match.id, 1, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="print-only text-xl font-bold mt-1">{match.score1}</div>
                  </div>

                  <div className="font-bold text-slate-300">VS</div>

                  {/* Team 2 */}
                  <div className={`flex-1 text-center p-2 rounded cursor-pointer ${match.winner === 2 ? 'bg-orange-50 ring-2 ring-orange-200' : ''}`}
                       onClick={() => updateScore(match.id, 2, '25')} title="승리 처리 (간편)"
                  >
                    {match.team2.map(m => (
                      <div key={m.id} className="font-bold text-gray-800">{m.name} <span className="text-xs font-normal text-gray-500">({m.rank})</span></div>
                    ))}
                    <input 
                      type="number" 
                      placeholder="점수" 
                      className="no-print mt-2 w-16 text-center border rounded p-1 text-sm"
                      value={match.score2 || ''}
                      onChange={(e) => updateScore(match.id, 2, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                     <div className="print-only text-xl font-bold mt-1">{match.score2}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Match Modal */}
      {showManualModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 no-print">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg">수동 경기 추가</h3>
                      <button onClick={() => setShowManualModal(false)}><X className="w-5 h-5"/></button>
                  </div>
                  <div className="space-y-4">
                      <div className="p-3 bg-orange-50 rounded">
                          <p className="font-bold text-orange-800 mb-2">팀 1</p>
                          <select className="w-full border p-2 rounded mb-2" value={manualMatch.t1p1} onChange={e=>setManualMatch({...manualMatch, t1p1: e.target.value})}>
                              <option value="">선수 1 선택</option>
                              {members.map(m=><option key={m.id} value={m.id}>{m.name} ({m.rank})</option>)}
                          </select>
                          <select className="w-full border p-2 rounded" value={manualMatch.t1p2} onChange={e=>setManualMatch({...manualMatch, t1p2: e.target.value})}>
                              <option value="">선수 2 선택 (복식)</option>
                              {members.map(m=><option key={m.id} value={m.id}>{m.name} ({m.rank})</option>)}
                          </select>
                      </div>
                      <div className="p-3 bg-blue-50 rounded">
                          <p className="font-bold text-blue-800 mb-2">팀 2</p>
                          <select className="w-full border p-2 rounded mb-2" value={manualMatch.t2p1} onChange={e=>setManualMatch({...manualMatch, t2p1: e.target.value})}>
                              <option value="">선수 1 선택</option>
                              {members.map(m=><option key={m.id} value={m.id}>{m.name} ({m.rank})</option>)}
                          </select>
                          <select className="w-full border p-2 rounded" value={manualMatch.t2p2} onChange={e=>setManualMatch({...manualMatch, t2p2: e.target.value})}>
                              <option value="">선수 2 선택 (복식)</option>
                              {members.map(m=><option key={m.id} value={m.id}>{m.name} ({m.rank})</option>)}
                          </select>
                      </div>
                      <button onClick={addManualMatch} className="w-full bg-slate-900 text-white py-3 rounded font-bold hover:bg-slate-800">
                          경기 추가
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Matches;