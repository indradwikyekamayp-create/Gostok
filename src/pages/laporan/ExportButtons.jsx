import React, { useContext } from 'react';
import { ToastContext } from '../../context/ToastContext';

const ExportButtons = ({ data, columns, filename }) => {
  const { showToast } = useContext(ToastContext);

  const handleExportExcel = () => {
    // In a real app, use xlsx library here
    console.log('Exporting Excel:', filename, columns, data);
    showToast(`File ${filename}.xlsx berhasil diexport! (Fitur segera hadir)`, 'success');
  };

  const handleExportPDF = () => {
    // In a real app, use jsPDF library here
    console.log('Exporting PDF:', filename, columns, data);
    showToast(`File ${filename}.pdf berhasil diexport! (Fitur segera hadir)`, 'success');
  };

  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      <button 
        onClick={handleExportExcel}
        style={{
          backgroundColor: '#217346',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: '500',
          fontSize: '13px'
        }}
      >
        Export Excel
      </button>
      <button 
        onClick={handleExportPDF}
        style={{
          backgroundColor: '#da251d',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: '500',
          fontSize: '13px'
        }}
      >
        Export PDF
      </button>
    </div>
  );
};

export default ExportButtons;
