import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Zap } from 'lucide-react';

const MobileScanner = ({ onScanSuccess, onClose }) => {
  const [error, setError] = useState(null);
  const [useNative, setUseNative] = useState(false);
  const videoRef = useRef(null);
  const fallbackScannerRef = useRef(null);
  
  useEffect(() => {
    let isStopping = false;
    let scanLoopId = null;
    let stream = null;

    const startScanner = async () => {
      try {
        // Cek teknologi "Google Lens" (Native BarcodeDetector API di Android)
        if ('BarcodeDetector' in window) {
          setUseNative(true);
          // Minta akses kamera secara langsung dengan spek tinggi
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 },
              // Paksa kamera untuk selalu fokus (continuous autofocus)
              advanced: [{ focusMode: "continuous" }]
            }
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.setAttribute("playsinline", true);
            await videoRef.current.play();
            
            const barcodeDetector = new window.BarcodeDetector();
            
            // Looping pembacaan secepat framerate layar (60 fps)
            const scanLoop = async () => {
              if (isStopping) return;
              
              if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                try {
                  const barcodes = await barcodeDetector.detect(videoRef.current);
                  if (barcodes.length > 0 && !isStopping) {
                    isStopping = true;
                    // Sukses dapat angkanya!
                    onScanSuccess(barcodes[0].rawValue);
                    return; 
                  }
                } catch (e) {
                  // abaikan error per frame
                }
              }
              
              if (!isStopping) {
                scanLoopId = requestAnimationFrame(scanLoop);
              }
            };
            
            scanLoop();
          }
        } else {
          // Fallback ke html5-qrcode (Untuk iOS / Desktop yang belum punya Native API)
          setUseNative(false);
          const html5QrCode = new Html5Qrcode("fallback-reader");
          fallbackScannerRef.current = html5QrCode;
          
          await html5QrCode.start(
            { facingMode: "environment" },
            { 
              fps: 15,
              disableFlip: false 
              // Full frame (tanpa qrbox) agar lebih responsif
            },
            (decodedText) => {
              if (html5QrCode && !isStopping) {
                isStopping = true;
                html5QrCode.stop().then(() => {
                  onScanSuccess(decodedText);
                }).catch(e => console.error(e));
              }
            },
            () => {} // Abaikan error per frame
          );
        }
      } catch (err) {
        console.error("Scanner Error:", err);
        setError("Gagal mengakses kamera. Mohon pastikan izin kamera telah diberikan.");
      }
    };

    startScanner();

    return () => {
      isStopping = true;
      if (scanLoopId) {
        cancelAnimationFrame(scanLoopId);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (fallbackScannerRef.current) {
        try {
          fallbackScannerRef.current.stop().catch(e => {});
        } catch(e) {}
      }
    };
  }, [onScanSuccess]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
       
       <div style={{ backgroundColor: '#fff', width: '100%', maxWidth: '400px', maxHeight: '85vh', borderRadius: '1.25rem', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
         {/* Header */}
         <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
            <span style={{ color: '#0f172a', fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={20} color="#eab308" fill="#eab308" />
              Smart Scanner
            </span>
            <button 
              onClick={onClose} 
              style={{ color: '#64748b', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
         </div>
         
         {error && (
           <div style={{ padding: '1rem', color: '#ef4444', textAlign: 'center', backgroundColor: '#fee2e2', margin: '1rem', borderRadius: '0.75rem', fontSize: '0.875rem', flexShrink: 0 }}>
             {error}
           </div>
         )}
         
         {/* Scanner Viewport */}
         <div style={{ flex: 1, minHeight: '300px', width: '100%', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
           
           {useNative ? (
             <video 
               ref={videoRef} 
               style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
               autoPlay 
               playsInline 
               muted
             />
           ) : (
             <div id="fallback-reader" style={{ width: '100%', height: '100%', objectFit: 'cover' }}></div>
           )}

           {/* AI Scanning UI Overlay */}
           <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
             <div style={{ width: '280px', height: '180px', position: 'relative' }}>
               {/* Sudut-sudut bingkai ala Google Lens */}
               <div style={{ position: 'absolute', top: 0, left: 0, width: '30px', height: '30px', borderTop: '4px solid #3b82f6', borderLeft: '4px solid #3b82f6', borderTopLeftRadius: '1rem' }}></div>
               <div style={{ position: 'absolute', top: 0, right: 0, width: '30px', height: '30px', borderTop: '4px solid #3b82f6', borderRight: '4px solid #3b82f6', borderTopRightRadius: '1rem' }}></div>
               <div style={{ position: 'absolute', bottom: 0, left: 0, width: '30px', height: '30px', borderBottom: '4px solid #3b82f6', borderLeft: '4px solid #3b82f6', borderBottomLeftRadius: '1rem' }}></div>
               <div style={{ position: 'absolute', bottom: 0, right: 0, width: '30px', height: '30px', borderBottom: '4px solid #3b82f6', borderRight: '4px solid #3b82f6', borderBottomRightRadius: '1rem' }}></div>
               
               {/* Garis Scan Laser */}
               <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '2px', backgroundColor: '#3b82f6', boxShadow: '0 0 12px 2px rgba(59, 130, 246, 0.7)', animation: 'scanLineAnim 2.5s infinite ease-in-out' }}></div>
             </div>
           </div>
         </div>

         {/* Footer Helper */}
         <div style={{ padding: '1.5rem', textAlign: 'center', backgroundColor: '#f8fafc', flexShrink: 0, borderTop: '1px solid #e2e8f0' }}>
           <p style={{ color: '#0f172a', fontWeight: '600', fontSize: '1rem', margin: '0 0 0.25rem 0' }}>
             Mesin AI Aktif
           </p>
           <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
             Arahkan kamera ke barcode/QR. Sistem akan otomatis mendeteksi dengan super cepat.
           </p>
         </div>
       </div>
       
       <style dangerouslySetInnerHTML={{__html: `
         @keyframes scanLineAnim {
           0% { top: 10%; opacity: 0; }
           15% { opacity: 1; }
           85% { opacity: 1; }
           100% { top: 90%; opacity: 0; }
         }
       `}} />
    </div>
  );
};

export default MobileScanner;
