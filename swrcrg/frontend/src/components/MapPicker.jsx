import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { TILE_URL, TILE_ATTR, createPickerIcon } from './MapMarkers';
import { MapPin } from 'lucide-react';

const DEFAULT_CENTER = [4.5339, -75.6811]; // Armenia, Colombia

const ClickHandler = ({ onSelect }) => {
  useMapEvents({ click: (e) => onSelect(e.latlng) });
  return null;
};

const MapPicker = ({ onSelect }) => {
  const [marker, setMarker] = useState(null);

  const handleSelect = (latlng) => {
    setMarker(latlng);
    onSelect(latlng);
  };

  return (
    <div style={s.wrap}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={14}
        style={s.map}
        zoomControl={true}
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTR} />
        <ClickHandler onSelect={handleSelect} />
        {marker && <Marker position={marker} icon={createPickerIcon()} />}
      </MapContainer>

      <div style={{ ...s.hint, ...(marker ? s.hintSelected : {}) }}>
        <MapPin size={13} strokeWidth={2} color={marker ? '#2563eb' : 'var(--c-text-3)'} />
        {marker
          ? <span>{marker.lat.toFixed(6)}, {marker.lng.toFixed(6)}</span>
          : <span>Haz clic en el mapa para seleccionar la ubicación</span>
        }
      </div>
    </div>
  );
};

const s = {
  wrap:         { display: 'flex', flexDirection: 'column', gap: '8px' },
  map:          { height: '320px', width: '100%', borderRadius: '10px', border: '1px solid var(--c-border)' },
  hint:         { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--c-text-3)', padding: '6px 10px', borderRadius: '6px', background: 'var(--c-bg)' },
  hintSelected: { color: '#2563eb', background: 'var(--c-primary-bg)' },
};

export default MapPicker;
