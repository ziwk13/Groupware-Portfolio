import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AddApproval from '../components/AddApproval';
import { getApprovalDetail } from '../api/approvalAPI';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function ApprovalDetailPage() {
  const { docId } = useParams();
  const [detailData, setDetailData] = useState(null);

  useEffect(() => {
    async function fetchDetail() {
      const result = await getApprovalDetail(docId);
      setDetailData(result);
    }
    fetchDetail();
  }, [docId]);

  const exportPDF = () => {
    const target = document.getElementById('approval-document-area');
    if (!target) return;
    target.classList.add('pdf-mode');

    const originalStyle = target.style.cssText;
    target.style.cssText += `
    position: static !important;
    left: 0 !important;
    top: 0 !important;
    transform: none !important;
    z-index: auto !important;
  `;

    html2canvas(target, {
      scale: window.devicePixelRatio || 2,
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
      width: target.scrollWidth + 10,
      height: target.scrollHeight
    })
      .then((canvas) => {
        target.style.cssText = originalStyle;
        target.classList.remove('pdf-mode');

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;

        const imgWidthPx = canvas.width;
        const imgHeightPx = canvas.height;

        const ratioX = (pageWidth - margin * 2) / imgWidthPx;
        const ratioY = (pageHeight - margin * 2) / imgHeightPx;
        const ratio = Math.min(ratioX, ratioY);

        const renderWidth = imgWidthPx * ratio;
        const renderHeight = imgHeightPx * ratio;

        const x = (pageWidth - renderWidth) / 2;

        const y = margin;
        pdf.addImage(imgData, 'PNG', x, y, renderWidth, renderHeight);
        pdf.save(`approval_${docId}.pdf`);
      })
      .catch((err) => {
        console.error('PDF 실패', err);
        target.classList.remove('pdf-mode');
        target.style.cssText = originalStyle;
      });
  };

  if (!detailData) return <div style={{ padding: 20 }}>Loading...</div>;

  return <AddApproval readOnly={true} initialData={detailData} onExportPDF={exportPDF} />;
}
