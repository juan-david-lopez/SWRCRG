import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, MapPin, Calendar, Flag, ImageOff, Pencil, Trash2, X, Check, XCircle, RotateCcw } from 'lucide-react';
import { getMyReports, editReport, deleteReport, reenviarReporte } from '../../services/report.service';
import { useAuth } from '../../context/AuthContext';
import { STATUS_COLORS, STATUS_LABEL } from '../../constants/reportStatus';
import { RowSkeleton } from '../../components/Skeleton';
import ConfirmModal from '../../components/ConfirmModal';
import { toast } from '../../components/Toast';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

const STATUS_LABEL_LOCAL = STATUS_LABEL; // alias para compatibilidad

/* ── Card horizontal ── */
const MyReportCard = ({ report, onEdit, onDelete, onReenviar }) => {
  const estado = report.estado?.nombre ?? '';
  const badge  = STATUS_COLORS[estado] || {};
  const rawImg = report.imagenes?.[0]?.url_imagen;
  const img    = rawImg ? `${API_BASE}${rawImg}` : null;
  const dir    = report.direccion_referencia;
  const canEdit = estado === 'pendiente';
  const isRechazado = estado === 'rechazado';

  return (
    <div style={s.card}>
      <div style={s.thumb}>
        {img
          ? <img src={img} alt={report.titulo} style={s.thumbImg} />
          : <div style={s.thumbPlaceholder}><ImageOff size={24} strokeWidth={1.2} color="var(--c-text-3)" /></div>
        }
      </div>
      <div style={s.cardBody}>
        <div style={s.cardTop}>
          <h3 style={s.cardTitle}>{report.titulo}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {estado && <span style={{ ...s.badge, ...badge }}>{STATUS_LABEL[estado] ?? estado}</span>}
            {canEdit && (
              <button onClick={() => onEdit(report)} style={s.iconActionBtn} title="Editar">
                <Pencil size={13} strokeWidth={2} color="var(--c-text-2)" />
              </button>
            )}
            <button onClick={() => onDelete(report)} style={s.iconActionBtn} title="Eliminar">
              <Trash2 size={13} strokeWidth={2} color="#ef4444" />
            </button>
          </div>
        </div>
        <p style={s.cardDesc}>{report.descripcion}</p>

        {/* Banner de rechazo */}
        {isRechazado && report.motivo_rechazo && (
          <div style={s.rechazoBanner}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <XCircle size={14} strokeWidth={2} color="#991b1b" />
              <p style={s.rechazoTitle}>Motivo de rechazo:</p>
            </div>
            <p style={s.rechazoMsg}>{report.motivo_rechazo}</p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
              <button onClick={() => onReenviar(report)} style={s.reenviarBtn}>
                <RotateCcw size={13} strokeWidth={2} />
                Reenviar para revisión
              </button>
              <button onClick={() => onDelete(report)} style={s.eliminarBtn}>
                Eliminar reporte
              </button>
            </div>
          </div>
        )}
        {report.categoria && (
          <span style={s.categoria}>{report.categoria.nombre.replace(/_/g, ' ')}</span>
        )}
        <div style={s.cardFooter}>
          <div style={s.metaRow}>
            {dir && (
              <span style={s.metaItem}><MapPin size={12} strokeWidth={2} color="var(--c-text-3)" />{dir}</span>
            )}
            <span style={s.metaItem}>
              <Calendar size={12} strokeWidth={2} color="var(--c-text-3)" />
              {formatDate(report.fecha_reporte ?? report.created_at)}
            </span>
          </div>
          <Link to={`/reports/${report.id}`} style={s.detailLink}>Ver detalle →</Link>
        </div>
      </div>
    </div>
  );
};

/* ── Edit inline form ── */
const EditModal = ({ report, onSave, onCancel, isReenvio = false }) => {
  const [form, setForm] = useState({ titulo: report.titulo, descripcion: report.descripcion, direccion_referencia: report.direccion_referencia ?? '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(report.id, form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={em.overlay} onClick={onCancel}>
      <form style={em.modal} onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
        <div style={em.header}>
          <h3 style={em.title}>{isReenvio ? 'Editar y reenviar reporte' : 'Editar reporte'}</h3>
          <button type="button" onClick={onCancel} style={em.closeBtn}><X size={18} strokeWidth={2} /></button>
        </div>
        {isReenvio && (
          <p style={em.reenvioHint}>Corrige los campos necesarios y luego reenvía para revisión.</p>
        )}
        {[
          { name: 'titulo',               label: 'Título',              rows: 1 },
          { name: 'descripcion',          label: 'Descripción',         rows: 3 },
          { name: 'direccion_referencia', label: 'Dirección referencia', rows: 1, optional: true },
        ].map(({ name, label, rows, optional }) => (
          <div key={name} style={em.field}>
            <label style={em.label}>{label}{optional && <span style={em.opt}> (opcional)</span>}</label>
            {rows > 1
              ? <textarea name={name} value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} rows={rows} style={em.input} />
              : <input    name={name} value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} style={em.input} />
            }
          </div>
        ))}
        <div style={em.actions}>
          <button type="button" onClick={onCancel} style={em.cancelBtn}>Cancelar</button>
          <button type="submit" disabled={saving} style={{ ...em.saveBtn, opacity: saving ? 0.7 : 1 }}>
            {isReenvio ? <RotateCcw size={15} strokeWidth={2.5} /> : <Check size={15} strokeWidth={2.5} />}
            {saving ? (isReenvio ? 'Reenviando...' : 'Guardando...') : (isReenvio ? 'Guardar y reenviar' : 'Guardar')}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ── Empty state ── */
const EmptyState = ({ onCreateClick }) => (
  <div style={s.emptyWrap}>
    <div style={s.emptyCard}>
      <div style={s.emptyIcon}><Flag size={28} strokeWidth={2} color="var(--c-text)" /></div>
      <h3 style={s.emptyTitle}>Sin reportes aún</h3>
      <p style={s.emptyDesc}>No has creado ningún reporte todavía.</p>
      <button onClick={onCreateClick} style={s.emptyBtn}>
        <Plus size={16} strokeWidth={2.5} />
        Crear tu primer reporte
      </button>
    </div>
  </div>
);

/* ── Main ── */
const MyReportsPage = () => {
  const { user }              = useAuth();
  const navigate              = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [editing, setEditing] = useState(null);
  const [reenvioTarget, setReenvioTarget] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [reenviando, setReenviando] = useState(null);

  useEffect(() => {
    getMyReports()
      .then(({ reportes }) => setReports(reportes))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveEdit = async (id, data) => {
    const { reporte } = await editReport(id, data);
    setReports((prev) => prev.map((r) => r.id === id ? { ...r, ...reporte } : r));
    setEditing(null);
    toast.success('Reporte actualizado');
  };

  const handleReenviar = (report) => {
    setReenvioTarget(report);
  };

  const handleSaveReenvio = async (id, data) => {
    setReenviando(id);
    try {
      await editReport(id, data);
      const { reporte } = await reenviarReporte(id);
      setReports((prev) => prev.map((r) => r.id === id ? { ...r, ...reporte, estado: reporte.estado, motivo_rechazo: null } : r));
      setReenvioTarget(null);
      toast.success('Reporte editado y reenviado para revisión');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setReenviando(null);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteReport(deleting.id);
      setReports((prev) => prev.filter((r) => r.id !== deleting.id));
      toast.success('Reporte eliminado');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const initials = user ? `${user.nombre?.[0] ?? ''}${user.apellido?.[0] ?? ''}`.toUpperCase() : '';

  return (
    <div style={s.page}>
      <div style={s.content}>
        {loading && (
          <div style={s.list}>
            {Array.from({ length: 3 }).map((_, i) => <RowSkeleton key={i} />)}
          </div>
        )}
        {error && <p style={{ ...s.center, color: '#dc2626' }}>{error}</p>}

        {!loading && !error && reports.length === 0 && (
          <EmptyState onCreateClick={() => navigate('/reports/create')} />
        )}

        {!loading && !error && reports.length > 0 && (
          <>
            <h2 style={s.sectionTitle}>Tus reportes <span style={s.count}>{reports.length}</span></h2>
            <div style={s.list}>
              {reports.map((r) => (
                <MyReportCard key={r.id} report={r} onEdit={setEditing} onDelete={setDeleting} onReenviar={handleReenviar} />
              ))}
            </div>
          </>
        )}
      </div>

      {editing && (
        <EditModal report={editing} onSave={handleSaveEdit} onCancel={() => setEditing(null)} />
      )}

      {reenvioTarget && (
        <EditModal report={reenvioTarget} onSave={handleSaveReenvio} onCancel={() => setReenvioTarget(null)} isReenvio />
      )}

      <ConfirmModal
        open={!!deleting}
        title="Eliminar reporte"
        message={`¿Seguro que quieres eliminar "${deleting?.titulo}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
};

const s = {
  page:        { minHeight: '100vh', background: 'var(--c-bg)', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" },
  content:     { maxWidth: '720px', width: '100%', margin: '0 auto', padding: '28px 20px 60px' },
  sectionTitle:{ fontSize: '20px', fontWeight: '700', color: 'var(--c-text)', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '10px' },
  count:       { fontSize: '13px', fontWeight: '600', background: 'var(--c-bg)', color: 'var(--c-text-2)', padding: '2px 10px', borderRadius: '20px' },
  list:        { display: 'flex', flexDirection: 'column', gap: '16px' },
  center:      { textAlign: 'center', marginTop: '80px', color: 'var(--c-text-3)' },
  card:        { background: 'var(--c-surface)', borderRadius: '12px', display: 'flex', overflow: 'hidden', boxShadow: '0 2px 12px var(--c-shadow)' },
  thumb:       { width: '140px', flexShrink: 0 },
  thumbImg:    { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  thumbPlaceholder: { width: '100%', height: '100%', minHeight: '120px', background: 'var(--c-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardBody:    { flex: 1, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '8px' },
  cardTop:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' },
  cardTitle:   { margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--c-text)', lineHeight: '1.3' },
  badge:       { fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', whiteSpace: 'nowrap', flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.4px' },
  iconActionBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '6px' },
  cardDesc:    { margin: 0, fontSize: '13px', color: 'var(--c-text-2)', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  categoria:   { fontSize: '12px', fontWeight: '600', color: '#7c3aed', background: '#ede9fe', padding: '3px 10px', borderRadius: '20px', alignSelf: 'flex-start' },
  cardFooter:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '4px' },
  metaRow:     { display: 'flex', flexDirection: 'column', gap: '3px' },
  metaItem:    { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--c-text-3)' },
  detailLink:  { fontSize: '13px', fontWeight: '700', color: '#2563eb', textDecoration: 'none', whiteSpace: 'nowrap' },
  rechazoBanner: { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '4px' },
  rechazoTitle:  { margin: 0, fontSize: '12px', fontWeight: '700', color: '#991b1b' },
  rechazoMsg:    { margin: 0, fontSize: '13px', color: '#7f1d1d', lineHeight: '1.5' },
  reenviarBtn:   { display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' },
  eliminarBtn:   { padding: '7px 14px', background: 'none', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' },
  emptyWrap:   { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' },
  emptyCard:   { background: 'var(--c-surface)', borderRadius: '20px', padding: '48px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', maxWidth: '360px', width: '100%', boxShadow: '0 4px 24px var(--c-shadow)' },
  emptyIcon:   { width: '64px', height: '64px', borderRadius: '50%', background: 'var(--c-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' },
  emptyTitle:  { fontSize: '20px', fontWeight: '700', color: 'var(--c-text)', margin: 0 },
  emptyDesc:   { fontSize: '14px', color: 'var(--c-text-2)', margin: 0, textAlign: 'center' },
  emptyBtn:    { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', padding: '13px 32px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' },
};

const em = {
  overlay:   { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" },
  modal:     { background: 'var(--c-surface)', borderRadius: '16px', padding: '24px', maxWidth: '480px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', gap: '14px' },
  header:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title:     { margin: 0, fontSize: '17px', fontWeight: '700', color: 'var(--c-text)' },
  closeBtn:  { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--c-text-2)', padding: '4px' },
  field:     { display: 'flex', flexDirection: 'column', gap: '6px' },
  label:     { fontSize: '13px', fontWeight: '600', color: 'var(--c-text)' },
  opt:       { fontWeight: '400', color: 'var(--c-text-3)' },
  input:     { border: '1px solid var(--c-border)', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', fontFamily: 'inherit', color: 'var(--c-text)', outline: 'none', resize: 'vertical' },
  actions:   { display: 'flex', gap: '10px', marginTop: '4px' },
  cancelBtn: { flex: 1, padding: '11px', borderRadius: '8px', border: '1px solid var(--c-border)', background: 'var(--c-surface)', fontSize: '14px', fontWeight: '600', color: 'var(--c-text-2)', cursor: 'pointer', fontFamily: 'inherit' },
  saveBtn:   { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '11px', borderRadius: '8px', border: 'none', background: '#2563eb', fontSize: '14px', fontWeight: '600', color: '#fff', cursor: 'pointer', fontFamily: 'inherit' },
  reenvioHint: { margin: 0, fontSize: '13px', color: '#7f1d1d', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px', lineHeight: '1.5' },
};

export default MyReportsPage;
