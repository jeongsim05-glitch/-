import React from 'react';
import { GlobalSettings } from '../types';
import { Settings, Save, AlertTriangle } from 'lucide-react';

interface AdminSettingsProps {
  settings: GlobalSettings;
  setSettings: React.Dispatch<React.SetStateAction<GlobalSettings>>;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ settings, setSettings }) => {
  
  const handleChange = (key: keyof GlobalSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-slate-800 rounded-lg text-white">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">관리자 환경 설정</h2>
          <p className="text-sm text-gray-500">클럽 운영 정책 및 앱 기능을 설정합니다.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Settings */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
            💰 회비 및 재무 설정
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">월 정회원 회비</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={settings.monthlyFee}
                  onChange={(e) => handleChange('monthlyFee', Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₩</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">월 준회원 회비</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={settings.associateFee}
                  onChange={(e) => handleChange('associateFee', Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₩</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">전년도 이월금 (초기 잔액)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={settings.initialCarryover}
                  onChange={(e) => handleChange('initialCarryover', Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₩</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
            🚀 기능 활성화 (Beta)
          </h3>
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-bold text-gray-800 block">AI 원포인트 레슨 (동영상)</span>
                <p className="text-sm text-gray-500 mt-1">회원들이 스윙 영상을 업로드하면 AI가 자세를 교정해주는 메뉴를 활성화합니다.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.enableAICoaching}
                  onChange={(e) => handleChange('enableAICoaching', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <span className="font-bold text-gray-800 block">출석왕 히트맵 (잔디심기)</span>
                <p className="text-sm text-gray-500 mt-1">회원별 연간 출석 현황을 시각화하고 출석 체크 기능을 활성화합니다.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.enableAttendance}
                  onChange={(e) => handleChange('enableAttendance', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100 flex gap-3">
             <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
             <p className="text-xs text-yellow-800 leading-relaxed">
               기능 설정을 변경하면 왼쪽 사이드바 메뉴가 즉시 업데이트됩니다. 
               AI 기능은 API 사용량을 소모할 수 있습니다.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;