import React, { useState, useMemo } from 'react';
import { Member, AttendanceRecord } from '../types';
import { Calendar, User, Trophy, Flame } from 'lucide-react';
import ActionButtons from './ActionButtons';

interface AttendanceProps {
  members: Member[];
  attendanceRecords: AttendanceRecord[];
  setAttendanceRecords: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
}

const Attendance: React.FC<AttendanceProps> = ({ members, attendanceRecords, setAttendanceRecords }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMemberId, setSelectedMemberId] = useState<string>('all'); // 'all' or memberId
  const [hoveredInfo, setHoveredInfo] = useState<{dateStr: string, count: number} | null>(null);

  // --- Helpers ---
  const getDaysInYear = (year: number) => {
    const days = [];
    const date = new Date(year, 0, 1);
    while (date.getFullYear() === year) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const days = useMemo(() => getDaysInYear(selectedYear), [selectedYear]);

  // Generate Weeks Data for Grid Layout (Column = Week, Row = Day)
  const weeks = useMemo(() => {
      const weeksArr: { date: Date | null }[][] = [];
      let currentWeek: { date: Date | null }[] = Array(7).fill(null);

      days.forEach(date => {
          const dayIndex = date.getDay(); // 0 (Sun) - 6 (Sat)
          currentWeek[dayIndex] = { date: new Date(date) }; // Clone date

          if (dayIndex === 6) {
              weeksArr.push(currentWeek);
              currentWeek = Array(7).fill(null);
          }
      });
      // Push last partial week
      if (currentWeek.some(d => d !== null)) {
          weeksArr.push(currentWeek);
      }
      return weeksArr;
  }, [days]);

  // Generate Month Labels
  const monthLabels = useMemo(() => {
      const labels: { label: string, weekIndex: number }[] = [];
      let lastMonth = -1;
      weeks.forEach((week, idx) => {
          const firstDay = week.find(d => d !== null);
          if (firstDay && firstDay.date && firstDay.date.getMonth() !== lastMonth) {
              lastMonth = firstDay.date.getMonth();
              labels.push({ label: `${lastMonth + 1}월`, weekIndex: idx });
          }
      });
      return labels;
  }, [weeks]);

  // --- Logic ---
  const toggleAttendance = (date: Date) => {
    if (selectedMemberId === 'all') {
        alert("개별 회원을 선택한 상태에서만 출석 수정이 가능합니다.");
        return;
    }

    const dateStr = date.toISOString().split('T')[0];
    
    setAttendanceRecords(prev => {
        const existingRecord = prev.find(r => r.date === dateStr);
        
        if (existingRecord) {
            // Toggle member in existing record
            const newMemberIds = existingRecord.memberIds.includes(selectedMemberId)
                ? existingRecord.memberIds.filter(id => id !== selectedMemberId)
                : [...existingRecord.memberIds, selectedMemberId];
            
            if (newMemberIds.length === 0) {
                return prev.filter(r => r.date !== dateStr); // Remove empty record
            }
            
            return prev.map(r => r.date === dateStr ? { ...r, memberIds: newMemberIds } : r);
        } else {
            // Create new record
            return [...prev, { date: dateStr, memberIds: [selectedMemberId] }];
        }
    });
  };

  const getAttendanceCount = (date: Date) => {
      const dateStr = date.toISOString().split('T')[0];
      const record = attendanceRecords.find(r => r.date === dateStr);
      if (!record) return 0;
      if (selectedMemberId === 'all') return record.memberIds.length;
      return record.memberIds.includes(selectedMemberId) ? 1 : 0;
  };

  // --- Stats Calculation ---
  const stats = useMemo(() => {
      const today = new Date();
      let totalDays = 0;
      let currentStreak = 0;
      let maxStreak = 0;
      let tempStreak = 0;
      
      const sortedDates = [...days].filter(d => d <= today); 

      sortedDates.forEach(d => {
          const count = getAttendanceCount(d);
          if (count > 0) {
              totalDays++;
              tempStreak++;
          } else {
              if (tempStreak > maxStreak) maxStreak = tempStreak;
              tempStreak = 0;
          }
      });
      if (tempStreak > maxStreak) maxStreak = tempStreak;
      
      let streakDate = new Date();
      // Simple streak check backwards
      while (streakDate.getFullYear() === selectedYear || (streakDate.getFullYear() > selectedYear && streakDate.getMonth()===0)) {
          // Boundary check for year mostly
          if (streakDate.getFullYear() < selectedYear) break;
          
          const count = getAttendanceCount(streakDate);
          // If today is not marked, don't count it as streak break yet if yesterday was marked?
          // Strict mode: streak breaks if today not marked (unless checking earlier in day).
          // Simplified:
          if (count > 0) {
              currentStreak++;
          } else if (streakDate.toDateString() !== new Date().toDateString()) {
              // If it's not today and count is 0, streak broken
              break;
          }
          streakDate.setDate(streakDate.getDate() - 1);
      }

      return { totalDays, maxStreak, currentStreak };
  }, [attendanceRecords, selectedMemberId, days, selectedYear]);

  // --- Color Scale ---
  const getColor = (count: number) => {
      if (count === 0) return 'bg-gray-100';
      if (selectedMemberId !== 'all') return 'bg-green-500'; // Individual is boolean (green)
      
      // Aggregate view colors
      if (count < 5) return 'bg-green-200';
      if (count < 10) return 'bg-green-400';
      if (count < 20) return 'bg-green-600';
      return 'bg-green-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="text-green-600"/>
            출석왕 히트맵
          </h2>
          <p className="text-sm text-gray-500">회원별 출석 현황을 잔디심기로 확인하고 관리합니다.</p>
        </div>
        <div className="flex gap-2 items-center">
            <ActionButtons targetId="attendance-content" fileName="해오름클럽_출석부" />
            <select 
                className="border p-2 rounded-lg text-sm bg-white shadow-sm"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
                <option value={2024}>2024년</option>
                <option value={2025}>2025년</option>
            </select>
        </div>
      </div>

      <div id="attendance-content" className="space-y-6">
        {/* Controls & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-2">회원 선택</label>
                <select 
                    className="w-full border p-2 rounded mb-6"
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                >
                    <option value="all">전체 회원 (종합)</option>
                    {members.map(m => (
                        <option key={m.id} value={m.id}>{m.name} ({m.rank})</option>
                    ))}
                </select>

                <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg flex items-center justify-between">
                        <div>
                            <p className="text-xs text-green-800 font-bold uppercase">Total Attendance</p>
                            <p className="text-2xl font-bold text-green-600">{stats.totalDays}일</p>
                        </div>
                        <Calendar className="w-8 h-8 text-green-200" />
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg flex items-center justify-between">
                        <div>
                            <p className="text-xs text-orange-800 font-bold uppercase">Longest Streak</p>
                            <p className="text-2xl font-bold text-orange-600">{stats.maxStreak}일 연속</p>
                        </div>
                        <Trophy className="w-8 h-8 text-orange-200" />
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
                        <div>
                            <p className="text-xs text-blue-800 font-bold uppercase">Current Streak</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.currentStreak}일</p>
                        </div>
                        <Flame className="w-8 h-8 text-blue-200" />
                    </div>
                </div>
            </div>

            {/* Heatmap Area */}
            <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="overflow-x-auto pb-2">
                    <div className="min-w-max">
                        {/* Month Labels */}
                        <div className="flex mb-2 text-xs text-gray-400 h-5 relative">
                            <div className="w-8"></div> {/* Spacer for day labels */}
                            <div className="relative flex-1 flex">
                                {monthLabels.map((m, i) => (
                                    <div 
                                        key={i} 
                                        className="absolute top-0 text-[11px]"
                                        style={{ left: `${m.weekIndex * 14}px` }} // 12px box + 2px gap = 14px per week
                                    >
                                        {m.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex">
                            {/* Day Labels (Sun, Mon...) */}
                            <div className="flex flex-col gap-[3px] mr-2 text-[10px] text-gray-400 pt-[1px] text-right w-6">
                                <div className="h-3 leading-3">일</div>
                                <div className="h-3 leading-3">월</div>
                                <div className="h-3 leading-3">화</div>
                                <div className="h-3 leading-3">수</div>
                                <div className="h-3 leading-3">목</div>
                                <div className="h-3 leading-3">금</div>
                                <div className="h-3 leading-3">토</div>
                            </div>

                            {/* Grid */}
                            <div className="flex gap-[2px]">
                                {weeks.map((week, wIdx) => (
                                    <div key={wIdx} className="flex flex-col gap-[2px]">
                                        {week.map((dayObj, dIdx) => {
                                            if (!dayObj) return <div key={dIdx} className="w-3 h-3" />; // Placeholder
                                            const date = dayObj.date!;
                                            const count = getAttendanceCount(date);
                                            const isToday = date.toDateString() === new Date().toDateString();
                                            
                                            return (
                                                <div
                                                    key={date.toISOString()}
                                                    onClick={() => toggleAttendance(date)}
                                                    onMouseEnter={() => setHoveredInfo({
                                                        dateStr: date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }),
                                                        count
                                                    })}
                                                    onMouseLeave={() => setHoveredInfo(null)}
                                                    className={`
                                                        w-3 h-3 rounded-[2px] cursor-pointer transition-colors
                                                        ${getColor(count)}
                                                        ${isToday ? 'ring-1 ring-red-500 z-10' : 'hover:ring-1 hover:ring-gray-400'}
                                                    `}
                                                />
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Bar */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-center items-center h-10 transition-all">
                    {hoveredInfo ? (
                        <div className="flex items-center gap-2 text-sm text-gray-800 animate-in fade-in slide-in-from-bottom-1 duration-200">
                            <span className="font-medium">{hoveredInfo.dateStr}</span>
                            <span className="text-gray-300">|</span>
                            {selectedMemberId === 'all' ? (
                                <span className={`font-bold ${hoveredInfo.count > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                    {hoveredInfo.count}명 출석
                                </span>
                            ) : (
                                <span className={`font-bold ${hoveredInfo.count > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                    {hoveredInfo.count > 0 ? '출석 완료 ✅' : '결석 ❌'}
                                </span>
                            )}
                        </div>
                    ) : (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                            💡 날짜 위에 마우스를 올리면 상세 정보가 표시됩니다. 클릭하여 수정하세요.
                        </span>
                    )}
                </div>

                <div className="mt-2 flex justify-end items-center gap-2 text-xs text-gray-400">
                    <span>Less</span>
                    <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
                    <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
                    <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
                    <div className="w-3 h-3 bg-green-800 rounded-sm"></div>
                    <span>More</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;