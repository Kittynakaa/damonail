import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "./StoreLocationMap.css";

const pinIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function RecenterOnChange({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

function ClickToMove({ onChange }) {
  useMapEvents({
    click(e) {
      onChange?.({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

// แผนที่แสดง/ปักหมุดตำแหน่งร้าน ใช้ OpenStreetMap (ฟรี ไม่ต้องใช้ API key)
export default function StoreLocationMap({ lat, lng, draggable = false, onChange, height = "260px", zoom = 16 }) {
  const markerRef = useRef(null);

  if (typeof lat !== "number" || typeof lng !== "number" || Number.isNaN(lat) || Number.isNaN(lng)) {
    return (
      <div className="store-location-map-empty" style={{ height }}>
        ยังไม่ได้ปักหมุดตำแหน่งร้าน
      </div>
    );
  }

  return (
    <MapContainer center={[lat, lng]} zoom={zoom} style={{ height, width: "100%", borderRadius: 16 }} scrollWheelZoom={draggable}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker
        position={[lat, lng]}
        icon={pinIcon}
        draggable={draggable}
        ref={markerRef}
        eventHandlers={
          draggable
            ? {
                dragend() {
                  const pos = markerRef.current?.getLatLng();
                  if (pos) onChange?.({ lat: pos.lat, lng: pos.lng });
                },
              }
            : undefined
        }
      />
      {draggable && <ClickToMove onChange={onChange} />}
      <RecenterOnChange lat={lat} lng={lng} />
    </MapContainer>
  );
}
