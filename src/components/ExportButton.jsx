import React, { useState } from 'react';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import { FileImage, FileText } from 'lucide-react';

export default function ExportButton({ canvasRef }) {
  const [isExporting, setIsExporting] = useState(false);

  // Helper to format timestamp in English (en-US)
  const formatTimestamp = () => {
    const now = new Date();
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
    // Format: Sunday, April 12, 2026 08:29 PM
    return `Created Date : ${now.toLocaleString('en-US', options)}`;
  };

  // Helper to add watermark and timestamp to an image via Canvas API
  const addOverlayToImage = (dataUrl, timestamp) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // 1. Draw original captured image
          ctx.drawImage(img, 0, 0);
          
          // 2. Add Timestamp (Top Right Corner)
          // Scale font size based on image width for responsiveness
          const fontSize = Math.max(14, Math.floor(canvas.width / 80));
          ctx.font = `${fontSize}px Inter, Arial, sans-serif`;
          ctx.fillStyle = 'rgba(31, 41, 55, 0.8)'; // Dark gray
          ctx.textAlign = 'right';
          ctx.fillText(timestamp, canvas.width - (canvas.width * 0.02), fontSize + (canvas.height * 0.02));
          
          // 3. Add Watermark (Diagonal Center)
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate(-Math.PI / 6); // Slighter diagonal (30 degrees)
          const watermarkSize = Math.max(40, Math.floor(canvas.width / 12));
          ctx.font = `bold ${watermarkSize}px Inter, Arial, sans-serif`;
          ctx.fillStyle = 'rgba(156, 163, 175, 0.12)'; // Subtle gray
          ctx.textAlign = 'center';
          ctx.fillText('vsm-lean.com', 0, 0);
          ctx.restore();
          
          resolve(canvas.toDataURL('image/png', 1.0));
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = (err) => reject(err);
      img.src = dataUrl;
    });
  };

  const exportPNG = async () => {
    if (!canvasRef.current || isExporting) return;
    try {
      setIsExporting(true);
      const filter = (node) => {
        if (node.classList && node.classList.contains('no-export')) return false;
        return true;
      };
      
      // Capture the VSM map area
      const originalDataUrl = await htmlToImage.toPng(canvasRef.current, { 
        pixelRatio: 2, 
        filter,
        backgroundColor: '#ffffff' 
      });
      
      // Process with watermark and timestamp
      const timestamp = formatTimestamp();
      const processedDataUrl = await addOverlayToImage(originalDataUrl, timestamp);
      
      const link = document.createElement('a');
      link.download = `vsm-map-${new Date().getTime()}.png`;
      link.href = processedDataUrl;
      link.click();
    } catch (error) {
      console.error('Error exporting PNG:', error);
      alert('Failed to export PNG. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportPDF = async () => {
    if (!canvasRef.current || isExporting) return;
    try {
      setIsExporting(true);
      const filter = (node) => {
        if (node.classList && node.classList.contains('no-export')) return false;
        return true;
      };
      
      // Capture and process (consistent with PNG)
      const originalDataUrl = await htmlToImage.toPng(canvasRef.current, { 
        pixelRatio: 2, 
        filter,
        backgroundColor: '#ffffff'
      });
      
      const timestamp = formatTimestamp();
      const processedDataUrl = await addOverlayToImage(originalDataUrl, timestamp);
      
      // Create landscape PDF
      const pdf = new jsPDF('l', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(processedDataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      // Handle page overflow if the VSM is very tall
      const pageHeight = pdf.internal.pageSize.getHeight();
      let finalWidth = pdfWidth;
      let finalHeight = pdfHeight;
      
      if (pdfHeight > pageHeight - 20) {
        finalHeight = pageHeight - 20;
        finalWidth = (imgProps.width * finalHeight) / imgProps.height;
      }
      
      const xOffset = (pdfWidth - finalWidth) / 2;
      
      pdf.addImage(processedDataUrl, 'PNG', xOffset, 10, finalWidth, finalHeight);
      pdf.save(`vsm-map-${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-4 mt-4">
      <button
        onClick={exportPNG}
        disabled={isExporting}
        className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-xl hover:bg-slate-900 transition-all font-medium disabled:opacity-50 shadow-sm hover:shadow-md active:scale-95"
      >
        <FileImage size={18} />
        {isExporting ? 'Processing...' : 'Download PNG'}
      </button>

      <button
        onClick={exportPDF}
        disabled={isExporting}
        className="flex items-center gap-2 bg-rose-600 text-white px-5 py-2.5 rounded-xl hover:bg-rose-700 transition-all font-medium disabled:opacity-50 shadow-sm hover:shadow-md active:scale-95"
      >
        <FileText size={18} />
        {isExporting ? 'Processing...' : 'Download PDF'}
      </button>
    </div>
  );
}
