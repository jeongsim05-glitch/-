import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Layout from './components/Layout';
import Members from './components/Members';
import Matches from './components/Matches';
import Financials from './components/Financials';
import Analysis from './components/Analysis';
import Documents from './components/Documents';
import Lessons from './components/Lessons';
import Bylaws from './components/Bylaws';
import AdminSettings from './components/AdminSettings';
import Coaching from './components/Coaching';
import Attendance from './components/Attendance';
import { Member, Match, Rank, Expense, Notice, FinancialRecord, Donation, GameType, GlobalSettings, AttendanceRecord } from './types';

// Storage Keys
const KEYS = {
  MEMBERS: 'haeoreum_members',
  RECORDS: 'haeoreum_records',
  MATCHES: 'haeoreum_matches',
  EXPENSES: 'haeoreum_expenses',
  DONATIONS: 'haeoreum_donations',
  NOTICES: 'haeoreum_notices',
  SETTINGS: 'haeoreum_settings',
  ATTENDANCE: 'haeoreum_attendance',
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [activeTab, setActiveTab] = useState('members');
  const [isLoaded, setIsLoaded] = useState(false);
  
  // -- Global Settings --
  const [settings, setSettings] = useState<GlobalSettings>({
    monthlyFee: 30000,
    associateFee: 15000,
    initialCarryover: 5659886,
    enableAICoaching: false,
    enableAttendance: false
  });

  // -- Data States --
  const [members, setMembers] = useState<Member[]>([]);
  const [financialRecords, setFinancialRecords] = useState<Record<string, FinancialRecord>>({});
  const [matches, setMatches] = useState<Match[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  // --- 1. Load Data on Mount ---
  useEffect(() => {
    const loadData = () => {
        try {
            const savedMembers = localStorage.getItem(KEYS.MEMBERS);
            const savedRecords = localStorage.getItem(KEYS.RECORDS);
            const savedMatches = localStorage.getItem(KEYS.MATCHES);
            const savedExpenses = localStorage.getItem(KEYS.EXPENSES);
            const savedDonations = localStorage.getItem(KEYS.DONATIONS);
            const savedNotices = localStorage.getItem(KEYS.NOTICES);
            const savedSettings = localStorage.getItem(KEYS.SETTINGS);
            const savedAttendance = localStorage.getItem(KEYS.ATTENDANCE);

            if (savedMembers) {
                // Load from storage
                setMembers(JSON.parse(savedMembers));
                if (savedRecords) setFinancialRecords(JSON.parse(savedRecords));
                if (savedMatches) setMatches(JSON.parse(savedMatches));
                if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
                if (savedDonations) setDonations(JSON.parse(savedDonations));
                if (savedNotices) setNotices(JSON.parse(savedNotices));
                if (savedSettings) setSettings(JSON.parse(savedSettings));
                if (savedAttendance) setAttendanceRecords(JSON.parse(savedAttendance));
            } else {
                // Initialize with Demo Data
                generateDemoData();
            }
        } catch (e) {
            console.error("Failed to load data", e);
            generateDemoData();
        } finally {
            setIsLoaded(true);
        }
    };

    loadData();
  }, []);

  // --- 2. Save Data on Change ---
  useEffect(() => {
      if (!isLoaded) return;
      localStorage.setItem(KEYS.MEMBERS, JSON.stringify(members));
  }, [members, isLoaded]);

  useEffect(() => {
      if (!isLoaded) return;
      localStorage.setItem(KEYS.RECORDS, JSON.stringify(financialRecords));
  }, [financialRecords, isLoaded]);

  useEffect(() => {
      if (!isLoaded) return;
      localStorage.setItem(KEYS.MATCHES, JSON.stringify(matches));
  }, [matches, isLoaded]);

  useEffect(() => {
      if (!isLoaded) return;
      localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses, isLoaded]);

  useEffect(() => {
      if (!isLoaded) return;
      localStorage.setItem(KEYS.DONATIONS, JSON.stringify(donations));
  }, [donations, isLoaded]);

  useEffect(() => {
      if (!isLoaded) return;
      localStorage.setItem(KEYS.NOTICES, JSON.stringify(notices));
  }, [notices, isLoaded]);

  useEffect(() => {
      if (!isLoaded) return;
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings, isLoaded]);

  useEffect(() => {
      if (!isLoaded) return;
      localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(attendanceRecords));
  }, [attendanceRecords, isLoaded]);


  const generateDemoData = () => {
    // Digitized data from the provided images (103 Regular + 6 Associate)
    const rawData = [
      // --- Regular Members (정회원) ---
      { id: '1', name: '강경화', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: '2', name: '강민지', type: '정회원', joinDate: '2025-09-30', status: {10:'신규'} },
      { id: '3', name: '고은숙', type: '정회원', joinDate: '2020-01-01', status: '연납' },
      { id: '4', name: '고주이', type: '정회원', joinDate: '2020-01-01', status: '연납' },
      { id: '5', name: '김경아', type: '정회원', joinDate: '2025-06-06', status: {6:'신규', 7:'면제', 8:'면제'} },
      { id: '6', name: '김경윤', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O'} },
      { id: '7', name: '김동수', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O',11:'O',12:'O'} }, // 완료 -> Full pay
      { id: '8', name: '김동주', type: '정회원', joinDate: '2020-01-01', status: '연납' },
      { id: '9', name: '김동준', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: '10', name: '김동환', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'병가',8:'병가',9:'병가',10:'병가'} },
      { id: '11', name: '김미선', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: '12', name: '김민정', type: '정회원', joinDate: '2020-01-01', status: '연납' },
      { id: '13', name: '김보성', type: '정회원', joinDate: '2025-03-25', status: {4:'신규', 5:'면제', 6:'면제'} },
      { id: '14', name: '김성남', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: '15', name: '김성빈', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O'} },
      { id: '16', name: '김순희', type: '정회원', joinDate: '2020-01-01', status: '연납' },
      { id: '17', name: '김승태', type: '정회원', joinDate: '2020-01-01', status: '연납' },
      { id: '18', name: '김완순', type: '정회원', joinDate: '2020-01-01', status: '연납' },
      { id: '19', name: '김용숙', type: '정회원', joinDate: '2025-06-11', status: {6:'신규', 7:'면제', 8:'면제', 9:'O'} },
      { id: '20', name: '김인택', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: '21', name: '김중진', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O'} },
      { id: '22', name: '김지연', type: '정회원', joinDate: '2025-09-18', status: {9:'신규'} },
      { id: '23', name: '김창석', type: '정회원', joinDate: '2025-08-27', status: {9:'신규'} },
      { id: '24', name: '김창원', type: '정회원', joinDate: '2025-09-03', status: {9:'신규', 10:'O'} },
      { id: '25', name: '김철규', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O'} },
      { id: '26', name: '김현민', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: '27', name: '김현종', type: '정회원', joinDate: '2025-06-01', status: {6:'신규', 7:'면제', 8:'면제', 9:'O'} },
      { id: '28', name: '김형태', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O'} },
      { id: '29', name: '김혜빈', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: '30', name: '나용상', type: '정회원', joinDate: '2020-01-01', status: {1:'면제', 2:'면제', 3:'O', 4:'O', 5:'O', 6:'O', 7:'O', 8:'O', 9:'O', 10:'O'} },
      { id: '31', name: '남재현', type: '정회원', joinDate: '2025-07-09', status: {7:'신규'} },
      { id: '32', name: '남주현', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: '33', name: '노권철', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O',11:'O'} },
      { id: '34', name: '류택수', type: '정회원', joinDate: '2020-01-01', status: '연납' },
      { id: '35', name: '명재홍', type: '정회원', joinDate: '2025-08-27', status: {9:'신규'} },
      { id: '36', name: '박동수', type: '정회원', joinDate: '2020-01-01', status: '연납' },
      { id: '37', name: '박미화', type: '정회원', joinDate: '2025-06-23', status: {7:'신규', 8:'면제', 9:'면제', 10:'O', 11:'O', 12:'O'} },
      { id: '38', name: '박성오', type: '정회원', joinDate: '2025-10-13', status: {10:'신규'} },
      { id: '39', name: '박은진', type: '정회원', joinDate: '2025-03-03', status: {3:'신규', 4:'면제', 5:'면제', 6:'O', 7:'O', 8:'O', 9:'O', 10:'O'} },
      { id: '40', name: '박재훈', type: '정회원', joinDate: '2025-03-12', status: {3:'신규', 4:'면제', 5:'면제', 6:'O', 7:'O', 8:'O', 9:'O'} },
      { id: '41', name: '박종석', type: '정회원', joinDate: '2025-10-15', status: {10:'신규'} },
      { id: '42', name: '박주노', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: '43', name: '배성준', type: '정회원', joinDate: '2025-09-02', status: {9:'신규', 10:'O'} },
      { id: '44', name: '배수미', type: '정회원', joinDate: '2020-01-01', status: '연납' },
      { id: '45', name: '백효정', type: '정회원', joinDate: '2025-07-01', status: {7:'신규', 8:'면제', 9:'면제'} },
      { id: '46', name: '백승우', type: '정회원', joinDate: '2020-01-01', status: {} },
      { id: '47', name: '성채원', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: '48', name: '송용필', type: '정회원', joinDate: '2020-01-01', status: '연납' },
      { id: '49', name: '송중석', type: '정회원', joinDate: '2025-03-25', status: {4:'신규', 5:'면제', 6:'면제', 7:'O', 8:'O', 9:'O', 10:'O', 11:'O', 12:'O'} },
      { id: '50', name: '신동온', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: '51', name: '신미영', type: '정회원', joinDate: '2025-03-03', status: {3:'신규', 4:'면제', 5:'면제', 6:'O', 7:'O', 8:'O'} },
      { id: '52', name: '신영숙', type: '정회원', joinDate: '2020-01-01', status: '연납' },
      { id: '53', name: '신철원', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: '54', name: '안병찬', type: '정회원', joinDate: '2025-09-08', status: {9:'신규', 10:'O'} },
      { id: '55', name: '안숙자', type: '정회원', joinDate: '2020-01-01', status: '연납' },
      { id: '56', name: '양은철', type: '정회원', joinDate: '2025-06-24', status: {7:'신규', 8:'면제', 9:'면제'} },
      { id: '57', name: '오진동', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O'} },
      { id: '58', name: '우명자', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: '59', name: '우정식', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O'} },
      { id: '60', name: '유 환', type: '정회원', joinDate: '2025-08-20', status: {8:'신규', 9:'O'} },
      { id: '61', name: '유재하', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O'} },
      { id: '62', name: '윤다정', type: '정회원', joinDate: '2025-08-01', status: {8:'신규', 9:'O'} },
      { id: '63', name: '이경희', type: '정회원', joinDate: '2025-09-18', status: {9:'신규', 10:'O'} },
      { id: '64', name: '이명열', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O'} },
      { id: '65', name: '이민규', type: '정회원', joinDate: '2025-05-12', status: {5:'신규', 6:'면제', 7:'면제', 8:'O', 9:'O', 10:'O'} },
      { id: '66', name: '이상근', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O'} },
      { id: '67', name: '이상림', type: '정회원', joinDate: '2025-03-01', status: {3:'신규', 4:'면제', 5:'면제', 6:'O', 7:'병가', 8:'O', 9:'O', 10:'O', 11:'O', 12:'O'} },
      { id: '68', name: '이상훈', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: '69', name: '이석현', type: '정회원', joinDate: '2025-08-18', status: {8:'신규', 9:'O'} },
      { id: '70', name: '이수복', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O'} },
      { id: '71', name: '이영집', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O'} },
      { id: '72', name: '이은비', type: '정회원', joinDate: '2025-09-01', status: {9:'O'}, notes: '9월 복귀' },
      { id: '73', name: '이정식', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O'} },
      { id: '74', name: '이준희', type: '정회원', joinDate: '2025-06-04', status: {6:'신규', 7:'면제', 8:'면제'} },
      { id: '75', name: '이진환', type: '정회원', joinDate: '2025-08-05', status: {8:'신규', 9:'O'} },
      { id: '76', name: '이찬무', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: '77', name: '이한슬', type: '정회원', joinDate: '2025-03-25', status: {4:'신규', 5:'면제', 6:'면제', 7:'O', 8:'O', 9:'O', 10:'O'} },
      { id: '78', name: '이현숙', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: '79', name: '임경식', type: '정회원', joinDate: '2025-03-03', status: {3:'신규', 4:'면제', 5:'면제', 6:'O', 7:'O', 8:'O'} },
      { id: '80', name: '임용빈', type: '정회원', joinDate: '2025-06-17', status: {6:'신규', 7:'면제', 8:'면제'} },
      { id: '81', name: '임주연', type: '정회원', joinDate: '2025-05-26', status: {6:'신규', 7:'면제', 8:'면제'} },
      { id: '82', name: '임지우', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: '83', name: '임형배', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: '84', name: '장경진', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O'} },
      { id: '85', name: '장이슬', type: '정회원', joinDate: '2025-06-04', status: {6:'신규', 7:'면제', 8:'면제', 9:'병가', 10:'병가'} },
      { id: '86', name: '장한나', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: '87', name: '전미영', type: '정회원', joinDate: '2025-09-03', status: {9:'신규'} },
      { id: '88', name: '전민영', type: '정회원', joinDate: '2025-08-20', status: {8:'신규', 9:'O'} },
      { id: '89', name: '정기환', type: '정회원', joinDate: '2025-06-09', status: {6:'신규', 7:'면제', 8:'면제', 9:'O', 10:'O'} },
      { id: '90', name: '조미현', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: '91', name: '조용흠', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O'} },
      { id: '92', name: '조익수', type: '정회원', joinDate: '2020-01-01', status: {1:'면제', 2:'면제', 3:'O', 4:'O', 5:'O', 6:'O', 7:'O', 8:'O', 9:'O', 10:'O'} },
      { id: '93', name: '진미화', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O'} },
      { id: '94', name: '차금선', type: '정회원', joinDate: '2025-05-01', status: {5:'신규', 6:'면제', 7:'면제'} },
      { id: '95', name: '채동호', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O'} },
      { id: '96', name: '최 돌', type: '정회원', joinDate: '2025-07-07', status: {7:'신규'} },
      { id: '97', name: '최윤규', type: '정회원', joinDate: '2020-01-01', status: {2:'신규', 3:'면제', 4:'면제', 5:'O', 6:'O', 7:'O', 8:'O', 9:'O', 10:'O', 11:'O', 12:'O'} },
      { id: '98', name: '최인호', type: '정회원', joinDate: '2025-08-18', status: {8:'신규'} },
      { id: '99', name: '최진용', type: '정회원', joinDate: '2020-01-01', status: '연납' },
      { id: '100', name: '최철호', type: '정회원', joinDate: '2025-05-12', status: {5:'신규', 6:'면제', 7:'면제', 8:'O', 9:'O', 10:'O', 11:'O', 12:'O'} },
      { id: '101', name: '홍성옥', type: '정회원', joinDate: '2025-02-12', status: {2:'신규', 3:'면제', 4:'면제', 5:'O', 6:'O', 7:'O', 8:'O', 9:'O', 10:'O'} },
      { id: '102', name: '황덕현', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O'}, notes: '회비보류' },
      { id: '103', name: '황신순', type: '정회원', joinDate: '2020-01-01', status: '연납' },
      
      // --- Associate Members (준회원) ---
      { id: 'A1', name: '강태구', type: '준회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O'} },
      { id: 'A2', name: '김영호', type: '준회원', joinDate: '2025-03-01', status: {3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: 'A3', name: '김용선', type: '준회원', joinDate: '2020-01-01', status: '연납' },
      { id: 'A4', name: '장성일', type: '준회원', joinDate: '2025-07-01', status: {7:'O', 8:'O', 9:'O', 10:'O'} },
      { id: 'A5', name: '전우성', type: '준회원', joinDate: '2020-01-01', status: {1:'O'} },
      { id: 'A6', name: '조민규', type: '준회원', joinDate: '2020-01-01', status: {1:'O', 2:'O', 7:'O', 8:'O'}, notes: '대학생' },
    ];

    const initMembers: Member[] = [];
    const initRecords: Record<string, FinancialRecord> = {};
    const weekDays = ['월', '화', '수', '목', '금'];

    rawData.forEach((data, index) => {
       // 1. Create Member
       const hasLessons = Math.random() > 0.7;
       const lessonDays = hasLessons ? [weekDays[Math.floor(Math.random() * 5)]] : [];
       
       let position = data.type === '준회원' ? '준회원' : '회원';
       let password = undefined;
       
       if (data.id === '1') { position = '회장'; password = '1234'; }
       else if (data.id === '2') { position = '부회장'; password = '1234'; }
       else if (data.id === '3') { position = '사무국장'; password = '1234'; }
       else if (data.id === '4') { position = '재무이사'; password = '1234'; }
       else if (data.id === '5') { position = '총무이사'; password = '1234'; }
       else if (data.id === '6') { position = '경기이사'; password = '1234'; }
       else if (data.id === '7') { position = '홍보이사'; password = '1234'; }
       else if (data.id === '8') { position = '관리이사'; password = '1234'; }
       else if (data.id === '9') { position = '감사'; password = '1234'; }

       const member: Member = {
          id: data.id,
          name: data.name,
          rank: Rank.B,
          position: position,
          password: password,
          memberType: data.type as '정회원' | '준회원',
          joinDate: data.joinDate,
          tenure: '1년',
          phone: `010-0000-${String(index).padStart(4,'0')}`,
          email: '',
          address: '',
          job: '',
          notes: (data as any).notes || '',
          isSickLeave: false,
          isFamilyMember: false,
          isCoupleMember: false,
          gender: Math.random() > 0.3 ? 'M' : 'F', 
          lessonDays: lessonDays
       };
       initMembers.push(member);

       // 2. Create Financial Record
       const fee = data.type === '준회원' ? 15000 : 30000;
       const payments: { [month: number]: number } = {};
       const exemptMonths: number[] = [];

       if (data.status === '연납') {
          for(let m=1; m<=12; m++) payments[m] = fee;
       } else if (typeof data.status === 'object') {
          Object.entries(data.status).forEach(([monthStr, status]) => {
             const m = parseInt(monthStr);
             if (status === 'O') payments[m] = fee;
             else if (status === '면제' || status === '병가' || status === '신규') exemptMonths.push(m);
             if (status === '병가') member.isSickLeave = true; 
          });
       }

       initRecords[member.id] = {
          memberId: member.id,
          year: 2025,
          payments,
          exemptMonths
       };
    });

    setMembers(initMembers);
    setFinancialRecords(initRecords);

    // Initialize matches
    if (initMembers.length > 10) {
        const history: Match[] = [];
        for(let i=0; i<20; i++) {
            const m1 = initMembers[i];
            const m2 = initMembers[i+1];
            const m3 = initMembers[i+2];
            const m4 = initMembers[i+3];
            
            history.push({
                id: `history-${i}`,
                type: GameType.MENS_DOUBLES,
                team1: [m1, m2],
                team2: [m3, m4],
                date: '2025-01-01',
                winner: Math.random() > 0.5 ? 1 : 2,
                score1: 25,
                score2: 23
            });
        }
        setMatches(history);
    }
    
    // Reset others
    setExpenses([]);
    setDonations([]);
    setNotices([]);
    setAttendanceRecords([]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'members':
        return <Members members={members} setMembers={setMembers} currentUser={currentUser} />;
      case 'matches':
        return <Matches members={members} matches={matches} setMatches={setMatches} />;
      case 'financials':
        return <Financials 
            members={members} 
            expenses={expenses} 
            setExpenses={setExpenses} 
            records={financialRecords} 
            setRecords={setFinancialRecords} 
            donations={donations} 
            setDonations={setDonations}
            monthlyFee={settings.monthlyFee}
            setMonthlyFee={(val) => setSettings({...settings, monthlyFee: val as number})}
            associateFee={settings.associateFee}
            setAssociateFee={(val) => setSettings({...settings, associateFee: val as number})}
            initialCarryover={settings.initialCarryover}
            setInitialCarryover={(val) => setSettings({...settings, initialCarryover: val as number})}
        />;
      case 'lessons':
        return <Lessons members={members} />;
      case 'documents':
        return <Documents 
            members={members} 
            expenses={expenses} 
            notices={notices} 
            setNotices={setNotices} 
            records={financialRecords} 
            donations={donations}
            initialCarryover={settings.initialCarryover}
            monthlyFee={settings.monthlyFee}
            associateFee={settings.associateFee}
        />;
      case 'bylaws':
        return <Bylaws />;
      case 'analysis':
        return <Analysis members={members} matches={matches} />;
      case 'coaching':
        return <Coaching />;
      case 'attendance':
        return <Attendance members={members} attendanceRecords={attendanceRecords} setAttendanceRecords={setAttendanceRecords} />;
      case 'admin':
        return <AdminSettings settings={settings} setSettings={setSettings} />;
      default:
        return <Members members={members} setMembers={setMembers} currentUser={currentUser} />;
    }
  };

  // If not logged in, show Landing Page
  if (!currentUser) {
      return <LandingPage members={members} onLogin={setCurrentUser} />;
  }

  return (
    <Layout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        settings={settings} 
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;