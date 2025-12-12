import React, { useState } from 'react';
import { Scale, Edit3 } from 'lucide-react';
import ActionButtons from './ActionButtons';

interface BylawArticle {
  id: string;
  title: string;
  content: string;
  isModified?: boolean;
  originalContent?: string;
}

const initialBylaws: BylawArticle[] = [
  { id: '1', title: '제1조 (목적)', content: '본 회칙은 배드민턴 발전에 공헌하며 저변 확대 및 활성화에 기여 한다\n활동을 통하여 체력을 단련하고 심신을 연마하여 회원 상호간 화합 ,단결,\n친목을 도모하며 타 시,도간 폭 넓은 교류를 기하여 지역사회 발전의 목적으로\n한다' },
  { id: '2', title: '제2조 (명칭)', content: '본 클럽의 명칭은 “해오름 배드민턴” 이라 한다' },
  { id: '3', title: '제3조 (사무소)', content: '본 클럽의 사무소는 대천 중학교 체육관에 두며 기타장소로 이전할 수 있다' },
  { id: '4', title: '제4조 (운영비)', content: '본 클럽의 운영비(회비)는 클럽 총회의 결의에 따라 징수한다' },
  { id: '5', title: '제5조 (운영범위)', content: '본 클럽은 생활체육 보령시 배드민턴 협회 (또는 그 상위기관)에 소속하며 각종 대회 및 행사에 참여하는 등의 활동을 할 수 있고, 이 경우 이에 따른 제반 사항을 준수한다.' },
  { id: '6', title: '제6조 (회원자격, 가입 및 상실, 보류)', content: '1. 본 클럽의 회원은 보령시민으로서 배드민턴 생활체육에 취미를 갖는 자로 본 클럽의 목적과 취지를 찬동하는 자로서 이사회에서 가입이 결정된 자를 정회원으로 한다. (이하 ‘회원’으로 칭함)\n  가. 보령시 실거주자 또는 주민등록이 되어 있는 자\n  나. 정회원외 준회원을 둘 수 있으며, 가입비를 제외한 월 회비를 납부하여야 하며, 가입 기간을 1년 이내로 한다.\n2. 본 클럽을 탈퇴 또는 제명된 사람이 재가입을 희망할 경우 이사회의 결의에 따라 재가입할 수 있으며 가입된 경우 신입회원과 같이 가입비를 납부하여야 한다.\n3. 일신상의 문제 (임신. 출산. 질병. 사고. 직장 장기파견-3개월 이상) 로 이사회의 사전 동의를 구한 자(이하 ‘보류회원’으로 칭함)는 자격을 유지 시켜준다.\n4. 3개월 이상 회비 미납된 자는 통보 후 자동 탈퇴되며 재가입 시 이사회에서 가입을 결정할 수 있다. (횟수는 1회로 제한한다.)\n5. 시 관내 타 클럽에서 탈퇴하고 본 클럽 정회원으로 가입하고자 할 때 이사회의 결의를 거쳐 가입 할 수 있으며, 신입회원과 동일하게 가입비와 회비를 납부 하여야 한다.' },
  { id: '7', title: '제7조 (회원의 권리)', content: '1. 임원의 선거권 및 피선거권\n2. 클럽의 할당된 물자의 배분\n3. 공동시설의 이용 및 모든 행사 참여권\n4. 준회원에게는 공동시설의 이용 및 모든 행사참여권만 부여한다.' },
  { id: '8', title: '제8조 (회원의 의무)', content: '1. 제 법규 및 정관 제 규정의 이행과 기타 지시사항 준수.\n  가. 회원 상호간 인격을 존중하며 본회 회원으로서의 품위를 유지 하여야 한다.\n  나. 체육관 내 청결을 유지하며 기물의 훼손을 방지한다.\n2. 클럽회비 및 총회 또는 이사회의 의결에 의한 제반회비 납부.\n3. 총회 및 이사회의 의결사항 준수.\n4. 각종 행사 및 대회 참여시 특별회비를 징수 할 수 있다.' },
  { id: '9', title: '제9조 (회원 및 임원의 제재)', content: '1. 본 클럽의 명예에 상당한 누를 끼친 회원은 1차 서면경고 후 이사회의 결정으로 제명 처리 한다\n2. 의결된 월례 회비를 3개월 이상 연속으로 미납된 회원은 구두통보 후 이사회의 결의를 거쳐 제명처리 한다.\n3. 임원, 이사로서 정당한 클럽 운영에 비협조적 이거나 맡은바 본분을 다하지 못하며 클럽에 누를 끼치는 자는 아래와 같은 절차에 따라 그 직위를 해임할 수 있다.\n  가. 회장 : 재적회원의1/2 이상이 참석한 총회에서 참석인원 2/3이상이 가결\n  나. 임원 및 이사 : 재적회원의 과반 수 이상이 참석한 총회에서 참석인원의 1/2 이상의 가결' },
  { id: '10', title: '제10조 (회의의 구성)', content: '총회는 본 클럽의 회원으로 구성 한다' },
  { id: '11', title: '제11조 (회의의 구분과 소집)', content: '1. 정기총회, 임시총회, 이사회, 월례회로 구분한다.\n2. 정기총회는 매년12월에 소집하고 임시총회는 회장이 소집하거나 재적 임원. 이사 1/2이상 또는 재적회원 1/3 이상의 요구가 있을 시 회장이 소집한다.\n3. 월례회는 매월 세번째 월요일 실시하고 정기 이사회는 매월 월례회 이전에 실시하고 필요사유가 발생하였을 경우에 회장이나 재적 임원. 이사의 1/3 이상의 요구로 회장이 소집하여야 한다.\n(단 ,정기 총회 및 월례회 일시는 사정에 따라 변동할 수 있다.)' },
  { id: '12', title: '제12조 (의사 정족수)', content: '1. 회의는 재적인원 1/3 이상의 참석과 참석인원 과반 수 이상 찬성으로 의결한다. 단, 회칙수정과 임원의 제재 의결은 예외로 한다.\n2. 의장은 표결권을 가지며 가부 동수일 경우 결정권을 가진다.' },
  { id: '13', title: '제13조 (의결사항)', content: '1. 임원선출.\n2. 운영규칙 제정 및 변경.\n3. 예산 및 결산의 승인.\n4. 정관 수정은 재적 회원 과반수 참석과 참석인원 2/3이상 결의로 의결 한다.' },
  { id: '14', title: '제14조 (기구)', content: '본 클럽은 다음과 같은 기구를 둔다.\n1. 회 장 : 1명\n2. 자 문 의 원 : 역임 전 회장\n3. 감 사 : 2명\n4. 부 회 장 : 1명\n5. 여 성 부 회 장 : 1명\n6. 사 무 국 장 : 1명\n7. 홍 보 이 사 : 1명\n8. 재 무 이 사 : 1명\n9. 관 리 이 사 : 1명\n10. 경 기 이 사 : 1명\n(단 회장이 클럽운영상 필요시 이사를 추가 임명할 수 있다.)' },
  { id: '15', title: '제15조 (임원, 이사의 자격, 선출, 임기)', content: '1. 구성\n  가. 임 원 : 회장 1명, 감사 2명, 부회장 2명\n  나. 사무국장 : 회장이 임명한 자\n  다. 이 사 : 회장이 임명한 자\n  라. 자문 위 원 : 직전 회장\n2. 자격\n  임원의 자격은 회원 중에서 덕망이 높고 본 클럽을 위하여 봉사할 수 있는 자라야 한다.\n3. 선출\n  가. 회장, 감사, 부회장은 총회에서 회원이 직선으로 선출하고 임기는 2년으로 하며, 1회 연임할 수 있다.\n  나. 자문위원은 역임 전 회장으로 당연직으로 한다,\n  다. 사무국장은 회장이 임명한다.\n  라. 이사는 회장이 임명한다.\n  마. 임원의 임기 중 결원이 발생하였을 때는 규정에 의하여 선출하여야 하며, 그 임원의 임기는 잔여 임기로 한다.( 단, 잔여 임기가 3개월 이하인 경우 선출 및 임명하지 않을 수도 있다.)\n  바. 선출직 임원은 회원의 과반 수 이상의 찬성으로 연임할 수 있다.' },
  { id: '16', title: '제16조 (임무)', content: '1. 회장은 클럽을 대표하며 모든 회의의 의장이 된다.\n2. 자문의원 은 회장의 요청 시 본회에 주요사항을 자문 한다.\n3. 감사는 클럽의 회계 및 업무처리 상태에 대해 연1회 감사를 실시하고 모든 회의에 출석하여 발언할 수 있으며 의결권은 없다.\n4. 부회장은 회장을 보좌하며 주요업무를 관장하고 회장 유고시에는 회장의 직무를 대행한다.\n5. 사무국장은 임원단을 보좌하며 클럽 모든 제반 업무를 관장한다.\n6. 재무이사, 홍보이사는 서로 협력하여 클럽 내 재정 및 모든 행사에 전반적 도움을 준다.\n7, 경기이사는 대회, 행사 업무를 담당 관리하며 각종 대회 시 회원의 출전 관리 운영에 기여한다.\n8, 관리이사는 체육관 및 대외 시설물 관리를 담당 한다.\n9. 각 회장 및 이사는 신입회원에 대하여 교육 및 원활한 적응을 위해 최선의 노력을 다한다.\n10. 회장은 선출된 후 이사회의 승인을 얻어 차기 월례회에서 1년 사업계획과 예산안을 수립하여 발표한다.' },
  { id: '17', title: '제17조 (이사회의 소집 및 구성)', content: '1. 이사회의 구성은 회장, 부회장, 여성부회장, 사무국장, 홍보이사, 재무이사, 관리이사, 경기이사 로 구성한다.\n2. 이사회는 회장이 소집하며 회장은 이사회의 의장이 된다.\n3. 회장이 클럽 운영상 자문 필요시 추가 운영 할 수 있다' },
  { id: '18', title: '제18조 (의결사항)', content: '1. 총회에서 위임된 사항.\n2. 총회소집 및 부의 안건.\n3. 운영계획 수립\n4. 코치의 영입 및 레슨비 안건\n5. 기타 필요하다고 인정되는 사항.' },
  { id: '19', title: '제19조 (자산)', content: '본 클럽의 자산은 다음과 같다.\n1. 클럽에 속하는 설비 및 기타 물건.\n2. 보조 또는 클럽에 의한 재산.\n3. 자산에서 늘어나는 수입.\n4. 사용료 및 수수료.' },
  { id: '20', title: '제20조 (수지예산)', content: '본 클럽의 일체의 수입을 세입으로 하고 일체의 지출을 세출로 하며 경우에 따라서 선 지출 후 보고 할 수도 있다.\n1. 회장은 클럽의 운영상황 및 수지결산을 정기총회에 보고한다.\n2. 감사는 세무 행정의 이상 유무를 정기총회에서 보고한다.' },
  { id: '21', title: '제21조 (회비)', content: '1. 본 클럽의 운영비를 조성하기 위하여 매월 월례회비는 총회 결의안 (현 월 30,000원)을 납부하며, 매년 1월에 지출되는 클럽별 회원 협회비를 클럽에서 지출한다. 또한, 총회의 결정에 따라 특별회비를 거출 할 수 있다.\n2. 회원의 특별한 사유가 발생하여 사유서를 제출하였을 경우 그 기간 동안 (최소3개월 이상) 월례 회비를 면제 받을 수 있다. (단, 연납 회원의 경우 납입기간을 연장한다.)\n3. 매년 1월에 1년분을 선납할 경우 1개월분의 회비를 면제해 준다\n4. 납입기간을 연장 받은 회원이 차기년도 연납을 원할 경우 잔여기간에 대한 회비를 일할 계산하여 납부 한다. (단, 이경우도 1월에 납부해야 한다.)\n5. 회장, 사무국장, 재무이사는 회비를 면제한다.\n6. 회원자격을 취득한 가족 회원은 월 회비를 감면한다. (인당 5천원 할인)' },
  { id: '22', title: '제22조 (회원의 가입금)', content: '본 클럽에 가입코자 하는 사람은 가입금 10만원을 선 납부하여야 한다. 단, 이사회를 통하여 회원증원을 위해 한시적으로 가입금을 변동 할 수 있다.' },
  { id: '23', title: '제23조 (회비 지출)', content: '모든 임원은 무보수로 일하며 필요한 경우 소요되는 경비를 클럽 운영비에서 지출키로 한다.' },
  { id: '24', title: '제24조 (업무)', content: '본 클럽의 업무는 다음과 같이 한정한다.\n1. 본 클럽의 운영과 회원관리 및 자산관리.\n2. 본 클럽의 행정 회계 및 결산사항의 처리.\n3. 회비징수 및 기타 부과금 징수 또한 협회 회비 납부.\n4. 본 클럽 회원의 자율적 행사지원 및 기타 필요하다고 인정되는 업무.' },
  { id: '25', title: '제25조 (회계 연도)', content: '본 클럽의 회계연도는 매년 1월 1일부터 12월 31일 까지로 한다.' },
  { id: '26', title: '제26조 (문서의 비치)', content: '본 클럽 회원에 관계되는 문서 또는 부책 장부를 비치하여야 한다.\n1. 회원명부\n2. 문서 수발부\n3. 금전 출납부(영구 보관토록 한다)\n4. 물품 대장\n5. 직인 관리\n6. 기타 필요한 문서 및 부책' },
  { id: '27', title: '제27조 (회원 및 기타 애경사)', content: '본 클럽은 회원의 애경사 시 클럽 명으로 경조비를 지출 한다.\n1. 본 클럽 회원의 직계 존속에 한하여 애경사시 본 클럽 명의로 10만원상당의 물품이나 현금으로 지출한다.\n2. 애경사시는 전 회원에게 연락하여야 한다.' },
  { id: '28', title: '제28조 (대외 활동)', content: '1. 각 가맹단체 및 타 협회에는 본 클럽이나 회장 앞으로 초청장이 왔을 경우에는 본 클럽의 운영비에서 지출키로 하고, 지출금액은 경우에 따라 다를 수 있다.\n2. 보령시 협회 이사로 . 회장. 사무국장은 협회 비를 (현재 1인당 10 만원) 클럽에서 지원한다.' },
  { id: '29', title: '제29조 (분할금 제재)', content: '본 클럽을 자의로 탈퇴하거나 제명당한 사람은 분할금을 요구할 수 없으며 지불하지 않는다.' },
  { id: '30', title: '제30조 (체육관 임대)', content: '체육관이 5일 이상 휴관할 경우 타 시설을 임대하여 사용할 수 있다.' },
  { id: '31', title: '제31조 (레슨관리 규정)', content: '1. 레슨의 운영\n  가. 레슨일은 주 2회이며, 1명단 시간은 10 ~ 15분으로 한다.\n  나. 주당 레슨일은 주 화, 목, 월 반복 운영하며, 클럽 및 코치의 사정에 따라 변동될 수 있다.\n  다. 학교 및 클럽 사정에 의한 레슨 부재가 발생 할 경우 코치의견에 존중한다\n2. 코치의 역할\n  가. 코치는 본 클럽 회원의 실력 향상을 위하여 최선의 노력을 다하여야 한다.\n  나. 코치는 본 클럽의 운영에 관여할 수 없다. 단, 레슨과 관련된 필요한 운영은 본 클럽의 이사회를 통하여 변경될 수 있다.\n3. 코치의 해임 및 선임, 사직\n  가. 코치의 해임 및 선임의 결정권은 본 클럽에 있으며, 결정된 사항에 대하여 따라야 한다.\n  나. 코치의 해임은 최소한 아래 항목이 발생할 경우 본 클럽 이사회에 따라 결정된다.\n    1) 코치로 인한 클럽 회원 간의 갈등이 발생 할 경우\n    2) 코치의 역할을 충실이 이행하지 않을 경우\n    3) 클럽운영의 관여 시\n    4) 기타 필요하다고 인정되는 경우\n  다. 개인 사정으로 인한 사직의 경우 최소 1개월 이전에 본 클럽에 통보하여야 한다.' },
  { id: 'addenda', title: '[시행]', content: '1. 본 회칙은 2025년 01월 01일부터 시행한다.' },
];

const Bylaws: React.FC = () => {
  const [bylaws, setBylaws] = useState<BylawArticle[]>(initialBylaws);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [revisionDate, setRevisionDate] = useState(new Date().toISOString().split('T')[0]);

  const handleEdit = (id: string, newContent: string) => {
    setBylaws(prev => prev.map(item => {
      if (item.id === id) {
        // If not already modified, store original
        const original = item.originalContent || item.content;
        return { 
          ...item, 
          content: newContent, 
          isModified: newContent !== original,
          originalContent: original
        };
      }
      return item;
    }));
  };

  const modifiedArticles = bylaws.filter(b => b.isModified);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">회칙 관리 및 개정</h2>
          <p className="text-sm text-gray-500">클럽 회칙을 열람하고 개정할 수 있습니다.</p>
        </div>
        <div className="flex gap-2 items-center">
            <ActionButtons targetId="bylaws-content" fileName="해오름클럽_회칙" />
            <button 
                onClick={() => setShowComparison(!showComparison)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${showComparison ? 'bg-indigo-600 text-white' : 'bg-white border text-gray-700 hover:bg-gray-50'}`}
            >
                <ScaleIcon className="w-4 h-4"/>
                {showComparison ? '회칙 전문 보기' : '신구 조문 대비표 보기'}
            </button>
        </div>
      </div>

      <div id="bylaws-content">
      {showComparison ? (
        // Comparison View
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold mb-4 border-b pb-2 flex justify-between items-center">
                <span>신·구 조문 대비표</span>
                <span className="text-sm font-normal text-gray-500">개정일자: {revisionDate}</span>
            </h3>
            {modifiedArticles.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                    수정된 조항이 없습니다. 회칙 전문에서 내용을 수정한 후 확인해주세요.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 p-3 w-1/4">현 행</th>
                                <th className="border border-gray-300 p-3 w-1/4">개 정 안</th>
                                <th className="border border-gray-300 p-3">비 고</th>
                            </tr>
                        </thead>
                        <tbody>
                            {modifiedArticles.map(article => (
                                <tr key={article.id}>
                                    <td className="border border-gray-300 p-3 align-top whitespace-pre-wrap text-sm text-gray-600">
                                        <div className="font-bold mb-1">{article.title}</div>
                                        {article.originalContent}
                                    </td>
                                    <td className="border border-gray-300 p-3 align-top whitespace-pre-wrap text-sm text-blue-800 bg-blue-50">
                                        <div className="font-bold mb-1">{article.title}</div>
                                        {article.content}
                                    </td>
                                    <td className="border border-gray-300 p-3 align-top text-xs text-center text-gray-500">
                                        부분 개정
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      ) : (
        // Full View
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 bg-slate-50 border-b flex justify-between items-center">
                <div>
                   <h1 className="text-2xl font-serif font-bold text-slate-800">해오름 배드민턴클럽 회칙</h1>
                   <p className="text-xs text-slate-500 mt-1">시행일: 2025.01.01 | 개정번호: 01</p>
                </div>
                <div className="text-right no-print">
                    <label className="text-xs text-gray-500 block mb-1">개정 기준일 설정</label>
                    <input type="date" value={revisionDate} onChange={(e) => setRevisionDate(e.target.value)} className="border rounded p-1 text-sm" />
                </div>
            </div>
            <div className="divide-y divide-gray-100">
                {bylaws.map((article) => (
                    <div key={article.id} className={`p-6 hover:bg-gray-50 transition-colors ${article.isModified ? 'bg-yellow-50' : ''}`}>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg text-slate-800">{article.title}</h3>
                            <button 
                                onClick={() => setEditingId(editingId === article.id ? null : article.id)}
                                className="text-gray-400 hover:text-blue-600 p-1 no-print"
                            >
                                <Edit3 className="w-4 h-4" />
                            </button>
                        </div>
                        {editingId === article.id ? (
                            <div className="no-print">
                                <textarea 
                                    className="w-full border rounded-lg p-3 text-sm min-h-[150px] focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={article.content}
                                    onChange={(e) => handleEdit(article.id, e.target.value)}
                                />
                                <div className="flex justify-end gap-2 mt-2">
                                    <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-slate-800 text-white text-xs rounded">완료</button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {article.content}
                            </p>
                        )}
                        {article.isModified && (
                            <div className="mt-2 text-xs text-orange-600 font-bold flex items-center gap-1">
                                * 수정됨 (대비표에서 확인 가능)
                                <button 
                                    onClick={() => handleEdit(article.id, article.originalContent || article.content)}
                                    className="ml-2 text-gray-400 hover:text-gray-600 underline no-print"
                                >
                                    되돌리기
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
      )}
      </div>
    </div>
  );
};

// Helper Icon
function ScaleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
      </svg>
    )
}

export default Bylaws;