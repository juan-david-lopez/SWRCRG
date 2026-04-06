import { useState } from 'react';
import FormInput from '../../components/FormInput';
import MapPicker from '../../components/MapPicker';
import { createReportForm } from '../../services/report.service';

const INITIAL = { title: '', description: '', latitude: '', longitude: '' };

const CreateReportPage = () => {
  const [form, setForm]       = useState(INITIAL);
  const [image, setImage]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const handleChange    = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleMapSelect = ({ lat, lng }) => setForm((p) => ({ ...p, latitude: lat, longitude: lng }));
  const handleFile      = (e) => setImage(e.target.files[0] || null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.latitude || !form.longitude) {
      return setError('Selecciona una ubicación en el mapa');
    }

    const formData = new FormData();
    formData.append('title',       form.title);
    formData.append('description', form.description);
    formData.append('latitude',    form.latitude);
    formData.append('longitude',   form.longitude);
    if (image) formData.append('image', image);

    setLoading(true);
    try {
      await createReportForm(formData);
      setSuccess('Reporte creado correctamente.');
      setForm(INITIAL);
      setImage(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2>Nuevo reporte</h2>

        <FormInput label="Título"      name="title"       value={form.title}       onChange={handleChange} placeholder="Ej: Bache en calle 5" />
        <FormInput label="Descripción" name="description" value={form.description} onChange={handleChange} placeholder="Describe el problema" />

        <label style={styles.label}>Ubicación</label>
        <MapPicker onSelect={handleMapSelect} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={styles.label}>Imagen (opcional)</label>
          <input type="file" accept="image/*" onChange={handleFile} />
          {image && <span style={styles.filename}>{image.name}</span>}
        </div>

        {error   && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        <button type="submit" disabled={loading} style={styles.btn}>
          {loading ? 'Enviando...' : 'Crear reporte'}
        </button>
      </form>
    </div>
  );
};

const styles = {
  wrapper:   { display: 'flex', justifyContent: 'center' },
  card:      { display: 'flex', flexDirection: 'column', gap: '16px', background: '#fff', padding: '32px', borderRadius: '8px', width: '100%', maxWidth: '520px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  label:     { fontSize: '14px', fontWeight: 500 },
  btn:       { padding: '10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '15px' },
  error:     { color: '#dc2626', fontSize: '13px', margin: 0 },
  success:   { color: '#16a34a', fontSize: '13px', margin: 0 },
  filename:  { fontSize: '12px', color: '#555' },
};

export default CreateReportPage;
