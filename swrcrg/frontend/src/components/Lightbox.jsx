import { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const Lightbox = ({ images, index, onClose, onPrev, onNext }) => {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft')  onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onPrev, onNext]);

  if (index === null || !images[index]) return null;

  return (
    <div style={s.overlay} onClick={onClose}>
      <button onClick={(e) => { e.stopPropagation(); onClose(); }} style={s.closeBtn}>
        <X size={22} strokeWidth={2.5} color="#fff" />
      </button>

      {images.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); onPrev(); }} style={{ ...s.navBtn, left: '16px' }}>
            <ChevronLeft size={28} strokeWidth={2} color="#fff" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onNext(); }} style={{ ...s.navBtn, right: '16px' }}>
            <ChevronRight size={28} strokeWidth={2} color="#fff" />
          </button>
        </>
      )}

      <img
        src={images[index]}
        alt={`Imagen ${index + 1}`}
        style={s.img}
        onClick={(e) => e.stopPropagation()}
      />

      {images.length > 1 && (
        <div style={s.dots}>
          {images.map((_, i) => (
            <div key={i} style={{ ...s.dot, opacity: i === index ? 1 : 0.4 }} />
          ))}
        </div>
      )}
    </div>
  );
};

const s = {
  overlay:  { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, animation: 'fadeIn .15s ease' },
  closeBtn: { position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  navBtn:   { position: 'absolute', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  img:      { maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' },
  dots:     { position: 'absolute', bottom: '20px', display: 'flex', gap: '8px' },
  dot:      { width: '8px', height: '8px', borderRadius: '50%', background: '#fff' },
};

export default Lightbox;
