import React, { useState, useMemo } from 'react';
import { Member, FinancialRecord, Expense, Donation } from '../types';
import { DollarSign, CheckSquare, TrendingUp, AlertCircle, Settings, X, Plus, Trash2, Camera, FileSpreadsheet, Download, AlertTriangle } from 'lucide-react';
import { parseReceipt } from '../services/geminiService';
import ActionButtons from './ActionButtons';

interface FinancialsProps {
  members: Member[];
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  records: Record<string, FinancialRecord>;
  setRecords: React.Dispatch<React.SetStateAction<Record<string, FinancialRecord>>>;
  donations: Donation[];
  setDonations: React.Dispatch<React.SetStateAction<Donation[]>>;
  monthlyFee: number;
  setMonthlyFee: React.Dispatch<React.SetStateAction<number>>;
  associateFee: number;
  setAssociateFee: React.Dispatch<React.SetStateAction<number>>;
  initialCarryover: number;
  setInitialCarryover: React.Dispatch<React.SetStateAction<number>>;
}

const Financials: React.FC<FinancialsProps> = ({ 
    members, expenses, setExpenses, records, setRecords, 
    donations, setDonations, 
    monthlyFee, setMonthlyFee,
    associateFee, setAssociateFee,
    initialCarryover, setInitialCarryover
}) => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [activeTab, setActiveTab] = useState<'income' | 'expense' | 'donation'>('income');
  const [showSettings, setShowSettings] = useState(false);
  const [loadingReceipt, setLoadingReceipt] = useState(false);
  
  // Custom Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Expense Form State
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    description: '',
    category: '기타'
  });

  // Donation Form State
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [newDonation, setNewDonation] = useState<Partial<Donation>>({
    date: new Date().toISOString().split('T')[0],
    eventName: '',
    donorName: '',
    amount: 0,
    item: ''
  });

  // --- Helpers ---
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const expenseCategories = ["체육관사용료", "경조사비", "월례회의", "비품구입비", "협회비", "자체행사", "상품(상패)", "대회관련", "임원회의", "단체복", "기타"];

  const getRecord = (memberId: string): FinancialRecord => {
    if (!records[memberId]) {
      return { memberId, year, payments: {}, exemptMonths: [] };
    }
    return records[memberId];
  };

  const getMemberFee = (member: Member) => {
      return member.memberType === '준회원' ? associateFee : monthlyFee;
  };

  const isBeforeJoinDate = (member: Member, month: number, currentYear: number) => {
      const joinDate = new Date(member.joinDate);
      if (joinDate.getFullYear() < currentYear) return false;
      if (joinDate.getFullYear() > currentYear) return true; 
      return (joinDate.getMonth() + 1) > month; 
  };

  // --- Calculations for Summary ---
  const stats = useMemo(() => {
    let totalIncome = 0;
    let totalUnpaid = 0;
    const monthlyIncome: number[] = Array(13).fill(0); // Index 1-12

    members.forEach(member => {
        const rec = getRecord(member.id);
        const fee = getMemberFee(member);

        // Paid Calculation
        Object.entries(rec.payments).forEach(([mStr, value]) => {
            const amount = value as number;
            const m = parseInt(mStr);
            if (m >= 1 && m <= 12) {
                totalIncome += amount;
                monthlyIncome[m] += amount;
            }
        });

        // Unpaid Calculation
        months.forEach(m => {
            const isBefore = isBeforeJoinDate(member, m, year);
            if (!isBefore && !rec.payments[m] && !rec.exemptMonths.includes(m)) {
                totalUnpaid += fee;
            }
        });
    });

    return { totalIncome, totalUnpaid, monthlyIncome };
  }, [members, records, year, monthlyFee, associateFee]);


  // --- Event Handlers ---

  const togglePayment = (memberId: string, month: number) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;
    
    const fee = getMemberFee(member);

    setRecords(prev => {
      const record = prev[memberId] || { memberId, year, payments: {}, exemptMonths: [] };
      const newPayments = { ...record.payments };
      if (newPayments[month]) delete newPayments[month];
      else newPayments[month] = fee; 
      return { ...prev, [memberId]: { ...record, payments: newPayments } };
    });
  };

  const toggleExempt = (memberId: string, month: number) => {
    setRecords(prev => {
        const record = prev[memberId] || { memberId, year, payments: {}, exemptMonths: [] };
        const newExempts = record.exemptMonths.includes(month) 
            ? record.exemptMonths.filter(m => m !== month)
            : [...record.exemptMonths, month];
        const newPayments = { ...record.payments };
        if (newExempts.includes(month)) delete newPayments[month];
        return { ...prev, [memberId]: { ...record, exemptMonths: newExempts, payments: newPayments } };
    });
  };

  const payAll = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;
    const fee = getMemberFee(member);

    setRecords(prev => {
        const record = prev[memberId] || { memberId, year, payments: {}, exemptMonths: [] };
        const newPayments = { ...record.payments };
        for (let i = 1; i <= 12; i++) {
            if (!isBeforeJoinDate(member, i, year) && !record.exemptMonths.includes(i)) {
                newPayments[i] = fee;
            }
        }
        return { ...prev, [memberId]: { ...record, payments: newPayments } };
    });
  };

  // --- Excel Export Handler ---
  const handleDownloadExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // Add BOM for Korean support
    let filename = "";

    if (activeTab === 'income') {
        filename = `해오름클럽_회비수입_${year}년.csv`;
        // Header
        const header = ["이름", "구분", ...months.map(m => `${m}월`), "총납부액", "미납액"].join(",");
        csvContent += header + "\n";
        
        // Rows
        members.forEach(member => {
            const rec = getRecord(member.id);
            const fee = getMemberFee(member);
            const row = [member.name, member.memberType];
            
            let paidSum = 0;
            let unpaidSum = 0;

            months.forEach(m => {
                const paid = rec.payments[m];
                if (paid) {
                    row.push(String(paid));
                    paidSum += paid;
                } else if (rec.exemptMonths.includes(m)) {
                    row.push("면제");
                } else if (isBeforeJoinDate(member, m, year)) {
                    row.push("-");
                } else {
                    row.push("미납");
                    unpaidSum += fee;
                }
            });
            row.push(String(paidSum));
            row.push(String(unpaidSum));
            csvContent += row.join(",") + "\n";
        });

    } else if (activeTab === 'expense') {
        filename = `해오름클럽_지출내역_${year}년.csv`;
        csvContent += "날짜,항목,내용,금액\n";
        expenses.forEach(exp => {
            csvContent += `${exp.date},${exp.category},"${exp.description.replace(/"/g, '""')}",${exp.amount}\n`;
        });

    } else if (activeTab === 'donation') {
        filename = `해오름클럽_찬조내역_${year}년.csv`;
        csvContent += "날짜,행사명,찬조자,금액/물품\n";
        donations.forEach(don => {
            const amountStr = don.amount > 0 ? don.amount : don.item;
            csvContent += `${don.date},"${don.eventName.replace(/"/g, '""')}",${don.donorName},"${amountStr}"\n`;
        });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Expense Handlers ---
  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingReceipt(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
        const base64 = reader.result as string;
        try {
            const data = await parseReceipt(base64.split(',')[1]);
            setNewExpense(prev => ({
                ...prev,
                date: data.date || prev.date,
                amount: data.amount || prev.amount,
                description: data.description || prev.description,
                category: data.category || prev.category
            }));
            alert("영수증 분석이 완료되었습니다. 내용을 확인해주세요.");
        } catch (err) {
            alert("영수증 분석에 실패했습니다. 직접 입력해주세요.");
        } finally {
            setLoadingReceipt(false);
        }
    };
  };

  const saveExpense = () => {
      if (!newExpense.description || newExpense.description.trim() === '') {
          alert("지출 내용을 입력해주세요.");
          return;
      }
      
      const expenseToAdd: Expense = {
          id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          date: newExpense.date || new Date().toISOString().split('T')[0],
          amount: Number(newExpense.amount) || 0,
          description: newExpense.description || '',
          category: newExpense.category || '기타',
          receiptUrl: newExpense.receiptUrl
      };

      setExpenses(prev => [...prev, expenseToAdd]);
      setShowExpenseModal(false);
      setNewExpense({ date: new Date().toISOString().split('T')[0], amount: 0, description: '', category: '기타' });
  };

  const deleteExpense = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setConfirmModal({
        isOpen: true,
        title: '지출 내역 삭제',
        message: '정말 이 지출 내역을 삭제하시겠습니까?',
        onConfirm: () => {
          setExpenses(prev => prev.filter(e => e.id !== id));
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      });
  };

  // --- Donation Handlers ---
  const saveDonation = () => {
      if (!newDonation.donorName || (!newDonation.amount && !newDonation.item)) {
          alert("기부자와 금액(또는 물품)을 입력해주세요.");
          return;
      }
      setDonations(prev => [...prev, { ...newDonation, id: `don-${Date.now()}` } as Donation]);
      setShowDonationModal(false);
      setNewDonation({ date: new Date().toISOString().split('T')[0], eventName: '', donorName: '', amount: 0, item: '' });
  };

  const deleteDonation = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setConfirmModal({
        isOpen: true,
        title: '찬조 내역 삭제',
        message: '정말 이 찬조 내역을 삭제하시겠습니까?',
        onConfirm: () => {
          setDonations(prev => prev.filter(d => d.id !== id));
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      });
  };


  return (
    <div className="space-y-6">
      {/* Custom Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 bg-red-50 border-b border-red-100 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="font-bold text-lg text-red-800">{confirmModal.title}</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700">{confirmModal.message}</p>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end gap-2">
              <button 
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium"
              >
                취소
              </button>
              <button 
                onClick={confirmModal.onConfirm}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-bold"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">재무 관리</h2>
          <div className="flex items-center gap-4 mt-2">
            <button 
              onClick={() => setActiveTab('income')}
              className={`pb-1 border-b-2 font-medium transition-colors ${activeTab === 'income' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-400'}`}
            >
              회비 수입
            </button>
            <button 
              onClick={() => setActiveTab('expense')}
              className={`pb-1 border-b-2 font-medium transition-colors ${activeTab === 'expense' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-400'}`}
            >
              지출/영수증
            </button>
            <button 
              onClick={() => setActiveTab('donation')}
              className={`pb-1 border-b-2 font-medium transition-colors ${activeTab === 'donation' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-400'}`}
            >
              찬조금 관리
            </button>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
             <button 
                onClick={handleDownloadExcel}
                className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm transition-colors"
                title="현재 탭의 데이터를 엑셀(CSV)로 다운로드합니다"
            >
                <Download className="w-4 h-4" />
                <span>엑셀 다운로드</span>
            </button>
             <a 
                href="https://docs.google.com/spreadsheets/u/1/d/1t-ivTuXVCjD7Dm3rnsYOW1ylFQDyOe-Ij7iNT4jrgOM/edit?usp=drive_fs" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm transition-colors"
            >
                <FileSpreadsheet className="w-4 h-4" />
                <span>시트 열기</span>
            </a>
            <button 
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-700 text-white rounded hover:bg-slate-800 text-sm transition-colors"
            >
                <Settings className="w-4 h-4" />
                <span>설정</span>
            </button>
            <ActionButtons targetId="financials-content" fileName={`재무관리_${activeTab}`} />
        </div>
      </div>

      <div id="financials-content" className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 min-h-[500px]">
      {activeTab === 'income' && (
        <div className="space-y-4">
          {/* Summary Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
               <div>
                  <p className="text-xs text-gray-500 font-bold mb-1">총 운영 예산 (이월+수입)</p>
                  <p className="text-2xl font-bold text-blue-600">{(initialCarryover + stats.totalIncome).toLocaleString()}원</p>
                  <p className="text-xs text-gray-400">전년 이월: {initialCarryover.toLocaleString()}</p>
               </div>
               <div className="bg-blue-50 p-3 rounded-full"><DollarSign className="w-6 h-6 text-blue-500"/></div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
               <div>
                  <p className="text-xs text-gray-500 font-bold mb-1">금년 회비 수입</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalIncome.toLocaleString()}원</p>
               </div>
               <div className="bg-green-50 p-3 rounded-full"><TrendingUp className="w-6 h-6 text-green-500"/></div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
               <div>
                  <p className="text-xs text-gray-500 font-bold mb-1">총 미납 회비</p>
                  <p className="text-2xl font-bold text-red-500">{stats.totalUnpaid.toLocaleString()}원</p>
               </div>
               <div className="bg-red-50 p-3 rounded-full"><AlertCircle className="w-6 h-6 text-red-500"/></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 gap-4">
              <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                      <button onClick={() => setYear(year - 1)} className="px-2 hover:bg-white rounded">&lt;</button>
                      <span className="font-bold text-gray-800">{year}년</span>
                      <button onClick={() => setYear(year + 1)} className="px-2 hover:bg-white rounded">&gt;</button>
                  </div>
              </div>
              
              <div className="flex gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1"><span className="w-3 h-3 bg-green-50 border border-green-200 block"></span>완납</div>
                <div className="flex items-center gap-1"><span className="w-3 h-3 bg-red-50 border border-red-200 block"></span>미납</div>
                <div className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-100 border border-gray-300 block"></span>면제</div>
                <div className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-200 border border-gray-300 block"></span>가입전</div>
            </div>
            </div>
            
            <div className="overflow-x-auto h-[600px] overflow-y-auto relative">
              <table className="w-full text-xs md:text-sm text-center border-collapse relative">
                <thead className="sticky top-0 z-20 shadow-md">
                  <tr className="bg-slate-800 text-white">
                    <th className="p-3 sticky left-0 bg-slate-800 z-30 w-24">이름</th>
                    <th className="p-3 w-16">구분</th>
                    <th className="p-3 w-14">일괄</th>
                    {months.map(m => <th key={m} className="p-3 min-w-[50px]">{m}월</th>)}
                    <th className="p-3 bg-blue-900 border-l border-blue-700">수입액</th>
                    <th className="p-3 bg-red-900 border-l border-red-700">미납액</th>
                  </tr>
                  
                  <tr className="bg-blue-50 border-b-2 border-slate-300 font-bold text-blue-900">
                    <td className="p-2 sticky left-0 bg-blue-50 z-30 border-r border-slate-200">월계</td>
                    <td colSpan={2} className="p-2 text-right text-xs text-gray-500 border-r border-slate-200">월별 합계 →</td>
                    {months.map(m => (
                      <td key={m} className="p-2 border-r border-slate-200 text-xs">
                        {stats.monthlyIncome[m] > 0 ? stats.monthlyIncome[m].toLocaleString() : '-'}
                      </td>
                    ))}
                    <td className="p-2 bg-blue-100 border-l border-blue-200 text-blue-900">{stats.totalIncome.toLocaleString()}</td>
                    <td className="p-2 bg-red-100 border-l border-red-200 text-red-900">{stats.totalUnpaid.toLocaleString()}</td>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {members.map(member => {
                    const rec = getRecord(member.id);
                    const memberFee = getMemberFee(member);
                    
                    const unpaidCount = months.filter(m => {
                        if (isBeforeJoinDate(member, m, year)) return false; 
                        return !rec.payments[m] && !rec.exemptMonths.includes(m);
                    }).length;
                    const unpaidAmount = unpaidCount * memberFee;
                    const paidAmountTotal = (Object.values(rec.payments) as number[]).reduce((a, b) => a + b, 0);

                    return (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="p-3 font-bold text-gray-900 sticky left-0 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                          {member.name}
                        </td>
                        <td className="p-3 text-gray-500 text-xs">{member.memberType}</td>
                        <td className="p-3">
                            <button onClick={() => payAll(member.id)} className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                                <CheckSquare className="w-4 h-4 mx-auto"/>
                            </button>
                        </td>
                        {months.map(m => {
                          const paidAmount = rec.payments[m];
                          const isPaid = !!paidAmount;
                          const isExempt = rec.exemptMonths.includes(m);
                          const isBeforeJoin = isBeforeJoinDate(member, m, year);
                          
                          if (isBeforeJoin) {
                              return <td key={m} className="p-1 bg-gray-200 border-l border-white text-gray-300">-</td>;
                          }

                          return (
                            <td 
                                key={m} 
                                className={`p-1 border-l border-gray-100 cursor-pointer transition-colors ${
                                    isPaid ? 'bg-green-50' : isExempt ? 'bg-gray-100' : 'bg-red-50'
                                }`}
                                onClick={(e) => {
                                    if (e.shiftKey) toggleExempt(member.id, m);
                                    else togglePayment(member.id, m);
                                }}
                                title="클릭: 납부/취소, Shift+클릭: 면제"
                            >
                                {isPaid ? (
                                    <div className="flex flex-col items-center">
                                      <div className="w-2 h-2 rounded-full bg-green-500 mb-0.5"></div>
                                      <span className="text-[10px] text-gray-400 font-mono">{paidAmount >= 10000 ? (paidAmount/10000).toFixed(1)+'만' : paidAmount}</span>
                                    </div>
                                ) : isExempt ? (
                                    <span className="text-gray-400 text-xs">면제</span>
                                ) : (
                                    <span className="text-red-300">-</span>
                                )}
                            </td>
                          );
                        })}
                        <td className="p-3 font-bold text-blue-700 bg-blue-50 border-l border-blue-100">
                           {paidAmountTotal > 0 ? paidAmountTotal.toLocaleString() : '-'}
                        </td>
                        <td className="p-3 font-bold text-red-600 bg-red-50 border-l border-red-100">
                            {unpaidAmount > 0 ? unpaidAmount.toLocaleString() : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'expense' && (
          <div className="space-y-4">
              <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">지출 내역 목록</h3>
                  <button 
                    onClick={() => setShowExpenseModal(true)}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                      <Plus className="w-4 h-4"/> 지출 등록
                  </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-700">
                          <tr>
                              <th className="p-3">날짜</th>
                              <th className="p-3">항목 (Category)</th>
                              <th className="p-3">내용</th>
                              <th className="p-3 text-right">금액</th>
                              <th className="p-3 text-center">관리</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y">
                          {expenses.length === 0 ? (
                              <tr><td colSpan={5} className="p-6 text-center text-gray-400">등록된 지출 내역이 없습니다.</td></tr>
                          ) : (
                              expenses.sort((a,b) => b.date.localeCompare(a.date)).map(exp => (
                                  <tr key={exp.id} className="hover:bg-gray-50">
                                      <td className="p-3">{exp.date}</td>
                                      <td className="p-3"><span className="px-2 py-1 bg-gray-100 rounded text-xs">{exp.category}</span></td>
                                      <td className="p-3">{exp.description}</td>
                                      <td className="p-3 text-right font-bold text-red-600">-{exp.amount.toLocaleString()}</td>
                                      <td className="p-3 text-center">
                                          <button type="button" onClick={(e) => deleteExpense(exp.id, e)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                                      </td>
                                  </tr>
                              ))
                          )}
                          <tr className="bg-red-50 font-bold border-t-2 border-red-100">
                              <td colSpan={3} className="p-3 text-center">총 지출 합계</td>
                              <td className="p-3 text-right text-red-700">-{expenses.reduce((a,c) => a + c.amount, 0).toLocaleString()}</td>
                              <td></td>
                          </tr>
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {activeTab === 'donation' && (
          <div className="space-y-4">
              <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">찬조금(물품) 내역</h3>
                  <button 
                    onClick={() => setShowDonationModal(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                      <Plus className="w-4 h-4"/> 찬조 등록
                  </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-700">
                          <tr>
                              <th className="p-3">날짜</th>
                              <th className="p-3">행사명</th>
                              <th className="p-3">찬조자</th>
                              <th className="p-3 text-right">금액/물품</th>
                              <th className="p-3 text-center">관리</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y">
                          {donations.length === 0 ? (
                              <tr><td colSpan={5} className="p-6 text-center text-gray-400">등록된 찬조 내역이 없습니다.</td></tr>
                          ) : (
                              donations.sort((a,b) => b.date.localeCompare(a.date)).map(don => (
                                  <tr key={don.id} className="hover:bg-gray-50">
                                      <td className="p-3">{don.date}</td>
                                      <td className="p-3 font-medium">{don.eventName}</td>
                                      <td className="p-3">{don.donorName}</td>
                                      <td className="p-3 text-right font-bold text-blue-600">
                                          {don.amount > 0 ? `+${don.amount.toLocaleString()}` : don.item}
                                      </td>
                                      <td className="p-3 text-center">
                                          <button type="button" onClick={(e) => deleteDonation(don.id, e)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                                      </td>
                                  </tr>
                              ))
                          )}
                           <tr className="bg-blue-50 font-bold border-t-2 border-blue-100">
                              <td colSpan={3} className="p-3 text-center">총 찬조금 합계 (물품 제외)</td>
                              <td className="p-3 text-right text-blue-700">+{donations.reduce((a,c) => a + c.amount, 0).toLocaleString()}</td>
                              <td></td>
                          </tr>
                      </tbody>
                  </table>
              </div>
          </div>
      )}
      </div>

      {/* Expense Modal */}
      {showExpenseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg">지출 내역 등록</h3>
                      <button onClick={() => setShowExpenseModal(false)}><X className="w-5 h-5"/></button>
                  </div>
                  
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <label className="flex items-center gap-2 cursor-pointer text-blue-700 font-bold text-sm justify-center">
                          <Camera className="w-5 h-5"/>
                          {loadingReceipt ? "영수증 분석 중..." : "영수증 사진으로 자동 입력 (AI)"}
                          <input type="file" accept="image/*" onChange={handleReceiptUpload} className="hidden" disabled={loadingReceipt}/>
                      </label>
                  </div>

                  <div className="space-y-3">
                      <div>
                          <label className="block text-sm font-medium mb-1">날짜</label>
                          <input type="date" value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})} className="w-full border p-2 rounded"/>
                      </div>
                      <div>
                          <label className="block text-sm font-medium mb-1">항목</label>
                          <select value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})} className="w-full border p-2 rounded">
                              {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                      </div>
                      <div>
                          <label className="block text-sm font-medium mb-1">금액</label>
                          <input type="number" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})} className="w-full border p-2 rounded" placeholder="숫자만 입력"/>
                      </div>
                      <div>
                          <label className="block text-sm font-medium mb-1">내용 (사용처)</label>
                          <input type="text" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} className="w-full border p-2 rounded" placeholder="예: 이마트 (음료 구입)" autoFocus/>
                      </div>
                      <button onClick={saveExpense} className="w-full bg-red-600 text-white py-2 rounded font-bold hover:bg-red-700 mt-2">
                          저장하기
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Donation Modal */}
      {showDonationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg">찬조 내역 등록</h3>
                      <button onClick={() => setShowDonationModal(false)}><X className="w-5 h-5"/></button>
                  </div>
                  <div className="space-y-3">
                      <div>
                          <label className="block text-sm font-medium mb-1">날짜</label>
                          <input type="date" value={newDonation.date} onChange={e => setNewDonation({...newDonation, date: e.target.value})} className="w-full border p-2 rounded"/>
                      </div>
                      <div>
                          <label className="block text-sm font-medium mb-1">행사명</label>
                          <input type="text" value={newDonation.eventName} onChange={e => setNewDonation({...newDonation, eventName: e.target.value})} className="w-full border p-2 rounded" placeholder="예: 3월 월례회의"/>
                      </div>
                      <div>
                          <label className="block text-sm font-medium mb-1">찬조자</label>
                          <input type="text" value={newDonation.donorName} onChange={e => setNewDonation({...newDonation, donorName: e.target.value})} className="w-full border p-2 rounded"/>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-sm font-medium mb-1">현금 (원)</label>
                            <input type="number" value={newDonation.amount} onChange={e => setNewDonation({...newDonation, amount: Number(e.target.value), item: ''})} className="w-full border p-2 rounded" placeholder="0"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">또는 물품</label>
                            <input type="text" value={newDonation.item} onChange={e => setNewDonation({...newDonation, item: e.target.value, amount: 0})} className="w-full border p-2 rounded" placeholder="예: 라켓 1점"/>
                        </div>
                      </div>
                      
                      <button onClick={saveDonation} className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 mt-2">
                          저장하기
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
              <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg">재무 환경 설정</h3>
                      <button onClick={() => setShowSettings(false)}><X className="w-5 h-5"/></button>
                  </div>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">월 정회원 회비</label>
                          <input type="number" value={monthlyFee} onChange={(e) => setMonthlyFee(Number(e.target.value))} className="w-full border rounded p-2" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">월 준회원 회비</label>
                          <input type="number" value={associateFee} onChange={(e) => setAssociateFee(Number(e.target.value))} className="w-full border rounded p-2" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">전년도 이월금</label>
                          <input type="number" value={initialCarryover} onChange={(e) => setInitialCarryover(Number(e.target.value))} className="w-full border rounded p-2" />
                      </div>
                      <button onClick={() => setShowSettings(false)} className="w-full bg-slate-800 text-white py-2 rounded font-bold mt-2">저장</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Financials;