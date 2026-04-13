import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix para el ícono por defecto de Leaflet con bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon   from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl:       markerIcon,
  shadowUrl:     markerShadow,
});

// Componente interno que captura clicks en el mapa
const ClickHandler = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
    },
  });
  return null;
};

// Centro por defecto: Armenia, Colombia
const DEFAULT_CENTER = [4.5339, -75.6811];

const MapPicker = ({ onSelect }) => {
  const [marker, setMarker] = useState(null);

  const handleSelect = (latlng) => {
    setMarker(latlng);
    onSelect(latlng);
  };

  return (
    <div>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={13}
        style={{ height: '350px', width: '100%', borderRadius: '6px' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <ClickHandler onSelect={handleSelect} />
        {marker && <Marker position={marker} />}
      </MapContainer>

      {marker ? (
        <p style={styles.coords}>
          {marker.lat.toFixed(6)}, {marker.lng.toFixed(6)}
        </p>
      ) : (
        <p style={styles.hint}>Haz clic en el mapa para seleccionar la ubicación</p>
      )}
    </div>
  );
};

const styles = {
  coords: { fontSize: '13px', color: '#2563eb', margin: '6px 0 0' },
  hint:   { fontSize: '13px', color: '#888',    margin: '6px 0 0' },
};

export default MapPicker;
