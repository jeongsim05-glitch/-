import React, { useState, useRef } from 'react';
import { Video, Upload, Sparkles, Loader2, PlayCircle, AlertCircle } from 'lucide-react';
import { analyzeBadmintonVideo } from '../services/geminiService';
import ActionButtons from './ActionButtons';

const Coaching: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit warning
        alert("영상 크기가 너무 큽니다. 50MB 이하의 짧은 영상을 권장합니다.");
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setAnalysis('');
    }
  };

  const handleAnalyze = async () => {
    if (!videoFile) return;

    setLoading(true);
    setAnalysis('');

    try {
      // Convert video to base64
      const reader = new FileReader();
      reader.readAsDataURL(videoFile);
      reader.onload = async () => {
        const base64Data = reader.result as string;
        // Strip prefix (e.g., "data:video/mp4;base64,")
        const base64Content = base64Data.split(',')[1];
        
        const result = await analyzeBadmintonVideo(base64Content, videoFile.type);
        setAnalysis(result);
        setLoading(false);
      };
      reader.onerror = () => {
        alert("파일 처리 중 오류가 발생했습니다.");
        setLoading(false);
      };
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Video className="text-purple-600" />
            AI 원포인트 레슨
          </h2>
          <p className="text-sm text-gray-500">
            스매시, 드롭 등 자신의 플레이 영상을 올리면 AI 코치가 자세를 교정해줍니다.
          </p>
        </div>
        <ActionButtons targetId="coaching-content" fileName="해오름클럽_AI레슨" />
      </div>

      <div id="coaching-content" className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* Input Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
          <div 
            className={`
              flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 transition-colors relative overflow-hidden min-h-[300px]
              ${videoPreview ? 'border-purple-200 bg-black' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}
            `}
          >
            {videoPreview ? (
              <video 
                src={videoPreview} 
                controls 
                className="w-full h-full object-contain max-h-[400px]"
              />
            ) : (
              <div className="text-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="bg-purple-100 p-4 rounded-full inline-block mb-4">
                  <Upload className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-700 mb-1">동영상 업로드</h3>
                <p className="text-xs text-gray-500">MP4, WebM (최대 1분 권장)</p>
              </div>
            )}
            <input 
              type="file" 
              accept="video/*" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
            />
            {videoPreview && (
                <button 
                    onClick={() => {
                        setVideoFile(null);
                        setVideoPreview(null);
                        setAnalysis('');
                    }}
                    className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                >
                    ✕
                </button>
            )}
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={!videoFile || loading}
            className="mt-4 w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition-all flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-200"
          >
            {loading ? (
              <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin"/> 영상을 분석하고 있습니다...</span>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                AI 코치에게 분석 요청하기
              </>
            )}
          </button>
          
          <div className="mt-4 flex gap-2 items-start bg-blue-50 p-3 rounded text-xs text-blue-700">
             <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
             <p>영상은 분석 목적으로만 일시적으로 사용되며 서버에 영구 저장되지 않습니다.</p>
          </div>
        </div>

        {/* Result Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 min-h-[400px] flex flex-col">
          <h3 className="font-bold text-lg border-b pb-3 mb-4 flex items-center gap-2 text-slate-800">
            <PlayCircle className="w-5 h-5" />
            분석 결과 리포트
          </h3>
          
          {analysis ? (
            <div className="prose prose-sm max-w-none flex-1 overflow-y-auto p-4 bg-gray-50 rounded-lg">
               <div className="whitespace-pre-wrap leading-relaxed text-gray-800">
                 {analysis.split('\n').map((line, i) => {
                    // Simple markdown-like parsing for bold text
                    if (line.includes('**')) {
                        const parts = line.split('**');
                        return <p key={i} className="mb-2">
                            {parts.map((part, idx) => idx % 2 === 1 ? <strong key={idx} className="text-purple-700 bg-purple-50 px-1 rounded">{part}</strong> : part)}
                        </p>;
                    }
                    if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
                        return <li key={i} className="ml-4 mb-1">{line.replace(/^-|•/, '').trim()}</li>
                    }
                    if (line.match(/^\d+\./)) {
                        return <div key={i} className="font-bold mt-4 mb-2 text-slate-900 border-l-4 border-purple-500 pl-2">{line}</div>
                    }
                    return <p key={i} className="mb-2">{line}</p>
                 })}
               </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-lg">
                <Video className="w-16 h-16 mb-4 opacity-10" />
                <p>영상을 업로드하고 분석을 시작해보세요.</p>
                <p className="text-xs mt-2">자세, 타점, 스텝 등을 정밀하게 분석해드립니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Coaching;