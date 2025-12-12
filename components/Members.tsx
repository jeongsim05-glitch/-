import React, { useState } from 'react';
import { Member, Rank } from '../types';
import { Upload, Plus, Search, Trash2, Edit2, X } from 'lucide-react';
import ActionButtons from './ActionButtons';

interface MembersProps {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
}

const Members: React.FC<MembersProps> = ({ members, setMembers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const emptyMember: Member = {
    id: '',
    name: '',
    rank: Rank.BEGINNER,
    position: '회원',
    memberType: '정회원', // Default
    joinDate: new Date().toISOString().split('T')[0],
    tenure: '0년',
    phone: '',
    email: '',
    address: '',
    job: '',
    notes: '',
    isSickLeave: false,
    isFamilyMember: false,
    isCoupleMember: false,
    gender: 'M',
    accountNumber: '',
    topSize: '',
    bottomSize: '',
    lessonDays: []
  };

  const [formData, setFormData] = useState<Member>(emptyMember);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split('\n').slice(1); // Skip header
      const newMembers: Member[] = rows.filter(row => row.trim() !== '').map((row, index) => {
        const cols = row.split(',');
        // Simple CSV parse mapping
        return {
          ...emptyMember,
          id: `imported-${Date.now()}-${index}`,
          name: cols[0]?.trim() || 'Unknown',
          rank: (cols[1]?.trim() as Rank) || Rank.BEGINNER,
          phone: cols[2]?.trim() || '',
          gender: cols[3]?.trim() === '여' ? 'F' : 'M'
        };
      });
      setMembers(prev => [...prev, ...newMembers]);
      alert(`${newMembers.length}명의 회원이 추가되었습니다.`);
    };
    reader.readAsText(file); // Default UTF-8
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setMembers(prev => prev.map(m => m.id === editingId ? { ...formData, id: editingId } : m));
    } else {
      setMembers(prev => [...prev, { ...formData, id: Date.now().toString() }]);
    }
    setShowModal(false);
    setEditingId(null);
    setFormData(emptyMember);
  };

  const startEdit = (member: Member) => {
    setFormData(member);
    setEditingId(member.id);
    setShowModal(true);
  };

  const deleteMember = (id: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      setMembers(prev => prev.filter(m => m.id !== id));
    }
  };

  const toggleLessonDay = (day: string) => {
    const current = formData.lessonDays || [];
    if (current.includes(day)) {
        setFormData({ ...formData, lessonDays: current.filter(d => d !== day) });
    } else {
        setFormData({ ...formData, lessonDays: [...current, day] });
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.includes(searchTerm) || m.phone.includes(searchTerm)
  );

  const sizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
  const weekDays = ['월', '화', '수', '목', '금'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">회원 관리 명부</h2>
          <p className="text-sm text-gray-500">총 회원수: {members.length}명</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
           <ActionButtons targetId="members-content" fileName="해오름클럽_회원명부" />
           <label className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer text-sm">
            <Upload className="w-4 h-4" />
            <span className="hidden md:inline">엑셀/CSV 업로드</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>
          <button 
            onClick={() => { setFormData(emptyMember); setEditingId(null); setShowModal(true); }}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">신규 등록</span>
          </button>
        </div>
      </div>

      <div id="members-content" className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative mb-4 no-print">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="이름 또는 전화번호 검색..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 font-medium">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">이름</th>
                <th className="px-4 py-3">구분</th>
                <th className="px-4 py-3">급수</th>
                <th className="px-4 py-3">성별</th>
                <th className="px-4 py-3">직책</th>
                <th className="px-4 py-3">전화번호</th>
                <th className="px-4 py-3 hidden md:table-cell">계좌번호</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">레슨</th>
                <th className="px-4 py-3 rounded-tr-lg text-right no-print">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMembers.map(member => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{member.name}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${member.memberType === '정회원' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                       {member.memberType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`
                      px-2 py-1 rounded text-xs font-bold
                      ${member.rank === Rank.A ? 'bg-red-100 text-red-700' : 
                        member.rank === Rank.BEGINNER ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}
                    `}>
                      {member.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3">{member.gender === 'M' ? '남' : '여'}</td>
                  <td className="px-4 py-3">{member.position}</td>
                  <td className="px-4 py-3 text-gray-500">{member.phone}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{member.accountNumber || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {member.isSickLeave && <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">병가</span>}
                      {member.isCoupleMember && <span className="px-1.5 py-0.5 bg-pink-100 text-pink-800 text-xs rounded">부부</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                      {member.lessonDays && member.lessonDays.length > 0 ? (
                          <div className="flex gap-1">
                              {member.lessonDays.map(d => (
                                  <span key={d} className="w-5 h-5 flex items-center justify-center bg-blue-100 text-blue-700 text-xs rounded-full">{d}</span>
                              ))}
                          </div>
                      ) : <span className="text-gray-300">-</span>}
                  </td>
                  <td className="px-4 py-3 text-right no-print">
                    <button onClick={() => startEdit(member)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4"/></button>
                    <button onClick={() => deleteMember(member.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold">{editingId ? '회원 정보 수정' : '신규 회원 등록'}</h3>
              <button onClick={() => setShowModal(false)}><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">이름</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-2 rounded" />
              </div>
              <div className="space-y-1">
                 <label className="text-sm font-medium text-gray-700">회원 구분</label>
                 <select value={formData.memberType} onChange={e => setFormData({...formData, memberType: e.target.value as '정회원' | '준회원'})} className="w-full border p-2 rounded bg-indigo-50 border-indigo-200">
                    <option value="정회원">정회원</option>
                    <option value="준회원">준회원</option>
                 </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">급수</label>
                <select value={formData.rank} onChange={e => setFormData({...formData, rank: e.target.value as Rank})} className="w-full border p-2 rounded">
                  {Object.values(Rank).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">성별</label>
                <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as 'M'|'F'})} className="w-full border p-2 rounded">
                  <option value="M">남성</option>
                  <option value="F">여성</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">전화번호</label>
                <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border p-2 rounded" />
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">계좌번호</label>
                <input type="text" placeholder="은행 계좌번호 입력" value={formData.accountNumber || ''} onChange={e => setFormData({...formData, accountNumber: e.target.value})} className="w-full border p-2 rounded" />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                 <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">상의 사이즈</label>
                    <select value={formData.topSize || ''} onChange={e => setFormData({...formData, topSize: e.target.value})} className="w-full border p-2 rounded">
                      <option value="">선택</option>
                      {sizes.map(s => <option key={`top-${s}`} value={s}>{s}</option>)}
                    </select>
                 </div>
                 <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">하의 사이즈</label>
                    <select value={formData.bottomSize || ''} onChange={e => setFormData({...formData, bottomSize: e.target.value})} className="w-full border p-2 rounded">
                      <option value="">선택</option>
                      {sizes.map(s => <option key={`bot-${s}`} value={s}>{s}</option>)}
                    </select>
                 </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">직책</label>
                <input type="text" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className="w-full border p-2 rounded" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">가입일</label>
                <input type="date" value={formData.joinDate} onChange={e => setFormData({...formData, joinDate: e.target.value})} className="w-full border p-2 rounded" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">주소</label>
                <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full border p-2 rounded" />
              </div>
              
              <div className="col-span-1 md:col-span-2 space-y-2 bg-blue-50 p-3 rounded">
                  <label className="text-sm font-bold text-blue-900">레슨 요일 선택</label>
                  <div className="flex gap-4">
                      {weekDays.map(day => (
                          <label key={day} className="flex items-center gap-1 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={formData.lessonDays?.includes(day) || false}
                                onChange={() => toggleLessonDay(day)}
                                className="rounded text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm">{day}</span>
                          </label>
                      ))}
                  </div>
              </div>

              <div className="col-span-1 md:col-span-2 grid grid-cols-3 gap-4 bg-gray-50 p-3 rounded">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.isSickLeave} onChange={e => setFormData({...formData, isSickLeave: e.target.checked})} />
                  <span className="text-sm">병가 중</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.isFamilyMember} onChange={e => setFormData({...formData, isFamilyMember: e.target.checked})} />
                  <span className="text-sm">가족 회원</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.isCoupleMember} onChange={e => setFormData({...formData, isCoupleMember: e.target.checked})} />
                  <span className="text-sm">부부 회원</span>
                </label>
              </div>

              <div className="col-span-1 md:col-span-2 pt-4">
                <button type="submit" className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 font-medium">저장하기</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;