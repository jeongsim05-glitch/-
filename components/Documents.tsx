import React, { useState } from 'react';
import { Member, Expense, Notice, FinancialRecord, Donation } from '../types';
import ActionButtons from './ActionButtons';

interface DocumentsProps {
  members: Member[];
  expenses: Expense[];
  notices: Notice[];
  setNotices: React.Dispatch<React.SetStateAction<Notice[]>>;
  records: Record<string, FinancialRecord>;
  donations: Donation[];
  initialCarryover: number;
  monthlyFee: number;
  associateFee: number;
}

const Documents: React.FC<DocumentsProps> = ({ members, expenses, notices, setNotices, records, donations, initialCarryover, monthlyFee, associateFee }) => {
  const [reportType, setReportType] = useState<'cover' | 'business' | 'settlement' | 'totals' | 'balance' | 'unpaid' | 'meeting'>('cover');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const currentYear = parseInt(selectedMonth.split('-')[0]);

  // --- Calculations for Monthly Report ---
  const year = parseInt(selectedMonth.split('-')[0]);
  const month = parseInt(selectedMonth.split('-')[1]);
  
  const currentMonthExpenses = expenses.filter(e => e.date.startsWith(selectedMonth));
  const totalExpenseMonthly = currentMonthExpenses.reduce((acc, cur) => acc + cur.amount, 0);

  // Calculate Monthly Fees (Actual paid amount)
  let totalFeesMonthly = 0;
  Object.values(records).forEach((rec: FinancialRecord) => {
      if (rec.year === year && rec.payments[month]) {
          totalFeesMonthly += rec.payments[month]; // Use actual stored amount
      }
  });

  // Calculate Donations for this month
  const currentMonthDonations = donations.filter(d => d.date.startsWith(selectedMonth));
  const totalDonationAmount = currentMonthDonations.reduce((acc, cur) => acc + cur.amount, 0);

  // Calculate Previous Balance for Monthly Report
  // PrevBalance = Initial + (Income before this month) - (Expense before this month)
  // This is a simplified calculation assuming 'InitialCarryover' is the start of the year balance.
  let prevBalance = initialCarryover;
  
  // Add income/expense from start of year up to last month
  for (let m = 1; m < month; m++) {
      const monthStr = `${year}-${String(m).padStart(2, '0')}`;
      
      // Fees
      let monthlyFees = 0;
      Object.values(records).forEach((rec: FinancialRecord) => {
          if (rec.year === year && rec.payments[m]) {
              monthlyFees += rec.payments[m];
          }
      });
      prevBalance += monthlyFees;

      // Donations
      const monthlyDonations = donations
          .filter(d => d.date.startsWith(monthStr))
          .reduce((a, c) => a + c.amount, 0);
      prevBalance += monthlyDonations;

      // Expenses
      const monthlyExpenses = expenses
          .filter(e => e.date.startsWith(monthStr))
          .reduce((a, c) => a + c.amount, 0);
      prevBalance -= monthlyExpenses;
  }


  const totalIncomeMonthly = totalFeesMonthly + totalDonationAmount; // + other income
  const currentBalance = prevBalance + totalIncomeMonthly - totalExpenseMonthly;
  
  // --- Calculations for Annual Settlement Report ---
  // Fix: Cast Object.values results to correct types to prevent 'unknown' type errors
  const totalAnnualFees = (Object.values(records) as FinancialRecord[]).reduce((sum, rec) => {
     if (rec.year !== currentYear) return sum;
     // Sum all payments in the payment object
     const memberTotal = (Object.values(rec.payments) as number[]).reduce((a, b) => a + b, 0);
     return sum + memberTotal;
  }, 0);

  const totalAnnualDonations = donations
    .filter(d => d.date.startsWith(currentYear.toString()))
    .reduce((a, c) => a + c.amount, 0);
  
  const totalAnnualExpenses = expenses
    .filter(e => e.date.startsWith(currentYear.toString()))
    .reduce((a, c) => a + c.amount, 0);

  const totalAnnualIncome = initialCarryover + totalAnnualFees + totalAnnualDonations;
  const currentAnnualBalance = totalAnnualIncome - totalAnnualExpenses;

  // --- Helper: Check Join Date ---
  const isBeforeJoinDate = (member: Member, m: number, y: number) => {
      const joinDate = new Date(member.joinDate);
      if (joinDate.getFullYear() < y) return false;
      if (joinDate.getFullYear() > y) return true;
      return (joinDate.getMonth() + 1) > m; 
  };


  // --- Data for Notices ---
  const currentNotice = notices.find(n => n.month === selectedMonth) || {
     id: '', month: selectedMonth, agenda: '', events: '', nextSchedule: ''
  };

  const handleNoticeChange = (field: keyof Notice, value: string) => {
    setNotices(prev => {
       const existing = prev.find(n => n.month === selectedMonth);
       if (existing) {
          return prev.map(n => n.month === selectedMonth ? { ...n, [field]: value } : n);
       } else {
          return [...prev, { 
             id: Date.now().toString(), 
             month: selectedMonth, 
             agenda: '', 
             events: '', 
             nextSchedule: '', 
             [field]: value 
          } as Notice];
       }
    });
  };

  // --- Helper for Annual Totals ---
  // Ensure we have standard categories even if no data exists
  const defaultCategories = ["체육관사용료", "경조사비", "월례회의", "비품구입비", "협회비", "자체행사", "상품(상패)", "대회관련", "임원회의", "단체복", "기타"];
  const usedCategories = Array.from(new Set(expenses.map(e => e.category)));
  const expenseCategories = Array.from(new Set([...defaultCategories, ...usedCategories]));
  const months = Array.from({length: 12}, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">문서 및 보고서 생성</h2>
          <div className="flex flex-wrap items-center gap-2 mt-2">
             <input 
               type="month" 
               value={selectedMonth} 
               onChange={(e) => setSelectedMonth(e.target.value)}
               className="border p-1 rounded"
             />
             <select 
                value={reportType} 
                onChange={(e) => setReportType(e.target.value as any)}
                className="border p-1 rounded min-w-[200px]"
             >
                <option value="cover">연간 결산서 (표지)</option>
                <option value="business">사업결과보고서</option>
                <option value="settlement">결산내역 (Summary)</option>
                <option value="totals">과목별 합계 (Detail)</option>
                <option value="balance">잔액 증빙 내역</option>
                <option value="unpaid">미납 회비 내역</option>
                <option value="meeting">월례회의 자료</option>
             </select>
          </div>
        </div>
        <ActionButtons targetId="documents-content" fileName={`해오름클럽_${reportType}`} />
      </div>

      {/* Editor Section (No Print) - Only for Meeting */}
      {reportType === 'meeting' && (
         <div className="no-print bg-white p-4 rounded-xl shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
               <label className="text-sm font-bold">안건 (Club Operation)</label>
               <textarea 
                  className="w-full border rounded p-2 text-sm h-24" 
                  value={currentNotice.agenda}
                  onChange={(e) => handleNoticeChange('agenda', e.target.value)}
                  placeholder="예: 임원 선거 결과 발표, 게임 콕 지정..."
               />
            </div>
            <div className="space-y-1">
               <label className="text-sm font-bold">행사/대회 (Events)</label>
               <textarea 
                  className="w-full border rounded p-2 text-sm h-24" 
                  value={currentNotice.events}
                  onChange={(e) => handleNoticeChange('events', e.target.value)}
                  placeholder="예: 보령시 승강제 대회 (11/18)..."
               />
            </div>
            <div className="space-y-1">
               <label className="text-sm font-bold">다음 일정 / 레슨</label>
               <textarea 
                  className="w-full border rounded p-2 text-sm h-24" 
                  value={currentNotice.nextSchedule}
                  onChange={(e) => handleNoticeChange('nextSchedule', e.target.value)}
                  placeholder="예: 매주 월-목 레슨..."
               />
            </div>
         </div>
      )}

      {/* PREVIEW SECTION (Print Area) */}
      <div id="documents-content" className="print-area bg-white p-8 shadow-lg min-h-[297mm] mx-auto w-[210mm] text-black">
         
         {/* --- 1. COVER PAGE --- */}
         {reportType === 'cover' && (
            <div className="flex flex-col items-center justify-center h-full border-4 border-double border-gray-800 p-10">
               <h1 className="text-4xl font-serif font-bold mb-20">{currentYear}년도 해오름클럽</h1>
               <div className="text-6xl font-serif font-bold mb-32 p-10 border-4 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                  결  산  서
               </div>
               
               <div className="w-full max-w-2xl border border-black mb-20">
                  <div className="flex border-b border-black">
                     <div className="flex-1 p-3 text-center bg-gray-100 font-bold border-r border-black">결재</div>
                     <div className="flex-1 p-3 text-center bg-gray-100 font-bold border-r border-black">재무이사</div>
                     <div className="flex-1 p-3 text-center bg-gray-100 font-bold border-r border-black">사무국장</div>
                     <div className="flex-1 p-3 text-center bg-gray-100 font-bold">회 장</div>
                  </div>
                  <div className="flex h-32">
                     <div className="flex-1 border-r border-black"></div>
                     <div className="flex-1 border-r border-black"></div>
                     <div className="flex-1 border-r border-black"></div>
                     <div className="flex-1"></div>
                  </div>
               </div>

               <h2 className="text-3xl font-bold">해오름배드민턴클럽</h2>
            </div>
         )}

         {/* --- 2. BUSINESS RESULTS REPORT --- */}
         {reportType === 'business' && (
             <div>
                <div className="border-2 border-black rounded-lg p-2 mb-8 inline-block mx-auto w-full text-center">
                    <h1 className="text-3xl font-bold font-serif">{currentYear}년도 사업결과보고서</h1>
                </div>

                <table className="w-full border-collapse border-t-2 border-b-2 border-black">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border-b border-black py-2 w-32 text-center">일 자</th>
                            <th className="border-b border-black py-2 text-center">사 업 내 용</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-300">
                        {/* Mocking Business Events from Notices/Donations/Matches */}
                        {donations.length > 0 ? (
                           donations.map((d, idx) => (
                              <tr key={idx}>
                                  <td className="py-4 text-center align-top">{d.date}</td>
                                  <td className="py-4 px-4 align-top">
                                      <div className="font-bold">○ {d.eventName}</div>
                                      <div className="pl-4 text-sm">- 찬조: {d.donorName} ({d.amount > 0 ? `${d.amount.toLocaleString()}원` : d.item})</div>
                                  </td>
                              </tr>
                           ))
                        ) : (
                           <tr><td colSpan={2} className="text-center py-10">등록된 사업 내용이 없습니다.</td></tr>
                        )}
                        {/* Static Example Row */}
                        <tr>
                            <td className="py-4 text-center align-top">{currentYear}-12-31</td>
                            <td className="py-4 px-4 align-top">
                                <div className="font-bold">○ {currentYear}년도 정기총회</div>
                                <div className="pl-4 text-sm">- 장소: 전용 체육관</div>
                                <div className="pl-4 text-sm">- 내용: 결산 보고 및 차기 임원 선출</div>
                            </td>
                        </tr>
                    </tbody>
                </table>
             </div>
         )}

         {/* --- 3. SETTLEMENT REPORT (Summary) --- */}
         {reportType === 'settlement' && (
             <div>
                 <div className="flex items-center gap-2 mb-4">
                     <span className="text-xl">◇</span>
                     <h1 className="text-2xl font-bold">{currentYear}년 결산내역 ({new Date().toISOString().split('T')[0]} 현재)</h1>
                 </div>
                 
                 {/* Top Summary Table */}
                 <div className="mb-8">
                     <table className="w-full border-collapse border-2 border-black text-center">
                         <thead>
                             <tr className="border-b border-black font-bold bg-gray-50">
                                 <th className="py-2 border-r border-black">수 입 총 액</th>
                                 <th className="py-2 border-r border-black">지 출 총 액</th>
                                 <th className="py-2 border-r border-black">현 잔 액</th>
                                 <th className="py-2">비 고</th>
                             </tr>
                         </thead>
                         <tbody>
                             <tr className="font-bold text-lg">
                                 <td className="py-3 border-r border-black">{totalAnnualIncome.toLocaleString()}</td>
                                 <td className="py-3 border-r border-black">{totalAnnualExpenses.toLocaleString()}</td>
                                 <td className="py-3 border-r border-black">{currentAnnualBalance.toLocaleString()}</td>
                                 <td></td>
                             </tr>
                         </tbody>
                     </table>
                     <div className="text-right text-sm mt-1">(단위 : 원)</div>
                 </div>

                 {/* Income Detail */}
                 <h3 className="font-bold text-lg mb-2 border-l-4 border-black pl-2">【수입내역】</h3>
                 <table className="w-full border-collapse border-t-2 border-black mb-8">
                     <thead>
                         <tr className="border-b border-black text-center bg-gray-50">
                             <th className="py-1 w-1/4">구 분</th>
                             <th className="py-1 w-1/4">금 액</th>
                             <th className="py-1">비 고</th>
                         </tr>
                     </thead>
                     <tbody className="text-sm divide-y divide-gray-300 border-b-2 border-black">
                         <tr>
                             <td className="text-center py-1">전 년 이 월</td>
                             <td className="text-right pr-8 py-1">{initialCarryover.toLocaleString()}</td>
                             <td className="pl-2 py-1">{currentYear-1}년도 이월금</td>
                         </tr>
                         <tr>
                             <td className="text-center py-1">회 비</td>
                             <td className="text-right pr-8 py-1">{totalAnnualFees.toLocaleString()}</td>
                             <td className="pl-2 py-1">정회원/준회원 회비</td>
                         </tr>
                         <tr>
                             <td className="text-center py-1">찬 조 금</td>
                             <td className="text-right pr-8 py-1">{totalAnnualDonations.toLocaleString()}</td>
                             <td className="pl-2 py-1">각종 대회 및 행사 찬조</td>
                         </tr>
                         <tr className="bg-gray-100 font-bold">
                             <td className="text-center py-1">계</td>
                             <td className="text-right pr-8 py-1">{totalAnnualIncome.toLocaleString()}</td>
                             <td></td>
                         </tr>
                     </tbody>
                 </table>

                 {/* Expense Detail */}
                 <h3 className="font-bold text-lg mb-2 border-l-4 border-black pl-2">【지출내역】</h3>
                 <table className="w-full border-collapse border-t-2 border-black">
                     <thead>
                         <tr className="border-b border-black text-center bg-gray-50">
                             <th className="py-1 w-1/4">구 분</th>
                             <th className="py-1 w-1/4">금 액</th>
                             <th className="py-1">비 고</th>
                         </tr>
                     </thead>
                     <tbody className="text-sm divide-y divide-gray-300 border-b-2 border-black">
                         {expenseCategories.map(cat => {
                             const subTotal = expenses.filter(e => e.category === cat && e.date.startsWith(currentYear.toString())).reduce((a,c) => a + c.amount, 0);
                             return (
                                 <tr key={cat}>
                                     <td className="text-center py-1">{cat}</td>
                                     <td className="text-right pr-8 py-1">{subTotal.toLocaleString()}</td>
                                     <td className="pl-2 py-1"></td>
                                 </tr>
                             );
                         })}
                         <tr className="bg-gray-100 font-bold">
                             <td className="text-center py-1">계</td>
                             <td className="text-right pr-8 py-1">{totalAnnualExpenses.toLocaleString()}</td>
                             <td></td>
                         </tr>
                     </tbody>
                 </table>
                 <div className="text-right text-sm mt-1">(단위 : 원)</div>
             </div>
         )}

         {/* --- 4. CATEGORY TOTALS (Matrix) --- */}
         {reportType === 'totals' && (
             <div>
                 <h1 className="text-2xl font-bold mb-6">항목별 세부내역 (과목합계)</h1>
                 <table className="w-full text-xs border-collapse border border-black">
                     <thead>
                         <tr className="bg-gray-100 text-center">
                             <th className="border border-black p-1 w-24">항목별</th>
                             {months.map(m => <th key={m} className="border border-black p-1">{m}월</th>)}
                             <th className="border border-black p-1 w-20">합계</th>
                         </tr>
                     </thead>
                     <tbody>
                         {expenseCategories.map(cat => {
                             const rowTotal = expenses.filter(e => e.category === cat && e.date.startsWith(currentYear.toString())).reduce((a,c) => a + c.amount, 0);
                             return (
                                 <tr key={cat}>
                                     <td className="border border-black p-1 font-bold bg-gray-50">{cat}</td>
                                     {months.map(m => {
                                         const monthStr = `${currentYear}-${String(m).padStart(2,'0')}`;
                                         const val = expenses.filter(e => e.category === cat && e.date.startsWith(monthStr)).reduce((a,c) => a + c.amount, 0);
                                         return (
                                             <td key={m} className="border border-black p-1 text-right">
                                                 {val > 0 ? val.toLocaleString() : '-'}
                                             </td>
                                         );
                                     })}
                                     <td className="border border-black p-1 text-right font-bold bg-gray-50">{rowTotal.toLocaleString()}</td>
                                 </tr>
                             )
                         })}
                         {/* Total Row */}
                         <tr className="bg-gray-200 font-bold border-t-2 border-black">
                             <td className="border border-black p-1 text-center">월 계</td>
                             {months.map(m => {
                                 const monthStr = `${currentYear}-${String(m).padStart(2,'0')}`;
                                 const val = expenses.filter(e => e.date.startsWith(monthStr)).reduce((a,c) => a + c.amount, 0);
                                 return (
                                     <td key={m} className="border border-black p-1 text-right">
                                         {val > 0 ? val.toLocaleString() : '-'}
                                     </td>
                                 );
                             })}
                             <td className="border border-black p-1 text-right">
                                 {totalAnnualExpenses.toLocaleString()}
                             </td>
                         </tr>
                     </tbody>
                 </table>
             </div>
         )}

         {/* --- 5. BALANCE PROOF --- */}
         {reportType === 'balance' && (
             <div className="flex flex-col items-center justify-center h-full pt-20">
                 <div className="text-left w-full mb-10">
                     <h2 className="text-xl font-bold">{currentYear}년도 해오름클럽</h2>
                 </div>
                 
                 <div className="border-4 border-black rounded-3xl p-16 mb-20 shadow-lg text-center w-full max-w-3xl">
                     <h1 className="text-5xl font-serif font-bold tracking-widest mb-4">잔 액 증 빙 내 역</h1>
                 </div>

                 <div className="text-center space-y-12">
                     <div className="text-3xl text-gray-700">
                         {currentYear}년 {new Date().getMonth()+1}월 {new Date().getDate()}일
                     </div>
                     <div className="text-5xl font-bold border-b-2 border-black pb-4 inline-block px-10">
                         잔 액 : {currentAnnualBalance.toLocaleString()}원
                     </div>
                 </div>
             </div>
         )}

         {/* --- 6. UNPAID FEES --- */}
         {reportType === 'unpaid' && (
             <div>
                 <div className="text-center border border-black rounded-lg p-3 mb-8 w-1/2 mx-auto">
                     <h1 className="text-2xl font-serif font-bold">미 납 회 비 내 역</h1>
                 </div>

                 <div className="mb-4 font-bold">
                     미납 총액: {members.reduce((acc, member) => {
                         const rec = records[member.id];
                         const fee = member.memberType === '준회원' ? associateFee : monthlyFee;
                         
                         // Calculate unpaid months considering join date
                         const unpaidCount = months.filter(m => {
                             if (isBeforeJoinDate(member, m, currentYear)) return false; // Exclude pre-join months
                             if (!rec) return true; // No record = all unpaid
                             return !rec.payments[m] && !rec.exemptMonths.includes(m);
                         }).length;
                         
                         return acc + (unpaidCount * fee);
                     }, 0).toLocaleString()}원 (추정)
                 </div>

                 <table className="w-full text-xs border-collapse border border-black text-center">
                     <thead>
                         <tr className="bg-cyan-200 font-bold">
                             <th className="border border-black p-1 w-16">연번</th>
                             <th className="border border-black p-1 w-20">성 명</th>
                             {months.map(m => <th key={m} className="border border-black p-1">{m}월</th>)}
                             <th className="border border-black p-1 w-20">미납합계</th>
                             <th className="border border-black p-1">비고</th>
                         </tr>
                     </thead>
                     <tbody>
                         {members.map((member, idx) => {
                             const rec = records[member.id] || { memberId: member.id, year: currentYear, payments: {}, exemptMonths: [] };
                             
                             const fee = member.memberType === '준회원' ? associateFee : monthlyFee;
                             
                             const unpaidMonths = months.filter(m => {
                                 if (isBeforeJoinDate(member, m, currentYear)) return false;
                                 return !rec.payments[m] && !rec.exemptMonths.includes(m);
                             });
                             
                             const unpaidSum = unpaidMonths.length * fee;

                             if (unpaidSum === 0) return null;

                             return (
                                 <tr key={member.id}>
                                     <td className="border border-black p-1">{idx + 1}</td>
                                     <td className="border border-black p-1 font-bold">{member.name}</td>
                                     {months.map(m => {
                                         const isPaid = !!rec.payments[m];
                                         const isExempt = rec.exemptMonths.includes(m);
                                         const isBefore = isBeforeJoinDate(member, m, currentYear);
                                         
                                         if (isBefore) return <td key={m} className="border border-black p-1 bg-gray-200">-</td>;

                                         return (
                                             <td key={m} className={`border border-black p-1 ${!isPaid && !isExempt ? 'text-red-600 font-bold bg-yellow-50' : ''}`}>
                                                 {isPaid ? '' : isExempt ? '면제' : fee.toLocaleString()}
                                             </td>
                                         )
                                     })}
                                     <td className="border border-black p-1 font-bold">{unpaidSum.toLocaleString()}</td>
                                     <td className="border border-black p-1">{member.notes}</td>
                                 </tr>
                             );
                         })}
                     </tbody>
                 </table>
             </div>
         )}

         {/* --- 7. MONTHLY MEETING REPORT --- */}
         {reportType === 'meeting' && (
            <div>
               <h1 className="text-3xl font-bold text-center mb-8">{month}월 월례회의</h1>
               <div className="flex justify-between mb-4 text-sm">
                  <span>일시: {selectedMonth}-17 오후 8시</span>
                  <span>장소: 전용 체육관</span>
               </div>
               
               <table className="w-full border-collapse border border-black mb-8">
                  <thead>
                     <tr className="bg-gray-100">
                        <th className="border border-black p-2 w-1/4">안건</th>
                        <th className="border border-black p-2">내 용</th>
                     </tr>
                  </thead>
                  <tbody>
                     <tr>
                        <td className="border border-black p-3 align-top font-bold">클럽 운영</td>
                        <td className="border border-black p-3 whitespace-pre-line text-sm">{currentNotice.agenda || '내용 없음'}</td>
                     </tr>
                     <tr>
                        <td className="border border-black p-3 align-top font-bold">회원 동향</td>
                        <td className="border border-black p-3 text-sm">
                           * 신규 가입: {members.filter(m => m.joinDate.startsWith(selectedMonth)).map(m => `${m.name}(${m.rank})`).join(', ') || '없음'}
                        </td>
                     </tr>
                     <tr>
                        <td className="border border-black p-3 align-top font-bold">행사 / 대회</td>
                        <td className="border border-black p-3 whitespace-pre-line text-sm">{currentNotice.events || '내용 없음'}</td>
                     </tr>
                     <tr>
                        <td className="border border-black p-3 align-top font-bold">공지 / 일정</td>
                        <td className="border border-black p-3 whitespace-pre-line text-sm">{currentNotice.nextSchedule || '내용 없음'}</td>
                     </tr>
                     <tr>
                        <td className="border border-black p-3 align-top font-bold">재무 보고</td>
                        <td className="border border-black p-3 text-sm">
                           {/* Monthly Financials Table */}
                           <div className="flex border-t border-black mt-2">
                               <div className="w-1/2 border-r border-black">
                                   <div className="bg-gray-100 font-bold text-center border-b border-black">수 입</div>
                                   <div className="p-2">
                                       <div className="flex justify-between"><span>전월이월</span><span>{prevBalance.toLocaleString()}</span></div>
                                       <div className="flex justify-between"><span>회비</span><span>{totalFeesMonthly.toLocaleString()}</span></div>
                                       <div className="flex justify-between text-blue-600"><span>찬조금</span><span>{totalDonationAmount.toLocaleString()}</span></div>
                                       {/* List Donations */}
                                       {currentMonthDonations.length > 0 && (
                                           <div className="text-xs text-gray-500 pl-2 mt-1 border-t border-dashed pt-1">
                                               {currentMonthDonations.map(d => (
                                                   <div key={d.id}>- {d.donorName}: {d.amount > 0 ? d.amount.toLocaleString() : d.item}</div>
                                               ))}
                                           </div>
                                       )}
                                       <div className="flex justify-between font-bold border-t mt-1 pt-1 bg-yellow-50"><span>계</span><span>{totalIncomeMonthly.toLocaleString()}</span></div>
                                   </div>
                               </div>
                               <div className="w-1/2">
                                   <div className="bg-gray-100 font-bold text-center border-b border-black">지 출</div>
                                   <div className="p-2">
                                       {currentMonthExpenses.map(e => (
                                           <div key={e.id} className="flex justify-between text-xs"><span>{e.category}</span><span>{e.amount.toLocaleString()}</span></div>
                                       ))}
                                       <div className="flex justify-between font-bold border-t mt-auto pt-1 bg-yellow-50"><span>계</span><span>{totalExpenseMonthly.toLocaleString()}</span></div>
                                   </div>
                               </div>
                           </div>
                           <div className="text-right font-bold mt-2 text-lg border-t-2 border-black pt-1">
                               현 잔 액 : {currentBalance.toLocaleString()}원
                           </div>
                        </td>
                     </tr>
                  </tbody>
               </table>
               <div className="text-center mt-12">
                  <p className="text-2xl font-serif font-bold">해오름배드민턴클럽</p>
               </div>
            </div>
         )}

      </div>
    </div>
  );
};

export default Documents;