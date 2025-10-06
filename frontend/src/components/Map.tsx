import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

interface ILocation {
  lat: number;
  lon: number;
  formatted: string;
}

interface MapProps {
  A: ILocation;
  B: ILocation;
}

interface RoutePoint {
  lat: number;
  lon: number;
}

const ChangeView = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const RouteUpdater = ({ A, B }: { A: ILocation; B: ILocation }) => {
  const map = useMap();
  const [route, setRoute] = useState<RoutePoint[]>([]);

  useEffect(() => {
    if (!A?.lat || !A?.lon || !B?.lat || !B?.lon) return;

    const fetchRoute = async () => {
      try {
        const apiKey = "12624834a62046a48286d81e0bbdd2f4";
        const url = `https://api.geoapify.com/v1/routing?waypoints=${A.lat},${A.lon}|${B.lat},${B.lon}&mode=drive&apiKey=${apiKey}`;

        const res = await fetch(url);
        const data = await res.json();

        const coords = data.features?.[0]?.geometry?.coordinates?.[0];
        if (!coords) {
          setRoute([]);
          return;
        }

        const routePoints = coords.map(([lon, lat]: [number, number]) => ({ lat, lon }));
        setRoute(routePoints);

        // Fit bounds to show entire route
        if (routePoints.length > 0) {
          const bounds = L.latLngBounds(
            routePoints.map((p: RoutePoint) => [p.lat, p.lon] as [number, number])
          );
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      } catch (err) {
        console.error("Failed to fetch route:", err);
        setRoute([]);
      } 
    };

    fetchRoute();
  }, [A?.lat, A?.lon, B?.lat, B?.lon, map]);

  return route.length > 0 ? (
    <Polyline
      positions={route.map((p) => [p.lat, p.lon])}
      color="#2563eb"
      weight={4}
      opacity={0.8}
    />
  ) : null;
};

const Map = ({ A, B }: MapProps) => {
  const center: [number, number] = A?.lat && A?.lon ? [A.lat, A.lon] : [0, 0];

  if (!A || !B) {
    return (
      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-500">No location data available</p>
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={13}
      className="h-full w-full"
      scrollWheelZoom
      zoomControl={true}
    >
      <ChangeView center={center} zoom={13} />

      <TileLayer
        attribution='© <a href="https://www.geoapify.com/">Geoapify</a>'
        url={`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=12624834a62046a48286d81e0bbdd2f4`}
      />

      <Marker
        position={[A.lat, A.lon]}
        icon={L.icon({
          iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        })}
      >
        <Popup>
          <div className="text-sm">
            <p className="font-semibold text-green-700">Current Location</p>
            <p className="text-gray-600">{A.formatted}</p>
          </div>
        </Popup>
      </Marker>

      <Marker
        position={[B.lat, B.lon]}
        icon={L.icon({
          iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        })}
      >
        <Popup>
          <div className="text-sm">
            <p className="font-semibold text-red-700">Destination</p>
            <p className="text-gray-600">{B.formatted}</p>
          </div>
        </Popup>
      </Marker>

      <RouteUpdater A={A} B={B} />
    </MapContainer>
  );
};

export default Map;