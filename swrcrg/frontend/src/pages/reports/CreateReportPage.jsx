import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FormInput from '../../components/FormInput';
import MapPicker from '../../components/MapPicker';
import { createReportForm } from '../../services/report.service';
import { get } from '../../services/api';

const INITIAL = { titulo: '', descripcion: '', direccion_referencia: '', categoria_id: '' };

const CreateReportPage = () => {
  const navigate = useNavigate();
  const [form, setForm]           = useState(INITIAL);
  const [coords, setCoords]       = useState(null);
  const [image, setImage]         = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    get('/categorias')
      .then(({ categorias }) => setCategorias(categorias))
      .catch(() => {});
  }, []);

  const handleChange    = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleMapSelect = ({ lat, lng }) => setCoords({ lat, lng });
  const handleFile      = (e) => setImage(e.target.files[0] || null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!coords) return setError('Selecciona una ubicación en el mapa');
    if (!form.categoria_id) return setError('Selecciona una categoría');

    const formData = new FormData();
    formData.append('titulo',               form.titulo);
    formData.append('descripcion',          form.descripcion);
    formData.append('direccion_referencia', form.direccion_referencia);
    formData.append('latitud',              coords.lat);
    formData.append('longitud',             coords.lng);
    formData.append('categoria_id',         form.categoria_id);
    if (image) formData.append('image', image);

    setLoading(true);
    try {
      await createReportForm(formData);
      navigate('/reports');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2>Nuevo reporte</h2>

        <FormInput label="Título"               name="titulo"               value={form.titulo}               onChange={handleChange} placeholder="Ej: Basura acumulada en calle 5" />
        <FormInput label="Descripción"          name="descripcion"          value={form.descripcion}          onChange={handleChange} placeholder="Describe el problema" />
        <FormInput label="Dirección referencia" name="direccion_referencia" value={form.direccion_referencia} onChange={handleChange} placeholder="Ej: Frente al parque central (opcional)" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor="categoria_id" style={styles.label}>Categoría</label>
          <select id="categoria_id" name="categoria_id" value={form.categoria_id} onChange={handleChange} style={styles.select}>
            <option value="">-- Selecciona una categoría --</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={styles.label}>Ubicación</label>
          <MapPicker onSelect={handleMapSelect} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={styles.label}>Imagen (opcional)</label>
          <input type="file" accept="image/*" onChange={handleFile} />
          {image && <span style={styles.filename}>{image.name}</span>}
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" disabled={loading} style={styles.btn}>
          {loading ? 'Enviando...' : 'Crear reporte'}
        </button>
      </form>
    </div>
  );
};

const styles = {
  wrapper:  { display: 'flex', justifyContent: 'center' },
  card:     { display: 'flex', flexDirection: 'column', gap: '16px', background: '#fff', padding: '32px', borderRadius: '8px', width: '100%', maxWidth: '560px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  label:    { fontSize: '14px', fontWeight: 500 },
  select:   { padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' },
  btn:      { padding: '10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '15px' },
  error:    { color: '#dc2626', fontSize: '13px', margin: 0 },
  filename: { fontSize: '12px', color: '#555' },
};

export default CreateReportPage;
