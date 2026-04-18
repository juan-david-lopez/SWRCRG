import { useState, useEffect } from 'react';
import { User, Mail, Phone, Save, Lock, Eye, EyeOff, FileText, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateMe, changePassword } from '../services/auth.service';
import { getMyReports } from '../services/report.service';
import { toast } from '../components/Toast';
import { RowSkeleton } from '../components/Skeleton';
import { Link } from 'react-router-dom';
import { STATUS_COLORS } from '../constants/reportStatus';

const ProfilePage = () => {
  const { user, saveSession } = useAuth();
  const token = localStorage.getItem('token');

  const [form, setForm]       = useState({ nombre: user?.nombre ?? '', apellido: user?.apellido ?? '', telefono: user?.telefono ?? '' });
  const [saving, setSaving]   = useState(false);
  const [formErr, setFormErr] = useState('');

  const [pwd, setPwd]         = useState({ actual: '', nueva: '', confirmar: '' });
  const [showPwd, setShowPwd] = useState({ actual: false, nueva: false, confirmar: false });
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdErr, setPwdErr]   = useState('');

  const [myReports, setMyReports]   = useState([]);
  const [loadingR, setLoadingR]     = useState(true);

  useEffect(() => {
    getMyReports()
      .then(({ reportes }) => setMyReports(reportes ?? []))
      .catch(() => {})
      .finally(() => setLoadingR(false));
  }, []);

  const STATUS_LABEL = { pendiente: 'Pendiente', en_proceso: 'En proceso', resuelto: 'Resuelto' };
  const formatDate = (iso) => new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

  const handleFormChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setFormErr(''); };
  const handlePwdChange  = (e) => { setPwd({ ...pwd,  [e.target.name]: e.target.value  }); setPwdErr('');  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.apellido.trim()) return setFormErr('Nombre y apellido son obligatorios');
    setSaving(true);
    try {
      const { user: updated } = await updateMe(form);
      saveSession(token, { ...user, nombre: updated.nombre, apellido: updated.apellido, telefono: updated.telefono });
      toast.success('Perfil actualizado correctamente');
    } catch (err) {
      setFormErr(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwd.nueva !== pwd.confirmar) return setPwdErr('Las contraseñas nuevas no coinciden');
    setSavingPwd(true);
    try {
      await changePassword({ contrasenaActual: pwd.actual, contrasenaNueva: pwd.nueva });
      setPwd({ actual: '', nueva: '', confirmar: '' });
      toast.success('Contraseña actualizada correctamente');
    } catch (err) {
      setPwdErr(err.message);
    } finally {
      setSavingPwd(false);
    }
  };

  const initials = `${user?.nombre?.[0] ?? ''}${user?.apellido?.[0] ?? ''}`.toUpperCase();

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.header}>
          <h1 style={s.title}>Mi perfil</h1>
          <p style={s.subtitle}>Gestiona tu información personal</p>
        </div>

        {/* ── Información personal ── */}
        <div style={s.card}>
          <div style={s.avatarSection}>
            <div style={s.avatar}>{initials}</div>
            <div>
              <p style={s.avatarName}>{user?.nombre} {user?.apellido}</p>
              <span style={s.rolBadge}>{user?.rol === 'administrador' ? 'Administrador' : 'Ciudadano'}</span>
            </div>
          </div>
          <div style={s.divider} />
          <form onSubmit={handleSaveProfile} style={s.form}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Correo electrónico</label>
              <div style={{ ...s.inputWrap, background: '#f8fafc' }}>
                <Mail size={16} strokeWidth={1.8} color="#94a3b8" style={{ flexShrink: 0 }} />
                <input value={user?.correo ?? ''} disabled style={{ ...s.input, color: '#94a3b8' }} />
              </div>
              <span style={s.hint}>El correo no se puede modificar</span>
            </div>
            <div style={s.row}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Nombre</label>
                <div style={s.inputWrap}>
                  <User size={16} strokeWidth={1.8} color="#94a3b8" style={{ flexShrink: 0 }} />
                  <input name="nombre" value={form.nombre} onChange={handleFormChange} placeholder="Tu nombre" style={s.input} />
                </div>
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Apellido</label>
                <div style={s.inputWrap}>
                  <User size={16} strokeWidth={1.8} color="#94a3b8" style={{ flexShrink: 0 }} />
                  <input name="apellido" value={form.apellido} onChange={handleFormChange} placeholder="Tu apellido" style={s.input} />
                </div>
              </div>
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Teléfono <span style={s.optional}>(opcional)</span></label>
              <div style={s.inputWrap}>
                <Phone size={16} strokeWidth={1.8} color="#94a3b8" style={{ flexShrink: 0 }} />
                <input name="telefono" value={form.telefono} onChange={handleFormChange} placeholder="+57 300 000 0000" style={s.input} />
              </div>
            </div>
            {formErr && <p style={s.errorBox}>{formErr}</p>}
            <button type="submit" disabled={saving} style={{ ...s.btn, opacity: saving ? 0.7 : 1 }}>
              <Save size={15} strokeWidth={2} />
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        </div>

        {/* ── Cambiar contraseña ── */}
        <div style={s.card}>
          <h2 style={s.cardTitle}>Cambiar contraseña</h2>
          <div style={s.divider} />
          <form onSubmit={handleChangePassword} style={s.form}>
            {[
              { name: 'actual',    label: 'Contraseña actual',    key: 'actual'    },
              { name: 'nueva',     label: 'Nueva contraseña',     key: 'nueva'     },
              { name: 'confirmar', label: 'Confirmar contraseña', key: 'confirmar' },
            ].map(({ name, label, key }) => (
              <div key={name} style={s.fieldGroup}>
                <label style={s.label}>{label}</label>
                <div style={s.inputWrap}>
                  <Lock size={16} strokeWidth={1.8} color="#94a3b8" style={{ flexShrink: 0 }} />
                  <input
                    name={name}
                    type={showPwd[key] ? 'text' : 'password'}
                    value={pwd[name]}
                    onChange={handlePwdChange}
                    placeholder="••••••••"
                    style={s.input}
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowPwd((p) => ({ ...p, [key]: !p[key] }))} style={s.eyeBtn}>
                    {showPwd[key] ? <EyeOff size={15} color="#94a3b8" /> : <Eye size={15} color="#94a3b8" />}
                  </button>
                </div>
              </div>
            ))}
            {pwdErr && <p style={s.errorBox}>{pwdErr}</p>}
            <button type="submit" disabled={savingPwd || !pwd.actual || !pwd.nueva || !pwd.confirmar} style={{ ...s.btn, opacity: (savingPwd || !pwd.actual || !pwd.nueva || !pwd.confirmar) ? 0.6 : 1 }}>
              <Lock size={15} strokeWidth={2} />
              {savingPwd ? 'Actualizando...' : 'Cambiar contraseña'}
            </button>
          </form>
        </div>

        {/* ── Historial de actividad ── */}
        <div style={s.card}>
          <h2 style={s.cardTitle}>Mi actividad</h2>
          <div style={s.divider} />
          {/* Mini stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
            {[
              { icon: FileText,    label: 'Total',      value: myReports.length,                                                    color: '#2563eb' },
              { icon: Clock,       label: 'Pendientes', value: myReports.filter((r) => r.estado?.nombre === 'pendiente').length,    color: '#f59e0b' },
              { icon: CheckCircle, label: 'Resueltos',  value: myReports.filter((r) => r.estado?.nombre === 'resuelto').length,     color: '#16a34a' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} style={{ textAlign: 'center', padding: '14px', background: '#f8fafc', borderRadius: '10px' }}>
                <Icon size={18} strokeWidth={2} color={color} style={{ marginBottom: '6px' }} />
                <p style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '0 0 2px' }}>{value}</p>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>{label}</p>
              </div>
            ))}
          </div>
          {/* Lista reciente */}
          {loadingR ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Array.from({ length: 3 }).map((_, i) => <RowSkeleton key={i} />)}
            </div>
          ) : myReports.length === 0 ? (
            <p style={{ fontSize: '14px', color: '#94a3b8', textAlign: 'center' }}>Aún no has creado reportes.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {myReports.slice(0, 5).map((r) => {
                const badge = STATUS_COLORS[r.estado?.nombre] || {};
                return (
                  <Link key={r.id} to={`/reports/${r.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#f8fafc', borderRadius: '8px', textDecoration: 'none', gap: '12px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.titulo}</p>
                      <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>{formatDate(r.fecha_reporte)}</p>
                    </div>
                    <span style={{ ...badge, fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                      {STATUS_LABEL[r.estado?.nombre] ?? r.estado?.nombre}
                    </span>
                  </Link>
                );
              })}
              {myReports.length > 5 && (
                <Link to="/mis-reportes" style={{ fontSize: '13px', color: '#2563eb', fontWeight: '600', textDecoration: 'none', textAlign: 'center', paddingTop: '4px' }}>
                  Ver todos ({myReports.length}) →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const s = {
  page:         { minHeight: '100vh', background: '#f8fafc', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" },
  container:    { maxWidth: '600px', margin: '0 auto', padding: '40px 20px 80px', display: 'flex', flexDirection: 'column', gap: '24px' },
  header:       { marginBottom: '4px' },
  title:        { fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px' },
  subtitle:     { fontSize: '15px', color: '#64748b', margin: 0 },
  card:         { background: '#fff', borderRadius: '12px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
  cardTitle:    { margin: '0 0 16px', fontSize: '17px', fontWeight: '700', color: '#0f172a' },
  avatarSection:{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' },
  avatar:       { width: '56px', height: '56px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '700', flexShrink: 0 },
  avatarName:   { margin: '0 0 6px', fontSize: '17px', fontWeight: '700', color: '#0f172a' },
  rolBadge:     { fontSize: '12px', fontWeight: '600', color: '#2563eb', background: '#eff6ff', padding: '3px 10px', borderRadius: '20px' },
  divider:      { height: '1px', background: '#f1f5f9', margin: '0 0 20px' },
  form:         { display: 'flex', flexDirection: 'column', gap: '16px' },
  row:          { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  fieldGroup:   { display: 'flex', flexDirection: 'column', gap: '6px' },
  label:        { fontSize: '13px', fontWeight: '600', color: '#0f172a' },
  optional:     { fontWeight: '400', color: '#94a3b8' },
  inputWrap:    { display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', background: '#fff' },
  input:        { flex: 1, border: 'none', outline: 'none', fontSize: '14px', color: '#0f172a', background: 'transparent', fontFamily: 'inherit' },
  eyeBtn:       { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 },
  hint:         { fontSize: '12px', color: '#94a3b8' },
  errorBox:     { fontSize: '13px', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', margin: 0 },
  btn:          { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' },
};

export default ProfilePage;
