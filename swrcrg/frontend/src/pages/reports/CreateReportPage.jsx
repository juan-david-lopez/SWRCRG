import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Paperclip, FileImage, Send } from 'lucide-react';
import MapPicker from '../../components/MapPicker';
import { createReportForm } from '../../services/report.service';
import { get } from '../../services/api';

const INITIAL = { titulo: '', descripcion: '', direccion_referencia: '', categoria_id: '' };

/* Campo con label flotante sobre el borde */
const FloatField = ({ label, children, hint }) => (
  <div style={s.floatWrap}>
    <span style={s.floatLabel}>{label}</span>
    {children}
    {hint && <span style={s.hint}>{hint}</span>}
  </div>
);

const CreateReportPage = () => {
  const navigate = useNavigate();
  const [form, setForm]         = useState(INITIAL);
  const [coords, setCoords]     = useState(null);
  const [image, setImage]       = useState(null);
  const [categorias, setCats]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [coordErr, setCoordErr] = useState(false);

  useEffect(() => {
    get('/categorias')
      .then(({ categorias }) => setCats(categorias))
      .catch(() => {});
  }, []);

  const handleChange    = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };
  const handleMapSelect = ({ lat, lng }) => { setCoords({ lat, lng }); setCoordErr(false); };
  const handleFile      = (e) => setImage(e.target.files[0] || null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!coords) { setCoordErr(true); return; }
    if (!form.categoria_id) return setError('Selecciona una categoría');

    const fd = new FormData();
    fd.append('titulo',               form.titulo);
    fd.append('descripcion',          form.descripcion);
    fd.append('direccion_referencia', form.direccion_referencia);
    fd.append('latitud',              coords.lat);
    fd.append('longitud',             coords.lng);
    fd.append('categoria_id',         form.categoria_id);
    if (image) fd.append('image', image);

    setLoading(true);
    try {
      await createReportForm(fd);
      navigate('/reports');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      {/* header */}
      <div style={s.topBar}>
        <button onClick={() => navigate(-1)} style={s.backBtn}>
          <ArrowLeft size={18} strokeWidth={2} />
        </button>
        <span style={s.topTitle}>Nuevo reporte</span>
      </div>

      {/* card */}
      <div style={s.center}>
        <form onSubmit={handleSubmit} style={s.card} noValidate>

          {/* Título */}
          <FloatField label="Título">
            <input
              name="titulo" value={form.titulo} onChange={handleChange}
              placeholder="Ej: Basura acumulada en calle 5"
              required style={s.input}
            />
          </FloatField>

          {/* Descripción */}
          <FloatField label="Descripción">
            <textarea
              name="descripcion" value={form.descripcion} onChange={handleChange}
              placeholder="Describe el problema"
              rows={4} style={{ ...s.input, resize: 'vertical', lineHeight: '1.5' }}
            />
          </FloatField>

          {/* Dirección */}
          <FloatField label="Dirección referencia" hint="Opcional">
            <input
              name="direccion_referencia" value={form.direccion_referencia} onChange={handleChange}
              placeholder="Frente al parque central"
              style={s.input}
            />
          </FloatField>

          {/* Categoría */}
          <FloatField label="Categoría">
            <select
              name="categoria_id" value={form.categoria_id} onChange={handleChange}
              style={{ ...s.input, cursor: 'pointer', appearance: 'none', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: '36px' }}
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </FloatField>

          {/* Mapa */}
          <div style={s.mapSection}>
            <p style={s.mapLabel}>UBICACIÓN</p>
            <MapPicker onSelect={handleMapSelect} />
            {coordErr && (
              <span style={s.coordErr}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block', marginRight: '6px' }} />
                Selecciona una ubicación en el mapa
              </span>
            )}
          </div>

          {/* Imagen */}
          <div style={s.fileSection}>
            <label style={s.fileBtn}>
              <Paperclip size={15} strokeWidth={2} color="#2563eb" />
              <span>Adjuntar imagen</span>
              <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
            </label>
            {image && (
              <span style={s.fileName}>
                <FileImage size={13} color="#64748b" />
                {image.name}
              </span>
            )}
          </div>

          {error && <p style={s.errorBox}>{error}</p>}

          {/* Submit */}
          <button type="submit" disabled={loading} style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Enviando...' : 'Crear reporte'}
            {!loading && <Send size={16} strokeWidth={2} />}
          </button>

        </form>
      </div>
    </div>
  );
};

const s = {
  page:       { minHeight: '100vh', background: '#f1f5f9', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" },

  /* top bar */
  topBar:     { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 24px', background: '#fff', borderBottom: '1px solid #e2e8f0' },
  backBtn:    { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', color: '#0f172a' },
  topTitle:   { fontSize: '17px', fontWeight: '700', color: '#0f172a' },

  /* card */
  center:     { display: 'flex', justifyContent: 'center', padding: '32px 16px 48px' },
  card:       { display: 'flex', flexDirection: 'column', gap: '0', background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '520px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', overflow: 'hidden' },

  /* float field */
  floatWrap:  { display: 'flex', flexDirection: 'column', borderBottom: '1px solid #e2e8f0', padding: '12px 20px 8px' },
  floatLabel: { fontSize: '11px', fontWeight: '700', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' },
  input:      { border: 'none', outline: 'none', fontSize: '14px', color: '#0f172a', background: 'transparent', fontFamily: 'inherit', padding: '2px 0', width: '100%' },
  hint:       { fontSize: '11px', color: '#94a3b8', marginTop: '4px' },

  /* mapa */
  mapSection: { padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' },
  mapLabel:   { fontSize: '11px', fontWeight: '700', color: '#0f172a', letterSpacing: '1px', margin: 0 },
  coordErr:   { display: 'flex', alignItems: 'center', fontSize: '12px', color: '#ef4444', fontWeight: '500' },

  /* imagen */
  fileSection:{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' },
  fileBtn:    { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '11px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#2563eb', background: '#fff' },
  fileName:   { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' },

  /* error */
  errorBox:   { margin: '0 20px', fontSize: '13px', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '10px 12px' },

  /* submit */
  submitBtn:  { margin: '16px 20px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' },
};

export default CreateReportPage;
