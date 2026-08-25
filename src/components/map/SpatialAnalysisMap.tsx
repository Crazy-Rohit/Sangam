import {
  CircleMarker,
  LayersControl,
  MapContainer,
  Polygon,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
} from 'react-leaflet'
import type { LatLngExpression, PathOptions } from 'leaflet'
import type {
  Coordinate,
  PolygonCoordinates,
  PriorityZone,
  Stage3Analysis,
} from '../../types/analysis'
import 'leaflet/dist/leaflet.css'

type SpatialAnalysisMapProps = {
  analysis: Stage3Analysis
  selectedZoneId: string | null
  onSelectZone: (zone: PriorityZone) => void
}

const latLng = ([lng, lat]: Coordinate): LatLngExpression => [lat, lng]
const line = (coordinates: Coordinate[]) => coordinates.map(latLng)
const polygon = (coordinates: PolygonCoordinates) =>
  coordinates.map((ring) => ring.map(latLng))

const priorityColor = (score: number) => {
  if (score >= 75) return '#a42d2d'
  if (score >= 55) return '#d46b24'
  if (score >= 35) return '#d4a72c'
  return '#287848'
}

const priorityStyle = (zone: PriorityZone, selected: boolean): PathOptions => ({
  color: selected ? '#102f3c' : priorityColor(zone.priorityScore),
  weight: selected ? 4 : 2,
  fillColor: priorityColor(zone.priorityScore),
  fillOpacity: selected ? 0.42 : 0.27,
})

export function SpatialAnalysisMap({
  analysis,
  selectedZoneId,
  onSelectZone,
}: SpatialAnalysisMapProps) {
  const { spatialContext, layers, priorityZones } = analysis

  return (
    <div className="map-shell">
      <MapContainer
        center={latLng(spatialContext.center)}
        zoom={11}
        scrollWheelZoom
        className="analysis-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LayersControl position="topright">
          <LayersControl.Overlay checked name="1 · Proposed Development Route">
            <Polyline
              positions={line(spatialContext.route)}
              pathOptions={{ color: '#102f3c', weight: 5, opacity: 0.9, dashArray: '10 6' }}
            >
              <Tooltip sticky>{analysis.profile.projectName} · simulated route alignment</Tooltip>
            </Polyline>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="2 · Environmental Sensitivity">
            <>
              {layers.sensitivityZones.map((geometry, index) => (
                <Polygon
                  key={`sensitivity-${index}`}
                  positions={polygon(geometry)}
                  pathOptions={{ color: '#d08a25', fillColor: '#f3c969', fillOpacity: 0.25, weight: 2 }}
                >
                  <Tooltip>Simulated environmental sensitivity zone {index + 1}</Tooltip>
                </Polygon>
              ))}
            </>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="3 · Ecological / Habitat Zones">
            <>
              {layers.habitatPatches.map((patch) => (
                <Polygon
                  key={patch.id}
                  positions={polygon(patch.geometry)}
                  pathOptions={{ color: '#287848', fillColor: '#4a9b63', fillOpacity: 0.3, weight: 2 }}
                >
                  <Tooltip>{patch.name} · sensitivity {patch.sensitivity}/100</Tooltip>
                </Polygon>
              ))}
            </>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="4 · Connectivity Zones">
            <>
              {layers.connectivityCorridors.map((coordinates, index) => (
                <Polyline
                  key={`corridor-${index}`}
                  positions={line(coordinates)}
                  pathOptions={{ color: '#7d4ea1', weight: 7, opacity: 0.55 }}
                >
                  <Tooltip>Simulated ecological connectivity corridor {index + 1}</Tooltip>
                </Polyline>
              ))}
            </>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="5 · Human Activity / Settlements">
            <>
              {layers.settlements.map((point) => (
                <CircleMarker
                  key={point.id}
                  center={latLng(point.coordinate)}
                  radius={5 + point.intensity / 18}
                  pathOptions={{ color: '#8a5631', fillColor: '#c9824d', fillOpacity: 0.75, weight: 2 }}
                >
                  <Tooltip>{point.name} · activity {point.intensity}/100</Tooltip>
                </CircleMarker>
              ))}
            </>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="6 · Infrastructure Pressure">
            <>
              {layers.infrastructurePressure.map((point) => (
                <CircleMarker
                  key={point.id}
                  center={latLng(point.coordinate)}
                  radius={6 + point.intensity / 14}
                  pathOptions={{ color: '#184858', fillColor: '#4a90ad', fillOpacity: 0.45, weight: 2 }}
                >
                  <Tooltip>{point.name} · pressure {point.intensity}/100</Tooltip>
                </CircleMarker>
              ))}
            </>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="7 · Risk Hotspots">
            <>
              {priorityZones
                .filter((zone) => zone.overallRisk >= 55)
                .map((zone) => {
                  const ring = zone.geometry[0]
                  const center = ring.slice(0, -1).reduce(
                    (acc, coordinate) => [acc[0] + coordinate[0], acc[1] + coordinate[1]],
                    [0, 0] as Coordinate,
                  )
                  const count = Math.max(1, ring.length - 1)
                  return (
                    <CircleMarker
                      key={`hotspot-${zone.id}`}
                      center={latLng([center[0] / count, center[1] / count])}
                      radius={8 + zone.overallRisk / 12}
                      pathOptions={{
                        color: priorityColor(zone.overallRisk),
                        fillColor: priorityColor(zone.overallRisk),
                        fillOpacity: 0.3,
                        weight: 3,
                      }}
                    >
                      <Tooltip>{zone.label} risk hotspot · {zone.overallRisk}/100</Tooltip>
                    </CircleMarker>
                  )
                })}
            </>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="8 · Priority Intervention Zones">
            <>
              {priorityZones.map((zone) => (
                <Polygon
                  key={zone.id}
                  positions={polygon(zone.geometry)}
                  pathOptions={priorityStyle(zone, selectedZoneId === zone.id)}
                  eventHandlers={{ click: () => onSelectZone(zone) }}
                >
                  <Tooltip sticky>{zone.label} · {zone.band} priority · {zone.priorityScore}/100</Tooltip>
                  <Popup>
                    <strong>{zone.label}</strong>
                    <br />
                    Priority {zone.band} · {zone.priorityScore}/100
                    <br />
                    Select the zone for its factor breakdown.
                  </Popup>
                </Polygon>
              ))}
            </>
          </LayersControl.Overlay>
        </LayersControl>
      </MapContainer>
      <div className="map-notice">
        <strong>PoC Simulation Data — Not field-validated</strong>
        <span>Base map: OpenStreetMap · Analytical geometry: local deterministic simulation</span>
      </div>
    </div>
  )
}
