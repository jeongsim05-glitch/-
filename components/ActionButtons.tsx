import React, { useState } from 'react';
import { Printer, FileDown, Image as ImageIcon, Save, ExternalLink, Loader2, X, AlertTriangle, CheckCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ActionButtonsProps {
  targetId?: string;
  fileName?: string;
}

// Custom Modal Component to bypass browser sandbox restrictions
const CustomDialog: React.FC<{
  isOpen: boolean;
  type: 'confirm' | 'alert' | 'success';
  title: string;
  message: React.ReactNode;
  onConfirm?: () => void;
  onCancel: () => void;
  confirmText?: string;
}> = ({ isOpen, type, title, message, onConfirm, onCancel, confirmText = "확인" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        <div className={`p-4 flex items-center gap-3 border-b ${type === 'success' ? 'bg-green-50 border-green-100' : type === 'confirm' ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}>
          {type === 'success' && <CheckCircle className="w-6 h-6 text-green-600" />}
          {type === 'confirm' && <AlertTriangle className="w-6 h-6 text-blue-600" />}
          {type === 'alert' && <AlertTriangle className="w-6 h-6 text-orange-600" />}
          <h3 className={`font-bold text-lg ${type === 'success' ? 'text-green-800' : type === 'confirm' ? 'text-blue-800' : 'text-orange-800'}`}>
            {title}
          </h3>
          <button onClick={onCancel} className="ml-auto text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 text-gray-700 leading-relaxed whitespace-pre-wrap">
          {message}
        </div>

        <div className="p-4 bg-gray-50 flex justify-end gap-3">
          {type === 'confirm' && (
            <button 
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
            >
              취소
            </button>
          )}
          <button 
            onClick={() => {
              if (onConfirm) onConfirm();
              else onCancel();
            }}
            className={`px-4 py-2 rounded-lg text-white font-bold shadow-md transition-transform active:scale-95
              ${type === 'success' ? 'bg-green-600 hover:bg-green-700' : 
                type === 'confirm' ? 'bg-blue-600 hover:bg-blue-700' : 
                'bg-orange-600 hover:bg-orange-700'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const ActionButtons: React.FC<ActionButtonsProps> = ({ targetId = 'page-content', fileName = '해오름클럽_문서' }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const driveLink = "https://drive.google.com/open?id=1dDqT635AHxuDdSlS81_YVyCHg3KASy_5&usp=drive_fs";

  // Modal State
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    type: 'confirm' | 'alert' | 'success';
    title: string;
    message: React.ReactNode;
    onConfirm?: () => void;
    confirmText?: string;
  }>({
    isOpen: false,
    type: 'alert',
    title: '',
    message: '',
  });

  const closeDialog = () => setDialogState(prev => ({ ...prev, isOpen: false }));

  // --- Capture Logic ---
  const expandElements = (clonedDoc: Document) => {
      const scrollables = clonedDoc.querySelectorAll('div[class*="overflow-"], div[class*="h-"]');
      scrollables.forEach((el: any) => {
          el.style.height = 'auto';
          el.style.maxHeight = 'none';
          el.style.overflow = 'visible';
      });
      const tableContainers = clonedDoc.querySelectorAll('.overflow-x-auto, .overflow-y-auto');
      tableContainers.forEach((el: any) => {
          el.style.overflow = 'visible';
          el.style.height = 'auto';
          el.style.width = '100%';
          el.style.display = 'block';
      });
      const stickyElements = clonedDoc.querySelectorAll('.sticky');
      stickyElements.forEach((el: any) => {
          el.style.position = 'static';
      });
      const targetEl = clonedDoc.getElementById(targetId);
      if (targetEl) {
         targetEl.style.padding = '40px'; 
         targetEl.style.width = 'fit-content';
         if (targetEl.scrollWidth > clonedDoc.body.clientWidth) {
             const newWidth = targetEl.scrollWidth + 100;
             clonedDoc.body.style.width = `${newWidth}px`;
             clonedDoc.body.style.minWidth = `${newWidth}px`;
         }
      }
  };

  const createPdfBlob = async (targetElement: HTMLElement) => {
    try {
        const canvas = await html2canvas(targetElement, { 
            scale: 2, 
            logging: false, 
            useCORS: true, 
            allowTaint: true, 
            scrollY: -window.scrollY,
            windowWidth: document.documentElement.scrollWidth,
            onclone: expandElements
        });
        const imgData = canvas.toDataURL('image/png');
        const orientation = canvas.width > canvas.height ? 'l' : 'p';
        const pdf = new jsPDF(orientation, 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        return pdf;
    } catch (err) {
        console.error(err);
        return null;
    }
  };

  // --- Handlers ---

  const handlePrint = async () => {
    // Sandbox workaround: Since window.print() is blocked, generate PDF and ask user to print that.
    setDialogState({
      isOpen: true,
      type: 'confirm',
      title: '인쇄 미리보기',
      message: '현재 브라우저 보안 환경에서는 직접 인쇄 대화상자를 띄울 수 없습니다.\n\n대신 "인쇄용 PDF"를 생성하여 다운로드하시겠습니까?\n다운로드된 파일을 열어 인쇄해주세요.',
      confirmText: 'PDF 다운로드',
      onConfirm: () => {
        closeDialog();
        handlePdfDownload();
      }
    });
  };

  const handlePdfDownload = async () => {
    const element = document.getElementById(targetId);
    if (!element) return;
    setLoading('pdf');
    try {
      const pdf = await createPdfBlob(element);
      if (pdf) {
        pdf.save(`${fileName}_${new Date().toISOString().split('T')[0]}.pdf`);
      }
    } catch(e) { console.error(e); }
    finally { setLoading(null); }
  };

  const handleImageDownload = async () => {
    const element = document.getElementById(targetId);
    if (!element) return;
    setLoading('image');
    try {
      const canvas = await html2canvas(element, { 
          scale: 2, 
          useCORS: true, 
          scrollY: -window.scrollY,
          windowWidth: document.documentElement.scrollWidth,
          onclone: expandElements
      });
      const link = document.createElement('a');
      link.download = `${fileName}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch(e) { console.error(e); }
    finally { setLoading(null); }
  };

  const handleDriveSave = () => {
    // 1. Show Confirmation Modal (Replaces window.confirm)
    setDialogState({
      isOpen: true,
      type: 'confirm',
      title: '구글 드라이브 업로드 안내',
      message: (
        <div className="text-left text-sm text-gray-600">
          <p className="mb-3 text-red-600 font-bold bg-red-50 p-2 rounded">
            ※ 웹 보안 정책상 자동 업로드가 불가능합니다.
          </p>
          <p className="mb-2 font-bold text-gray-800">다음 순서로 진행됩니다:</p>
          <ol className="list-decimal pl-5 space-y-1 mb-4">
            <li><strong>[확인]</strong>을 누르면 <strong>구글 드라이브</strong> 새 탭이 열립니다.</li>
            <li>잠시 후 <strong>PDF 파일</strong>이 생성되어 다운로드됩니다.</li>
            <li>다운로드된 파일을 열린 드라이브 폴더로 <strong>드래그</strong>하여 업로드하세요.</li>
          </ol>
          <p className="font-bold text-center text-blue-600">진행하시겠습니까?</p>
        </div>
      ),
      confirmText: '네, 드라이브 열기',
      onConfirm: async () => {
        // 2. Open Drive immediately (Must be direct response to click)
        window.open(driveLink, '_blank');
        
        closeDialog();
        setLoading('drive');
        
        try {
            const element = document.getElementById(targetId);
            if(!element) throw new Error("Target not found");

            // Give a small delay to let the tab open smoothly
            await new Promise(resolve => setTimeout(resolve, 500));

            const pdf = await createPdfBlob(element);
            
            if (pdf) {
                // 3. Download the file
                pdf.save(`${fileName}_${new Date().toISOString().split('T')[0]}.pdf`);
                
                setLoading(null);
                
                // 4. Show Success Modal
                setDialogState({
                    isOpen: true,
                    type: 'success',
                    title: '파일 생성 완료',
                    message: (
                        <div className="text-center">
                            <p className="mb-2"><strong>다운로드 폴더</strong>를 확인해주세요.</p>
                            <p className="text-sm text-gray-600">방금 열린 <strong>구글 드라이브 탭</strong>에<br/>다운로드된 파일을 업로드하시면 됩니다.</p>
                        </div>
                    ),
                    confirmText: '확인',
                    onConfirm: () => closeDialog()
                });
            }
        } catch (err) {
            console.error(err);
            setLoading(null);
            setDialogState({
                isOpen: true,
                type: 'alert',
                title: '오류 발생',
                message: 'PDF 생성 중 문제가 발생했습니다.',
                onConfirm: () => closeDialog()
            });
        }
      }
    });
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 no-print">
        <button 
          onClick={handlePrint} 
          disabled={!!loading}
          className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 text-white rounded hover:bg-slate-800 text-sm transition-colors disabled:opacity-50" 
          title="인쇄 (PDF 다운로드)"
        >
          <Printer className="w-4 h-4" />
          <span className="hidden sm:inline">인쇄</span>
        </button>
        
        <button 
          onClick={handlePdfDownload} 
          disabled={!!loading}
          className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-sm transition-colors disabled:opacity-50" 
          title="PDF 다운로드"
        >
          {loading === 'pdf' ? <Loader2 className="w-4 h-4 animate-spin"/> : <FileDown className="w-4 h-4" />}
          <span className="hidden sm:inline">PDF</span>
        </button>

        <button 
          onClick={handleImageDownload} 
          disabled={!!loading}
          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm transition-colors disabled:opacity-50" 
          title="이미지 다운로드"
        >
          {loading === 'image' ? <Loader2 className="w-4 h-4 animate-spin"/> : <ImageIcon className="w-4 h-4" />}
          <span className="hidden sm:inline">이미지</span>
        </button>

        <button 
          onClick={handleDriveSave} 
          disabled={!!loading}
          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm transition-colors disabled:opacity-50" 
          title="구글 드라이브 업로드 (안내)"
        >
          {loading === 'drive' ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />}
          <span className="hidden sm:inline">Drive 저장</span>
        </button>

        <a 
          href={driveLink} 
          target="_blank" 
          rel="noreferrer" 
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm transition-colors" 
          title="구글 드라이브 폴더 열기"
        >
          <ExternalLink className="w-4 h-4" />
          <span className="hidden sm:inline">Drive 열기</span>
        </a>
      </div>

      {/* Render Custom Modal */}
      <CustomDialog 
        isOpen={dialogState.isOpen}
        type={dialogState.type}
        title={dialogState.title}
        message={dialogState.message}
        onConfirm={dialogState.onConfirm}
        onCancel={closeDialog}
        confirmText={dialogState.confirmText}
      />
    </>
  );
};

export default ActionButtons;