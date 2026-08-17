import React from 'react';

const ExportButtons = ({ data, columns, filename }) => {
  const handleExportExcel = () => {
    // In a real app, use xlsx library here
    console.log('Exporting Excel:', filename, columns, data);
    alert(`File ${filename}.xlsx berhasil diexport! (Mock)`);
  };

  const handleExportPDF = () => {
    // In a real app, use jsPDF library here
    console.log('Exporting PDF:', filename, columns, data);
    alert(`File ${filename}.pdf berhasil diexport! (Mock)`);
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
