import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReports, updateReportStatus, exportReportsCSV, assignReport } from '../../services/report.service';
import { getUsuarios, toggleUsuarioActivo, changeUsuarioRol } from '../../services/auth.service';
import { REPORT_STATUSES, STATUS_COLORS, STATUS_LABEL } from '../../constants/reportStatus';
import { MapPin, Calendar, User, Search, X, BarChart2, Users, FileText, CheckCircle, Download, UserCheck, Clock } from 'lucide-react';
import { RowSkeleton } from '../../components/Skeleton';
import ConfirmModal from '../../components/ConfirmModal';
import Select from '../../components/Select';
import { toast } from '../../components/Toast';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
const formatDate = (iso) => new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
// STATUS_LABEL ahora viene de constants

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

const FlaggedTab = ({ reports, formatDate }) => {
  const flagged = reports.filter((r) => r.reportes_contenido?.length > 0);
  if (flagged.length === 0)
    return <p style={{ color: 'var(--c-text-3)', textAlign: 'center', marginTop: '40px', fontSize: '15px' }}>No hay reportes marcados como inapropiados.</p>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {flagged.map((r) => (
        <div key={r.id} style={{ background: 'var(--c-surface)', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 2px 12px var(--c-shadow)', display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '3px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: 'var(--c-text)', lineHeight: '1.3' }}>{r.titulo}</h3>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#ef4444', background: '#fef2f2', padding: '3px 10px', borderRadius: '20px', flexShrink: 0 }}>
              {r.reportes_contenido.length} denuncia(s)
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--c-text-2)', lineHeight: '1.6' }}>{r.descripcion}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            {r.usuario && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--c-text-3)' }}>
                <User size={12} strokeWidth={2} color="var(--c-text-3)" />
                {r.usuario.nombre} {r.usuario.apellido}
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--c-text-3)' }}>
              <Calendar size={12} strokeWidth={2} color="var(--c-text-3)" />
              {formatDate(r.fecha_reporte)}
            </span>
          </div>
          <a href={`/reports/${r.id}`} target="_blank" rel="noreferrer"
            style={{ fontSize: '13px', color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>
            Ver reporte →
          </a>
        </div>
      ))}
    </div>
  );
};

const AdminReportsPage = () => {
  const navigate = useNavigate();
  const [tab, setTab]                   = useState('reports'); // 'reports' | 'users' | 'stats'
  const [reports, setReports]           = useState([]);
  const [usuarios, setUsuarios]         = useState([]);
  const [loadingR, setLoadingR]         = useState(true);
  const [loadingU, setLoadingU]         = useState(false);
  const [updating, setUpdating]         = useState(null);
  const [observaciones, setObservaciones] = useState({});
  const [motivosRechazo, setMotivosRechazo] = useState({});
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
    // Cargar usuarios al montar para que el select de asignación funcione desde el inicio
    getUsuarios()
      .then(({ usuarios }) => setUsuarios(usuarios))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (tab === 'users' && !loadingU && usuarios.length === 0) {
      setLoadingU(true);
      getUsuarios()
        .then(({ usuarios }) => setUsuarios(usuarios))
        .catch((err) => toast.error(err.message))
        .finally(() => setLoadingU(false));
    }
  }, [tab]);

  const handleStatusChange = async (id, estado) => {
    // Si rechaza, el motivo es obligatorio
    if (estado === 'rechazado' && !motivosRechazo[id]?.trim()) {
      toast.error('Debes escribir un motivo de rechazo antes de rechazar');
      return;
    }
    setUpdating(id);
    try {
      const { reporte } = await updateReportStatus(id, estado, observaciones[id] || '', motivosRechazo[id] || '');
      setReports((prev) => prev.map((r) => r.id === id ? { ...r, estado: reporte.estado } : r));
      setObservaciones((prev) => ({ ...prev, [id]: '' }));
      setMotivosRechazo((prev) => ({ ...prev, [id]: '' }));
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

  const handleAsignar = async (reporteId, funcionarioId) => {
    try {
      await assignReport(reporteId, funcionarioId || null);
      setReports((prev) => prev.map((r) => r.id === reporteId ? { ...r, asignado_a: funcionarioId || null } : r));
      toast.success(funcionarioId ? 'Reporte asignado' : 'Asignación removida');
    } catch (err) {
      toast.error(err.message);
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

  // Tendencia por semana (últimas 8 semanas)
  const weeklyTrend = useMemo(() => {
    const weeks = {};
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      const key = `${d.getFullYear()}-W${Math.ceil(d.getDate() / 7)}`;
      weeks[key] = { label: `S${8 - i}`, count: 0 };
    }
    reports.forEach((r) => {
      const d = new Date(r.fecha_reporte);
      const key = `${d.getFullYear()}-W${Math.ceil(d.getDate() / 7)}`;
      if (weeks[key]) weeks[key].count++;
    });
    return Object.values(weeks);
  }, [reports]);
  const maxWeek = Math.max(...weeklyTrend.map((w) => w.count), 1);

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
          <StatCard icon={Clock}       label="En proceso"     value={enProceso}  color="#3b82f6" />
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
            <button onClick={() => setTab('flagged')} style={{ ...s.tab, ...(tab === 'flagged' ? s.tabActive : {}) }}>
              <UserCheck size={15} strokeWidth={2} /> Reportados
              {reports.filter((r) => r.reportes_contenido?.length > 0).length > 0 && (
                <span style={{ background: '#ef4444', color: '#fff', borderRadius: '20px', fontSize: '10px', fontWeight: '700', padding: '1px 6px', marginLeft: '2px' }}>
                  {reports.filter((r) => r.reportes_contenido?.length > 0).length}
                </span>
              )}
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
              <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '700', color: 'var(--c-text)' }}>Reportes por categoría</h3>
              {catStats.length === 0 ? (
                <p style={s.empty}>Sin datos</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {catStats.map(([nombre, count]) => (
                    <div key={nombre}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--c-text)', textTransform: 'capitalize' }}>{nombre}</span>
                        <span style={{ fontSize: '13px', color: 'var(--c-text-2)' }}>{count}</span>
                      </div>
                      <div style={{ height: '8px', background: 'var(--c-bg)', borderRadius: '4px', overflow: 'hidden' }}>
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
                  <p style={{ fontSize: '13px', color: 'var(--c-text-3)', margin: 0 }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Tendencia semanal */}
            <div style={s.card}>
              <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '700', color: 'var(--c-text)' }}>Tendencia semanal (últimas 8 semanas)</h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px' }}>
                {weeklyTrend.map((w) => (
                  <div key={w.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '11px', color: 'var(--c-text-3)', fontWeight: '600' }}>{w.count || ''}</span>
                    <div style={{ width: '100%', background: '#2563eb', borderRadius: '4px 4px 0 0', height: `${Math.max((w.count / maxWeek) * 90, w.count > 0 ? 8 : 2)}px`, transition: 'height .3s', opacity: w.count === 0 ? 0.2 : 1 }} />
                    <span style={{ fontSize: '10px', color: 'var(--c-text-3)' }}>{w.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── REPORTS TAB ── */}
        {tab === 'reports' && (
          <>
            <div style={s.filters}>
              <div style={s.searchWrap}>
                <Search size={15} color="var(--c-text-3)" style={{ flexShrink: 0 }} />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por título o usuario..." style={s.searchInput} />
                {search && <button onClick={() => setSearch('')} style={s.clearBtn}><X size={13} color="var(--c-text-3)" /></button>}
              </div>
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                options={[
                  { value: '', label: 'Todos los estados' },
                  ...REPORT_STATUSES.map((st) => ({ value: st, label: STATUS_LABEL[st] })),
                ]}
                placeholder="Todos los estados"
              />
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
                        {r.usuario && <span style={s.metaItem}><User size={12} strokeWidth={2} color="var(--c-text-3)" />{r.usuario.nombre} {r.usuario.apellido}</span>}
                        {r.direccion_referencia && <span style={s.metaItem}><MapPin size={12} strokeWidth={2} color="var(--c-text-3)" />{r.direccion_referencia}</span>}
                        <span style={s.metaItem}><Calendar size={12} strokeWidth={2} color="var(--c-text-3)" />{formatDate(r.fecha_reporte)}</span>
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
                        {/* Solo mostrar opciones válidas según estado actual */}
                        {estadoNombre === 'pendiente' ? (
                          <>
                            <input
                              type="text"
                              placeholder="Motivo de rechazo (obligatorio si rechaza)"
                              value={motivosRechazo[r.id] || ''}
                              onChange={(e) => setMotivosRechazo((prev) => ({ ...prev, [r.id]: e.target.value }))}
                              style={{ ...s.obsInput, borderColor: '#fca5a5' }}
                            />
                            <Select
                              value=""
                              onChange={(val) => handleStatusChange(r.id, val)}
                              disabled={updating === r.id}
                              options={[
                                { value: 'verificado', label: 'Verificar' },
                                { value: 'rechazado',  label: 'Rechazar' },
                              ]}
                              placeholder="Cambiar estado..."
                            />
                          </>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--c-text-3)', fontStyle: 'italic' }}>
                            Estado final — el ciudadano debe reenviar para nueva revisión
                          </span>
                        )}
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
                <Search size={15} color="var(--c-text-3)" style={{ flexShrink: 0 }} />
                <input value={searchUsers} onChange={(e) => setSearchUsers(e.target.value)} placeholder="Buscar por nombre, apellido o correo..." style={s.searchInput} />
                {searchUsers && <button onClick={() => setSearchUsers('')} style={s.clearBtn}><X size={13} color="var(--c-text-3)" /></button>}
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
                        <Select
                          value={u.rol?.nombre ?? 'ciudadano'}
                          onChange={(val) => handleChangeRol(u.id, val)}
                          options={[
                            { value: 'ciudadano',      label: 'Ciudadano' },
                            { value: 'administrador',  label: 'Administrador' },
                          ]}
                          style={{ minWidth: '140px' }}
                        />
                        <button
                          onClick={() => setConfirmToggle(u)}
                          style={{ ...s.toggleBtn, background: u.activo ? '#fef2f2' : '#f0fdf4', color: u.activo ? '#dc2626' : '#16a34a' }}
                        >
                          {u.activo ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </div>
                    <div style={s.metaRow}>
                      <span style={s.metaItem}><Calendar size={12} strokeWidth={2} color="var(--c-text-3)" />Registrado: {formatDate(u.fecha_creacion)}</span>
                      {!u.activo && <span style={{ ...s.badge, background: '#fef2f2', color: '#dc2626' }}>INACTIVO</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── FLAGGED TAB ── */}
        {tab === 'flagged' && (
          <FlaggedTab reports={reports} formatDate={formatDate} />
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
  page:         { minHeight: '100vh', background: 'var(--c-bg)', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" },
  container:    { maxWidth: '960px', margin: '0 auto', padding: '40px 20px 80px' },
  pageHeader:   { marginBottom: '24px' },
  pageTitle:    { fontSize: '28px', fontWeight: '800', color: 'var(--c-text)', margin: 0 },

  statsGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' },
  statCard:     { background: 'var(--c-surface)', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 2px 12px var(--c-shadow)', display: 'flex', alignItems: 'center', gap: '14px' },
  statIcon:     { width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statValue:    { margin: 0, fontSize: '24px', fontWeight: '800', color: 'var(--c-text)' },
  statLabel:    { margin: 0, fontSize: '12px', color: 'var(--c-text-3)', fontWeight: '500' },

  tabs:         { display: 'flex', gap: '4px', background: 'var(--c-bg)', borderRadius: '10px', padding: '4px', marginBottom: '24px', width: 'fit-content' },
  tab:          { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '8px', border: 'none', background: 'transparent', fontSize: '14px', fontWeight: '600', color: 'var(--c-text-2)', cursor: 'pointer', fontFamily: 'inherit' },
  tabActive:    { background: 'var(--c-surface)', color: 'var(--c-text)', boxShadow: '0 1px 4px var(--c-shadow)' },

  filters:      { display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' },
  searchWrap:   { display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 220px', border: '1px solid var(--c-border)', borderRadius: '8px', padding: '9px 12px', background: 'var(--c-surface)' },
  searchInput:  { flex: 1, border: 'none', outline: 'none', fontSize: '14px', color: 'var(--c-text)', background: 'transparent', fontFamily: 'inherit' },
  clearBtn:     { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 },
  select:       { padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--c-border)', fontSize: '13px', fontFamily: 'inherit', color: 'var(--c-text)', background: 'var(--c-surface)', cursor: 'pointer', outline: 'none' },
  resultsCount: { fontSize: '13px', color: 'var(--c-text-3)', margin: '0 0 16px' },

  list:         { display: 'flex', flexDirection: 'column', gap: '16px' },
  card:         { background: 'var(--c-surface)', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 2px 12px var(--c-shadow)', display: 'flex', flexDirection: 'column', gap: '12px' },
  cardHeader:   { display: 'flex', flexDirection: 'column', gap: '8px' },
  titleRow:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' },
  cardTitle:    { margin: 0, fontSize: '17px', fontWeight: '700', color: 'var(--c-text)', lineHeight: '1.3' },
  badge:        { fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', whiteSpace: 'nowrap', flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.4px' },
  categoria:    { fontSize: '12px', fontWeight: '600', color: '#7c3aed', background: '#ede9fe', padding: '3px 10px', borderRadius: '20px', alignSelf: 'flex-start' },
  desc:         { margin: 0, fontSize: '14px', color: 'var(--c-text-2)', lineHeight: '1.6' },
  metaRow:      { display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' },
  metaItem:     { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--c-text-3)' },
  imgs:         { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  thumb:        { width: '120px', height: '80px', objectFit: 'cover', borderRadius: '8px' },
  actions:      { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', paddingTop: '4px', borderTop: '1px solid var(--c-bg)' },
  obsInput:     { flex: 1, minWidth: '160px', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--c-border)', fontSize: '13px', fontFamily: 'inherit', color: 'var(--c-text)', outline: 'none' },
  saving:       { fontSize: '12px', color: '#2563eb', fontWeight: '600' },

  userRow:      { display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' },
  userAvatar:   { width: '40px', height: '40px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', flexShrink: 0, textTransform: 'uppercase' },
  userName:     { margin: '0 0 2px', fontSize: '15px', fontWeight: '700', color: 'var(--c-text)' },
  userEmail:    { margin: 0, fontSize: '13px', color: 'var(--c-text-3)' },
  userActions:  { display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto', flexWrap: 'wrap' },
  toggleBtn:    { padding: '7px 14px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' },

  empty:        { color: 'var(--c-text-3)', textAlign: 'center', marginTop: '40px', fontSize: '15px' },
  exportBtn:    { display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '8px', border: '1px solid var(--c-border)', background: 'var(--c-surface)', fontSize: '13px', fontWeight: '600', color: 'var(--c-text)', cursor: 'pointer', fontFamily: 'inherit' },
};

export default AdminReportsPage;
