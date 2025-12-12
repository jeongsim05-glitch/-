import React, { useState } from 'react';
import { Member, LessonStatus } from '../types';
import { Calendar, UserCheck } from 'lucide-react';
import ActionButtons from './ActionButtons';

interface LessonsProps {
  members: Member[];
}

const Lessons: React.FC<LessonsProps> = ({ members }) => {
  const [selectedDay, setSelectedDay] = useState<string>('월');
  const [lessonStatuses, setLessonStatuses] = useState<Record<string, 'completed' | 'cancelled'>>({});
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const weekDays = ['월', '화', '수', '목', '금'];
  
  // Filter members for selected day
  const students = members.filter(m => m.lessonDays?.includes(selectedDay));

  const daysInMonth = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const toggleDateStatus = (day: number) => {
      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      setLessonStatuses(prev => {
          const current = prev[dateStr];
          if (current === 'completed') return { ...prev, [dateStr]: 'cancelled' };
          if (current === 'cancelled') {
              const next = {...prev};
              delete next[dateStr];
              return next;
          }
          return { ...prev, [dateStr]: 'completed' };
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-900">레슨 관리</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span> 진행</div>
                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span> 취소</div>
            </div>
        </div>
        <ActionButtons targetId="lessons-content" fileName="해오름클럽_레슨관리" />
      </div>

      <div id="lessons-content" className="bg-white p-4 rounded-xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Daily Students List */}
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-indigo-600"/>
                    요일별 수강 명단
                </h3>
                
                <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg">
                    {weekDays.map(day => (
                        <button 
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${selectedDay === day ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {day}
                        </button>
                    ))}
                </div>

                <div className="space-y-3">
                    {students.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-lg">
                            수강생이 없습니다.
                        </div>
                    ) : (
                        students.map(m => (
                            <div key={m.id} className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                                <div>
                                    <div className="font-bold text-indigo-900">{m.name}</div>
                                    <div className="text-xs text-indigo-500">{m.rank}조</div>
                                </div>
                                <span className="text-xs bg-white px-2 py-1 rounded text-gray-500 font-mono">
                                    {m.phone.slice(-4)}
                                </span>
                            </div>
                        ))
                    )}
                </div>
                <div className="mt-4 text-right text-xs text-gray-400">
                    총 {students.length}명
                </div>
            </div>

            {/* Right: Monthly Calendar */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-orange-600"/>
                        레슨 진행 일정표
                    </h3>
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-lg">
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth()-1)))}>&lt;</button>
                        <span className="font-bold">{currentMonth.getFullYear()}년 {currentMonth.getMonth()+1}월</span>
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth()+1)))}>&gt;</button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center text-sm">
                    {['일','월','화','수','목','금','토'].map(d => (
                        <div key={d} className="font-bold text-gray-400 py-2">{d}</div>
                    ))}
                    
                    {Array.from({length: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()}).map((_, i) => (
                        <div key={`empty-${i}`} className="h-24 bg-gray-50 rounded-lg"></div>
                    ))}

                    {Array.from({length: daysInMonth(currentMonth)}).map((_, i) => {
                        const day = i + 1;
                        const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                        const status = lessonStatuses[dateStr];
                        const weekDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).getDay();
                        const isWeekend = weekDay === 0 || weekDay === 6;

                        return (
                            <div 
                            key={day} 
                            onClick={() => !isWeekend && toggleDateStatus(day)}
                            className={`
                                h-24 rounded-lg border p-2 flex flex-col justify-between cursor-pointer transition-all
                                ${status === 'completed' ? 'bg-green-50 border-green-200' : 
                                    status === 'cancelled' ? 'bg-red-50 border-red-200' : 
                                    'hover:border-orange-300 border-gray-100'}
                                ${isWeekend ? 'bg-gray-100 opacity-50 cursor-default' : ''}
                            `}
                            >
                                <span className={`font-bold ${status ? 'text-gray-800' : 'text-gray-400'}`}>{day}</span>
                                {status === 'completed' && <span className="text-xs font-bold text-green-600 bg-white rounded py-1">진행</span>}
                                {status === 'cancelled' && <span className="text-xs font-bold text-red-500 bg-white rounded py-1">휴강</span>}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Lessons;