import React, { useState, useMemo } from 'react';
import { Member, Match, WinStats } from '../types';
import { analyzeMatchup } from '../services/geminiService';
import { Sparkles, BarChart2, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import ActionButtons from './ActionButtons';

interface AnalysisProps {
  members: Member[];
  matches: Match[];
}

const Analysis: React.FC<AnalysisProps> = ({ members, matches }) => {
  const [selectedTeam1, setSelectedTeam1] = useState<string[]>([]);
  const [selectedTeam2, setSelectedTeam2] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // --- Real Win Rate Calculation from Match History ---
  const getStats = (memberId: string): WinStats => {
    // Filter finished matches involving this member
    const memberMatches = matches.filter(m => 
      m.winner !== undefined && 
      (m.team1.some(p => p.id === memberId) || m.team2.some(p => p.id === memberId))
    );

    let wins = 0;
    let losses = 0;

    memberMatches.forEach(m => {
      const isTeam1 = m.team1.some(p => p.id === memberId);
      
      // If member is Team 1 and Winner is 1 -> Win
      // If member is Team 2 and Winner is 2 -> Win
      if ((isTeam1 && m.winner === 1) || (!isTeam1 && m.winner === 2)) {
        wins++;
      } else {
        losses++;
      }
    });

    const total = wins + losses;
    const winRate = total > 0 ? wins / total : 0;
    
    return {
      wins,
      losses,
      draws: 0,
      total,
      winRate
    };
  };

  const handleAnalyze = async () => {
    if (selectedTeam1.length === 0 || selectedTeam2.length === 0) {
      alert("양 팀에 최소 1명 이상의 선수를 선택해주세요.");
      return;
    }

    setLoading(true);
    setResult(null);

    const t1Members = members.filter(m => selectedTeam1.includes(m.id));
    const t2Members = members.filter(m => selectedTeam2.includes(m.id));
    
    // Calculate stats based on accumulated `matches` data
    const t1Stats = t1Members.map(m => getStats(m.id));
    const t2Stats = t2Members.map(m => getStats(m.id));

    const analysis = await analyzeMatchup(t1Members, t2Members, t1Stats, t2Stats);
    setResult(analysis);
    setLoading(false);
  };

  const chartData = result ? [
    { name: '팀 1 승리', value: result.winProbabilityTeam1, color: '#f97316' }, // Orange
    { name: '팀 2 승리', value: result.winProbabilityTeam2, color: '#3b82f6' }, // Blue
  ] : [];

  return (
    <div className="h-full flex flex-col gap-6">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="text-orange-500" />
                AI 승률 분석 (Gemini 2.5)
            </h2>
            <ActionButtons targetId="analysis-content" fileName="해오름클럽_승률분석" />
        </div>

        <div id="analysis-content" className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* Selection Panel */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
            <div className="mb-6">
                <p className="text-xs text-gray-500 mt-1">
                    누적된 경기 데이터({matches.filter(m=>m.winner).length}건)를 기반으로 승리 확률을 예측합니다.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                <h3 className="font-bold text-orange-800 mb-2">팀 1 (Home)</h3>
                <select 
                className="w-full p-2 border rounded mb-2 text-sm"
                onChange={(e) => e.target.value && setSelectedTeam1(prev => [...prev, e.target.value])}
                >
                <option value="">선수 추가...</option>
                {members.filter(m => !selectedTeam1.includes(m.id) && !selectedTeam2.includes(m.id)).map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.rank})</option>
                ))}
                </select>
                <div className="space-y-1">
                {members.filter(m => selectedTeam1.includes(m.id)).map(m => {
                    const stats = getStats(m.id);
                    return (
                        <div key={m.id} className="flex justify-between items-center bg-white p-2 rounded text-sm shadow-sm">
                            <div>
                                <span className="font-bold">{m.name}</span>
                                <span className="text-xs text-gray-500 ml-1">
                                    ({stats.wins}승 {stats.losses}패, {Math.round(stats.winRate*100)}%)
                                </span>
                            </div>
                            <button onClick={() => setSelectedTeam1(prev => prev.filter(id => id !== m.id))} className="text-red-500 px-2 no-print">✕</button>
                        </div>
                    );
                })}
                </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="font-bold text-blue-800 mb-2">팀 2 (Away)</h3>
                <select 
                className="w-full p-2 border rounded mb-2 text-sm"
                onChange={(e) => e.target.value && setSelectedTeam2(prev => [...prev, e.target.value])}
                >
                <option value="">선수 추가...</option>
                {members.filter(m => !selectedTeam1.includes(m.id) && !selectedTeam2.includes(m.id)).map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.rank})</option>
                ))}
                </select>
                <div className="space-y-1">
                {members.filter(m => selectedTeam2.includes(m.id)).map(m => {
                    const stats = getStats(m.id);
                    return (
                        <div key={m.id} className="flex justify-between items-center bg-white p-2 rounded text-sm shadow-sm">
                            <div>
                                <span className="font-bold">{m.name}</span>
                                <span className="text-xs text-gray-500 ml-1">
                                    ({stats.wins}승 {stats.losses}패, {Math.round(stats.winRate*100)}%)
                                </span>
                            </div>
                            <button onClick={() => setSelectedTeam2(prev => prev.filter(id => id !== m.id))} className="text-red-500 px-2 no-print">✕</button>
                        </div>
                    );
                })}
                </div>
            </div>
            </div>

            <button 
            onClick={handleAnalyze}
            disabled={loading}
            className="mt-auto w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all flex justify-center items-center gap-3 no-print"
            >
            {loading ? (
                <span className="animate-pulse flex items-center gap-2"><RefreshCw className="w-5 h-5 animate-spin"/> AI 분석 중...</span>
            ) : (
                <>
                <BrainCircuit className="w-6 h-6" />
                AI 승률 분석 시작
                </>
            )}
            </button>
        </div>

        {/* Result Panel */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 min-h-[400px]">
            {!result ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <BarChart2 className="w-16 h-16 mb-4 opacity-20" />
                <p>양 팀을 구성하고 분석 버튼을 눌러주세요.</p>
                <p className="text-xs mt-2">누적된 스프레드시트 데이터와 급수를 기반으로 분석합니다.</p>
            </div>
            ) : (
            <div className="h-full flex flex-col">
                <h3 className="text-lg font-bold border-b pb-2 mb-4">분석 결과 리포트</h3>
                
                <div className="flex-1 flex flex-col items-center justify-center min-h-[200px]">
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                    </PieChart>
                </ResponsiveContainer>
                <div className="text-center -mt-4 mb-6">
                    <span className="text-sm text-gray-500">예상 승률</span>
                    <div className="flex gap-4 justify-center font-bold text-xl">
                    <span className="text-orange-500">팀 1: {result.winProbabilityTeam1}%</span>
                    <span className="text-gray-300">vs</span>
                    <span className="text-blue-500">팀 2: {result.winProbabilityTeam2}%</span>
                    </div>
                </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4" /> 
                    AI 관전 포인트
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                    {result.analysis}
                </p>
                <h4 className="font-bold flex items-center gap-2 mb-2 text-xs text-gray-500 uppercase">
                    <AlertCircle className="w-3 h-3" />
                    Key Factors
                </h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {result.keyFactors.map((factor: string, idx: number) => (
                    <li key={idx}>{factor}</li>
                    ))}
                </ul>
                </div>
            </div>
            )}
        </div>
        </div>
    </div>
  );
};

// Simple icon wrapper needed since I can't import lucide icon in the top level if it's not used in this file
function BrainCircuit(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
      <path d="M9 13a4.5 4.5 0 0 0 3-4" />
      <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
      <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
      <path d="M6 18a4 4 0 0 1-1.967-.516" />
      <path d="M12 13h4" />
      <path d="M12 18h6a2 2 0 0 1 2 2v1" />
      <path d="M12 8h8" />
      <path d="M16 8V5a2 2 0 0 1 2-2" />
      <path d="M16 13v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
}

export default Analysis;