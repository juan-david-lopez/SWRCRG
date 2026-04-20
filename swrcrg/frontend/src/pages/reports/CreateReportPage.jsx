import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Paperclip, Send, X, AlertTriangle } from 'lucide-react';
import MapPicker from '../../components/MapPicker';
import Select from '../../components/Select';
import { createReportForm, uploadReportImage, getNearbyReports } from '../../services/report.service';
import { get } from '../../services/api';
import { toast } from '../../components/Toast';

const INITIAL = { titulo: '', descripcion: '', direccion_referencia: '', categoria_id: '' };

// Comprime una imagen a máx 1200px y calidad 0.82
const compressImage = (file) => new Promise((resolve) => {
  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      const MAX = 1200;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
        else { width = Math.round(width * MAX / height); height = MAX; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })), 'image/jpeg', 0.82);
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

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
  const [images, setImages]     = useState([]);
  const [categorias, setCats]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [coordErr, setCoordErr] = useState(false);
  const [nearby, setNearby]     = useState([]);

  useEffect(() => {
    get('/categorias')
      .then(({ categorias }) => setCats(categorias))
      .catch(() => {});
  }, []);

  const handleChange    = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };
  const handleMapSelect = ({ lat, lng }) => {
    setCoords({ lat, lng });
    setCoordErr(false);
    // Buscar reportes cercanos (500m)
    getNearbyReports(lat, lng, 0.5)
      .then(({ reportes }) => setNearby(reportes ?? []))
      .catch(() => {});
  };
  const handleFile = (e) => {
    const files = Array.from(e.target.files);
    // Comprimir imágenes antes de agregar
    Promise.all(files.map(compressImage))
      .then((compressed) => setImages((prev) => [...prev, ...compressed].slice(0, 5)))
      .catch(() => setImages((prev) => [...prev, ...files].slice(0, 5)));
    e.target.value = '';
  };
  const removeImage = (idx) => setImages((prev) => prev.filter((_, i) => i !== idx));

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
    // Primera imagen va como 'image' (backend existente), el resto se sube después
    if (images[0]) fd.append('image', images[0]);

    setLoading(true);
    try {
      const { reporte } = await createReportForm(fd);
      // Subir imágenes adicionales
      if (images.length > 1 && reporte?.id) {
        const { uploadReportImage } = await import('../../services/report.service');
        for (const img of images.slice(1)) {
          const imgFd = new FormData();
          imgFd.append('image', img);
          await uploadReportImage(reporte.id, imgFd).catch(() => {});
        }
      }
      toast.success('Reporte creado correctamente');
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
            <Select
              value={form.categoria_id}
              onChange={(val) => { setForm({ ...form, categoria_id: val }); setError(''); }}
              options={categorias
                .map((c) => ({ value: c.id, label: c.nombre.replace(/_/g, ' ').toUpperCase() }))
                .sort((a, b) => {
                  if (a.label === 'OTRO') return 1;
                  if (b.label === 'OTRO') return -1;
                  return a.label.localeCompare(b.label);
                })}
              placeholder="Selecciona una categoría"
              style={{ border: 'none', padding: '2px 0', background: 'transparent', width: '100%' }}
            />
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
            {nearby.length > 0 && (
              <div style={s.nearbyWarn}>
                <AlertTriangle size={15} strokeWidth={2} color="#f59e0b" style={{ flexShrink: 0 }} />
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: '600', color: '#92400e' }}>
                    Hay {nearby.length} reporte(s) cercano(s) en esta zona
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#92400e' }}>
                    Verifica que no sea un duplicado antes de continuar.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Imagen */}
          <div style={s.fileSection}>
            <label style={s.fileBtn}>
              <Paperclip size={15} strokeWidth={2} color="#2563eb" />
              <span>Adjuntar imágenes {images.length > 0 ? `(${images.length}/5)` : '(máx. 5)'}</span>
              <input type="file" accept="image/*" multiple onChange={handleFile} style={{ display: 'none' }} />
            </label>
            {images.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {images.map((img, idx) => (
                  <div key={idx} style={s.imgPreview}>
                    <img src={URL.createObjectURL(img)} alt={img.name} style={s.imgThumb} />
                    <button type="button" onClick={() => removeImage(idx)} style={s.imgRemove}>
                      <X size={11} strokeWidth={3} color="#fff" />
                    </button>
                  </div>
                ))}
              </div>
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
  page:       { minHeight: '100vh', background: 'var(--c-bg)', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" },

  /* top bar */
  topBar:     { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 24px', background: 'var(--c-surface)', borderBottom: '1px solid var(--c-border)' },
  backBtn:    { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', color: 'var(--c-text)' },
  topTitle:   { fontSize: '17px', fontWeight: '700', color: 'var(--c-text)' },

  /* card */
  center:     { display: 'flex', justifyContent: 'center', padding: '32px 16px 48px' },
  card:       { display: 'flex', flexDirection: 'column', gap: '0', background: 'var(--c-surface)', borderRadius: '16px', width: '100%', maxWidth: '520px', boxShadow: '0 4px 24px var(--c-shadow)', overflow: 'hidden' },

  /* float field */
  floatWrap:  { display: 'flex', flexDirection: 'column', borderBottom: '1px solid var(--c-border)', padding: '12px 20px 8px' },
  floatLabel: { fontSize: '11px', fontWeight: '700', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' },
  input:      { border: 'none', outline: 'none', fontSize: '14px', color: 'var(--c-text)', background: 'transparent', fontFamily: 'inherit', padding: '2px 0', width: '100%' },
  hint:       { fontSize: '11px', color: 'var(--c-text-3)', marginTop: '4px' },

  /* mapa */
  mapSection: { padding: '16px 20px', borderBottom: '1px solid var(--c-border)', display: 'flex', flexDirection: 'column', gap: '10px' },
  mapLabel:   { fontSize: '11px', fontWeight: '700', color: 'var(--c-text)', letterSpacing: '1px', margin: 0 },
  coordErr:   { display: 'flex', alignItems: 'center', fontSize: '12px', color: '#ef4444', fontWeight: '500' },
  nearbyWarn: { display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px' },

  /* imagen */
  fileSection:{ padding: '16px 20px', borderBottom: '1px solid var(--c-border)', display: 'flex', flexDirection: 'column', gap: '8px' },
  fileBtn:    { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: '1px solid var(--c-border)', borderRadius: '8px', padding: '11px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#2563eb', background: 'var(--c-surface)' },
  fileName:   { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--c-text-2)' },
  imgPreview: { position: 'relative', width: '72px', height: '72px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 },
  imgThumb:   { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  imgRemove:  { position: 'absolute', top: '3px', right: '3px', width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 },

  /* error */
  errorBox:   { margin: '0 20px', fontSize: '13px', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '10px 12px' },

  /* submit */
  submitBtn:  { margin: '16px 20px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' },
};

export default CreateReportPage;
