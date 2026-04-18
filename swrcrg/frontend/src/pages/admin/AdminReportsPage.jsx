import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReports, updateReportStatus, exportReportsCSV } from '../../services/report.service';
import { getUsuarios, toggleUsuarioActivo, changeUsuarioRol } from '../../services/auth.service';
import { REPORT_STATUSES, STATUS_COLORS } from '../../constants/reportStatus';
import { MapPin, Calendar, User, ChevronDown, Search, X, BarChart2, Users, FileText, CheckCircle, Download } from 'lucide-react';
import { RowSkeleton } from '../../components/Skeleton';
import ConfirmModal from '../../components/ConfirmModal';
import { toast } from '../../components/Toast';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
const formatDate = (iso) => new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
const STATUS_LABEL = { pendiente: 'Pendiente', en_proceso: 'En proceso', resuelto: 'Resuelto' };

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div style={s.statCard}>
    <div style={{ ...s.statIcon, background: color + '18' }}>
      <Icon size={20} strokeWidth={2} color={color} />
    </div>
    <div>
      <p style={s.statValue}>{value}</p>
      <p style={s.statLabel}>{label}</p>
    </div>
  </div>
);

const AdminReportsPage = () => {
  const navigate = useNavigate();
  const [tab, setTab]                   = useState('reports'); // 'reports' | 'users' | 'stats'
  const [reports, setReports]           = useState([]);
  const [usuarios, setUsuarios]         = useState([]);
  const [loadingR, setLoadingR]         = useState(true);
  const [loadingU, setLoadingU]         = useState(false);
  const [updating, setUpdating]         = useState(null);
  const [observaciones, setObservaciones] = useState({});
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchUsers, setSearchUsers]   = useState('');
  const [confirmToggle, setConfirmToggle] = useState(null);
  const [exporting, setExporting]       = useState(false);

  useEffect(() => {
    getReports()
      .then(({ reportes }) => setReports(reportes))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoadingR(false));
  }, []);

  useEffect(() => {
    if (tab === 'users' && usuarios.length === 0) {
      setLoadingU(true);
      getUsuarios()
        .then(({ usuarios }) => setUsuarios(usuarios))
        .catch((err) => toast.error(err.message))
        .finally(() => setLoadingU(false));
    }
  }, [tab]);

  const handleStatusChange = async (id, estado) => {
    setUpdating(id);
    try {
      const { reporte } = await updateReportStatus(id, estado, observaciones[id] || '');
      setReports((prev) => prev.map((r) => r.id === id ? { ...r, estado: reporte.estado } : r));
      setObservaciones((prev) => ({ ...prev, [id]: '' }));
      toast.success('Estado actualizado');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdating(null);
    }
  };

  const handleToggleActivo = async () => {
    try {
      const { user } = await toggleUsuarioActivo(confirmToggle.id);
      setUsuarios((prev) => prev.map((u) => u.id === user.id ? { ...u, activo: user.activo } : u));
      toast.success(user.activo ? 'Usuario activado' : 'Usuario desactivado');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setConfirmToggle(null);
    }
  };

  const handleChangeRol = async (id, rol) => {
    try {
      const { user } = await changeUsuarioRol(id, rol);
      setUsuarios((prev) => prev.map((u) => u.id === user.id ? { ...u, rol: { nombre: rol } } : u));
      toast.success('Rol actualizado');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      await exportReportsCSV();
      toast.success('CSV descargado');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setExporting(false);
    }
  };

  // Stats
  const total      = reports.length;
  const pendientes = reports.filter((r) => r.estado?.nombre === 'pendiente').length;
  const enProceso  = reports.filter((r) => r.estado?.nombre === 'en_proceso').length;
  const resueltos  = reports.filter((r) => r.estado?.nombre === 'resuelto').length;

  // Stats por categoría
  const catStats = useMemo(() => {
    const map = {};
    reports.forEach((r) => {
      const nombre = r.categoria?.nombre?.replace(/_/g, ' ') || 'Sin categoría';
      map[nombre] = (map[nombre] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [reports]);
  const maxCat = catStats[0]?.[1] || 1;

  // Filtered reports
  const filtered = useMemo(() => reports.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.titulo?.toLowerCase().includes(q) || r.usuario?.nombre?.toLowerCase().includes(q);
    const matchStatus = !filterStatus || r.estado?.nombre === filterStatus;
    return matchSearch && matchStatus;
  }), [reports, search, filterStatus]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    const q = searchUsers.toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter((u) =>
      u.nombre?.toLowerCase().includes(q) ||
      u.apellido?.toLowerCase().includes(q) ||
      u.correo?.toLowerCase().includes(q)
    );
  }, [usuarios, searchUsers]);

  return (
    <div style={s.page}>
      <div style={s.container}>
        {/* Header */}
        <div style={s.pageHeader}>
          <h1 style={s.pageTitle}>Panel de administración</h1>
        </div>

        {/* Stats */}
        <div style={s.statsGrid}>
          <StatCard icon={FileText}    label="Total reportes" value={total}      color="#2563eb" />
          <StatCard icon={BarChart2}   label="Pendientes"     value={pendientes} color="#f59e0b" />
          <StatCard icon={ChevronDown} label="En proceso"     value={enProceso}  color="#3b82f6" />
          <StatCard icon={CheckCircle} label="Resueltos"      value={resueltos}  color="#16a34a" />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={s.tabs}>
            <button onClick={() => setTab('reports')} style={{ ...s.tab, ...(tab === 'reports' ? s.tabActive : {}) }}>
              <FileText size={15} strokeWidth={2} /> Reportes
            </button>
            <button onClick={() => setTab('stats')} style={{ ...s.tab, ...(tab === 'stats' ? s.tabActive : {}) }}>
              <BarChart2 size={15} strokeWidth={2} /> Estadísticas
            </button>
            <button onClick={() => setTab('users')} style={{ ...s.tab, ...(tab === 'users' ? s.tabActive : {}) }}>
              <Users size={15} strokeWidth={2} /> Usuarios
            </button>
          </div>
          <button onClick={handleExportCSV} disabled={exporting} style={s.exportBtn}>
            <Download size={14} strokeWidth={2} />
            {exporting ? 'Exportando...' : 'Exportar CSV'}
          </button>
        </div>

        {/* ── STATS TAB ── */}
        {tab === 'stats' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={s.card}>
              <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Reportes por categoría</h3>
              {catStats.length === 0 ? (
                <p style={s.empty}>Sin datos</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {catStats.map(([nombre, count]) => (
                    <div key={nombre}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', textTransform: 'capitalize' }}>{nombre}</span>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>{count}</span>
                      </div>
                      <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(count / maxCat) * 100}%`, background: '#2563eb', borderRadius: '4px', transition: 'width .4s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { label: 'Tasa de resolución', value: total > 0 ? `${Math.round((resueltos / total) * 100)}%` : '—', color: '#16a34a' },
                { label: 'Promedio por estado', value: total > 0 ? `${Math.round(total / 3)}` : '—', color: '#2563eb' },
                { label: 'Categorías activas', value: catStats.length, color: '#7c3aed' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ ...s.card, textAlign: 'center' }}>
                  <p style={{ fontSize: '32px', fontWeight: '800', color, margin: '0 0 4px' }}>{value}</p>
                  <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── REPORTS TAB ── */}
        {tab === 'reports' && (
          <>
            <div style={s.filters}>
              <div style={s.searchWrap}>
                <Search size={15} color="#94a3b8" style={{ flexShrink: 0 }} />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por título o usuario..." style={s.searchInput} />
                {search && <button onClick={() => setSearch('')} style={s.clearBtn}><X size={13} color="#94a3b8" /></button>}
              </div>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={s.select}>
                <option value="">Todos los estados</option>
                {REPORT_STATUSES.map((st) => <option key={st} value={st}>{STATUS_LABEL[st]}</option>)}
              </select>
            </div>
            <p style={s.resultsCount}>{filtered.length} reporte(s)</p>

            {loadingR ? (
              <div style={s.list}>{Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)}</div>
            ) : filtered.length === 0 ? (
              <p style={s.empty}>No hay reportes con esos filtros.</p>
            ) : (
              <div style={s.list}>
                {filtered.map((r) => {
                  const estadoNombre = r.estado?.nombre ?? '';
                  const badge = STATUS_COLORS[estadoNombre] || {};
                  return (
                    <div key={r.id} style={s.card}>
                      <div style={s.cardHeader}>
                        <div style={s.titleRow}>
                          <h3 style={s.cardTitle}>{r.titulo}</h3>
                          <span style={{ ...s.badge, ...badge }}>{STATUS_LABEL[estadoNombre] ?? estadoNombre}</span>
                        </div>
                        {r.categoria && <span style={s.categoria}>{r.categoria.nombre.replace(/_/g, ' ')}</span>}
                      </div>
                      <p style={s.desc}>{r.descripcion}</p>
                      <div style={s.metaRow}>
                        {r.usuario && <span style={s.metaItem}><User size={12} strokeWidth={2} color="#94a3b8" />{r.usuario.nombre} {r.usuario.apellido}</span>}
                        {r.direccion_referencia && <span style={s.metaItem}><MapPin size={12} strokeWidth={2} color="#94a3b8" />{r.direccion_referencia}</span>}
                        <span style={s.metaItem}><Calendar size={12} strokeWidth={2} color="#94a3b8" />{formatDate(r.fecha_reporte)}</span>
                      </div>
                      {r.imagenes?.length > 0 && (
                        <div style={s.imgs}>
                          {r.imagenes.map((img) => (
                            <img key={img.id} src={`${API_BASE}${img.url_imagen}`} alt="evidencia" style={s.thumb} />
                          ))}
                        </div>
                      )}
                      <div style={s.actions}>
                        <input
                          type="text" placeholder="Observación (opcional)"
                          value={observaciones[r.id] || ''}
                          onChange={(e) => setObservaciones((prev) => ({ ...prev, [r.id]: e.target.value }))}
                          style={s.obsInput}
                        />
                        <div style={s.selectWrap}>
                          <select value={estadoNombre} disabled={updating === r.id} onChange={(e) => handleStatusChange(r.id, e.target.value)} style={s.selectAction}>
                            {REPORT_STATUSES.map((st) => <option key={st} value={st}>{STATUS_LABEL[st]}</option>)}
                          </select>
                          <ChevronDown size={14} color="#64748b" style={s.selectIcon} />
                        </div>
                        {updating === r.id && <span style={s.saving}>Guardando...</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── USERS TAB ── */}
        {tab === 'users' && (
          <>
            <div style={{ ...s.filters, marginBottom: '12px' }}>
              <div style={s.searchWrap}>
                <Search size={15} color="#94a3b8" style={{ flexShrink: 0 }} />
                <input value={searchUsers} onChange={(e) => setSearchUsers(e.target.value)} placeholder="Buscar por nombre, apellido o correo..." style={s.searchInput} />
                {searchUsers && <button onClick={() => setSearchUsers('')} style={s.clearBtn}><X size={13} color="#94a3b8" /></button>}
              </div>
            </div>
            <p style={s.resultsCount}>{filteredUsers.length} usuario(s)</p>
            {loadingU ? (
              <div style={s.list}>{Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)}</div>
            ) : (
              <div style={s.list}>
                {filteredUsers.map((u) => (
                  <div key={u.id} style={{ ...s.card, opacity: u.activo ? 1 : 0.6 }}>
                    <div style={s.userRow}>
                      <div style={s.userAvatar}>{u.nombre?.[0]}{u.apellido?.[0]}</div>
                      <div style={{ flex: 1 }}>
                        <p style={s.userName}>{u.nombre} {u.apellido}</p>
                        <p style={s.userEmail}>{u.correo}</p>
                      </div>
                      <div style={s.userActions}>
                        <div style={s.selectWrap}>
                          <select
                            value={u.rol?.nombre ?? 'ciudadano'}
                            onChange={(e) => handleChangeRol(u.id, e.target.value)}
                            style={{ ...s.selectAction, minWidth: '130px' }}
                          >
                            <option value="ciudadano">Ciudadano</option>
                            <option value="administrador">Administrador</option>
                          </select>
                          <ChevronDown size={14} color="#64748b" style={s.selectIcon} />
                        </div>
                        <button
                          onClick={() => setConfirmToggle(u)}
                          style={{ ...s.toggleBtn, background: u.activo ? '#fef2f2' : '#f0fdf4', color: u.activo ? '#dc2626' : '#16a34a' }}
                        >
                          {u.activo ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </div>
                    <div style={s.metaRow}>
                      <span style={s.metaItem}><Calendar size={12} strokeWidth={2} color="#94a3b8" />Registrado: {formatDate(u.fecha_creacion)}</span>
                      {!u.activo && <span style={{ ...s.badge, background: '#fef2f2', color: '#dc2626' }}>INACTIVO</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmModal
        open={!!confirmToggle}
        title={confirmToggle?.activo ? 'Desactivar usuario' : 'Activar usuario'}
        message={`¿Seguro que quieres ${confirmToggle?.activo ? 'desactivar' : 'activar'} a ${confirmToggle?.nombre} ${confirmToggle?.apellido}?`}
        confirmLabel={confirmToggle?.activo ? 'Desactivar' : 'Activar'}
        danger={confirmToggle?.activo}
        onConfirm={handleToggleActivo}
        onCancel={() => setConfirmToggle(null)}
      />
    </div>
  );
};

const s = {
  page:         { minHeight: '100vh', background: '#f8fafc', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" },
  container:    { maxWidth: '960px', margin: '0 auto', padding: '40px 20px 80px' },
  pageHeader:   { marginBottom: '24px' },
  pageTitle:    { fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0 },

  statsGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' },
  statCard:     { background: '#fff', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: '14px' },
  statIcon:     { width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statValue:    { margin: 0, fontSize: '24px', fontWeight: '800', color: '#0f172a' },
  statLabel:    { margin: 0, fontSize: '12px', color: '#94a3b8', fontWeight: '500' },

  tabs:         { display: 'flex', gap: '4px', background: '#f1f5f9', borderRadius: '10px', padding: '4px', marginBottom: '24px', width: 'fit-content' },
  tab:          { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '8px', border: 'none', background: 'transparent', fontSize: '14px', fontWeight: '600', color: '#64748b', cursor: 'pointer', fontFamily: 'inherit' },
  tabActive:    { background: '#fff', color: '#0f172a', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },

  filters:      { display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' },
  searchWrap:   { display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 220px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '9px 12px', background: '#fff' },
  searchInput:  { flex: 1, border: 'none', outline: 'none', fontSize: '14px', color: '#0f172a', background: 'transparent', fontFamily: 'inherit' },
  clearBtn:     { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 },
  select:       { padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', fontFamily: 'inherit', color: '#0f172a', background: '#fff', cursor: 'pointer', outline: 'none' },
  resultsCount: { fontSize: '13px', color: '#94a3b8', margin: '0 0 16px' },

  list:         { display: 'flex', flexDirection: 'column', gap: '16px' },
  card:         { background: '#fff', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', gap: '12px' },
  cardHeader:   { display: 'flex', flexDirection: 'column', gap: '8px' },
  titleRow:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' },
  cardTitle:    { margin: 0, fontSize: '17px', fontWeight: '700', color: '#0f172a', lineHeight: '1.3' },
  badge:        { fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', whiteSpace: 'nowrap', flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.4px' },
  categoria:    { fontSize: '12px', fontWeight: '600', color: '#7c3aed', background: '#ede9fe', padding: '3px 10px', borderRadius: '20px', alignSelf: 'flex-start' },
  desc:         { margin: 0, fontSize: '14px', color: '#64748b', lineHeight: '1.6' },
  metaRow:      { display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' },
  metaItem:     { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#94a3b8' },
  imgs:         { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  thumb:        { width: '120px', height: '80px', objectFit: 'cover', borderRadius: '8px' },
  actions:      { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', paddingTop: '4px', borderTop: '1px solid #f1f5f9' },
  obsInput:     { flex: 1, minWidth: '160px', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', fontFamily: 'inherit', color: '#0f172a', outline: 'none' },
  selectWrap:   { position: 'relative', display: 'flex', alignItems: 'center' },
  selectAction: { padding: '9px 32px 9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', fontFamily: 'inherit', color: '#0f172a', cursor: 'pointer', appearance: 'none', background: '#fff', outline: 'none' },
  selectIcon:   { position: 'absolute', right: '10px', pointerEvents: 'none' },
  saving:       { fontSize: '12px', color: '#2563eb', fontWeight: '600' },

  userRow:      { display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' },
  userAvatar:   { width: '40px', height: '40px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', flexShrink: 0, textTransform: 'uppercase' },
  userName:     { margin: '0 0 2px', fontSize: '15px', fontWeight: '700', color: '#0f172a' },
  userEmail:    { margin: 0, fontSize: '13px', color: '#94a3b8' },
  userActions:  { display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto', flexWrap: 'wrap' },
  toggleBtn:    { padding: '7px 14px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' },

  empty:        { color: '#94a3b8', textAlign: 'center', marginTop: '40px', fontSize: '15px' },
  exportBtn:    { display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '13px', fontWeight: '600', color: '#0f172a', cursor: 'pointer', fontFamily: 'inherit' },
};

export default AdminReportsPage;
