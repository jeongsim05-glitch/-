export enum Rank {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  BEGINNER = '초심'
}

export enum GameType {
  SINGLES = '단식',
  MENS_DOUBLES = '남자복식',
  WOMENS_DOUBLES = '여자복식',
  MIXED_DOUBLES = '혼합복식'
}

export interface Member {
  id: string;
  name: string;
  rank: Rank;
  position: string; // 직책
  memberType: '정회원' | '준회원';
  joinDate: string;
  tenure: string; // 클럽근속일
  phone: string;
  email: string;
  address: string;
  job: string;
  notes: string;
  isSickLeave: boolean; // 병가
  isFamilyMember: boolean; // 가족회원
  isCoupleMember: boolean; // 부부회원
  gender: 'M' | 'F';
  accountNumber?: string; // 계좌번호
  topSize?: string; // 상의 사이즈
  bottomSize?: string; // 하의 사이즈
  lessonDays?: string[]; // ['월', '수'] etc.
}

export interface FinancialRecord {
  memberId: string;
  year: number;
  payments: { [month: number]: number }; // month 1-12, value: amount paid
  exemptMonths: number[]; // Months where fee is exempted
}

export interface Expense {
  id: string;
  date: string;
  category: string; // 식대, 대관료, 비품 등
  description: string; // 상세 내용 (e.g., 회식비)
  amount: number;
  receiptUrl?: string; // 영수증 이미지 URL (base64 or link)
}

export interface Donation {
  id: string;
  date: string; // 행사 월/일
  eventName: string; // 행사명
  donorName: string; // 찬조자 이름
  amount: number; // 찬조금 (0이면 물품)
  item: string; // 찬조물품 (현금이면 비워둠)
}

export interface Notice {
  id: string;
  month: string; // YYYY-MM
  agenda: string; // 안건
  events: string; // 행사
  nextSchedule: string; // 다음 일정
}

export interface Match {
  id: string;
  type: GameType;
  team1: Member[];
  team2: Member[];
  score1?: number;
  score2?: number;
  date: string;
  winner?: 1 | 2; // Team 1 or Team 2
}

export interface WinStats {
  wins: number;
  losses: number;
  draws: number;
  total: number;
  winRate: number;
}

export interface LessonStatus {
  date: string; // YYYY-MM-DD
  status: 'completed' | 'cancelled';
}

export interface GlobalSettings {
  monthlyFee: number;
  associateFee: number;
  initialCarryover: number;
  enableAICoaching: boolean;
  enableAttendance: boolean;
}

export interface AttendanceRecord {
  date: string;
  memberIds: string[];
}
