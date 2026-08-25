import React, { useContext } from 'react';
import { ToastContext } from '../../context/ToastContext';
import { FileSpreadsheet, FileText } from 'lucide-react';

const ExportButtons = ({ data, columns, filename }) => {
  const { showToast } = useContext(ToastContext);

  const handleExportExcel = () => {
    console.log('Exporting Excel:', filename, columns, data);
    showToast(`File ${filename}.xlsx berhasil diexport! (Fitur segera hadir)`, 'success');
  };

  const handleExportPDF = () => {
    console.log('Exporting PDF:', filename, columns, data);
    showToast(`File ${filename}.pdf berhasil diexport! (Fitur segera hadir)`, 'success');
  };

  const btnStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    padding: '0.375rem 0.875rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '0.8125rem',
    transition: 'all 0.2s ease',
    color: '#334155',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
  };

  const handleHover = (e, color) => {
    e.currentTarget.style.borderColor = color;
    e.currentTarget.style.backgroundColor = '#f8fafc';
  };

  const handleMouseOut = (e) => {
    e.currentTarget.style.borderColor = '#e2e8f0';
    e.currentTarget.style.backgroundColor = '#fff';
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <button 
        style={btnStyle}
        onMouseOver={(e) => handleHover(e, '#10b981')}
        onMouseOut={handleMouseOut}
        onClick={handleExportExcel}
        title="Export to Excel"
      >
        <FileSpreadsheet size={16} color="#10b981" />
        <span>Export Excel</span>
      </button>
      
      <button 
        style={btnStyle}
        onMouseOver={(e) => handleHover(e, '#ef4444')}
        onMouseOut={handleMouseOut}
        onClick={handleExportPDF}
        title="Export to PDF"
      >
        <FileText size={16} color="#ef4444" />
        <span>Export PDF</span>
      </button>
    </div>
  );
};

export default ExportButtons;
