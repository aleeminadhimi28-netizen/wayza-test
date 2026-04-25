import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

export default function MapView({ lat, lng, title, markers }) {
  // default center
  const center = [lat || markers?.[0]?.lat || 8.7379, lng || markers?.[0]?.lng || 76.7163];

  return (
    <MapContainer center={center} zoom={13} style={{ height: 350, width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* SINGLE MARKER (Listing page) */}
      {lat && lng && (
        <Marker position={[lat, lng]}>
          <Popup>{title}</Popup>
        </Marker>
      )}

      {/* MULTIPLE MARKERS (Map search page) */}
      {markers &&
        markers.map((m, i) => (
          <Marker key={i} position={[m.lat, m.lng]}>
            <Popup>
              <strong>{m.title}</strong>
              <br />₹{m.price}
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
