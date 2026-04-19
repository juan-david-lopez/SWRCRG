import { useState } from 'react';
import { Bell, MapPin, Flag, ChevronRight, X } from 'lucide-react';
import { completeOnboarding } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';

const STEPS = [
  {
    icon: Flag,
    color: '#2563eb',
    title: '¡Bienvenido a SWRCRG!',
    desc: 'La plataforma ciudadana para reportar problemas de residuos y servicios urbanos en tu comunidad.',
  },
  {
    icon: MapPin,
    color: '#f59e0b',
    title: 'Crea reportes geolocalizados',
    desc: 'Selecciona la ubicación exacta del problema en el mapa, adjunta fotos y describe lo que ves. Es rápido y sencillo.',
  },
  {
    icon: Bell,
    color: '#16a34a',
    title: 'Recibe notificaciones',
    desc: 'Te avisaremos cuando el estado de tu reporte cambie. Puedes seguir el progreso desde "Mis reportes".',
  },
];

const OnboardingModal = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const { user, saveSession } = useAuth();
  const token = localStorage.getItem('token');

  const handleFinish = async () => {
    try {
      await completeOnboarding();
      saveSession(token, { ...user, onboarding_completado: true });
    } catch {}
    onClose();
  };

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <button onClick={handleFinish} style={s.skip} title="Saltar">
          <X size={16} strokeWidth={2} />
        </button>

        <div style={{ ...s.iconWrap, background: current.color + '18' }}>
          <Icon size={32} strokeWidth={1.5} color={current.color} />
        </div>

        <h2 style={s.title}>{current.title}</h2>
        <p style={s.desc}>{current.desc}</p>

        {/* Dots */}
        <div style={s.dots}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              onClick={() => setStep(i)}
              style={{ ...s.dot, background: i === step ? '#2563eb' : 'var(--c-border)', width: i === step ? '20px' : '8px' }}
            />
          ))}
        </div>

        <button
          onClick={isLast ? handleFinish : () => setStep((s) => s + 1)}
          style={s.btn}
        >
          {isLast ? '¡Empezar!' : 'Siguiente'}
          {!isLast && <ChevronRight size={16} strokeWidth={2.5} />}
        </button>
      </div>
    </div>
  );
};

const s = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '16px', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" },
  modal:   { background: 'var(--c-surface)', borderRadius: '20px', padding: '36px 32px', maxWidth: '400px', width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', position: 'relative', textAlign: 'center' },
  skip:    { position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-text-3)', display: 'flex', alignItems: 'center', padding: '4px' },
  iconWrap:{ width: '72px', height: '72px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' },
  title:   { margin: 0, fontSize: '20px', fontWeight: '800', color: 'var(--c-text)', lineHeight: '1.2' },
  desc:    { margin: 0, fontSize: '15px', color: 'var(--c-text-2)', lineHeight: '1.6' },
  dots:    { display: 'flex', gap: '6px', alignItems: 'center' },
  dot:     { height: '8px', borderRadius: '4px', cursor: 'pointer', transition: 'all .2s' },
  btn:     { display: 'flex', alignItems: 'center', gap: '6px', padding: '13px 32px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', marginTop: '4px' },
};

export default OnboardingModal;
