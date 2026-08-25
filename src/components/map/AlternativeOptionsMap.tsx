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
import type { LatLngExpression } from 'leaflet'
import type { Coordinate, PolygonCoordinates, Stage3Analysis } from '../../types/analysis'
import type { AlternativeAnalysis, AlternativeOption } from '../../types/alternatives'
import 'leaflet/dist/leaflet.css'

type AlternativeOptionsMapProps = {
  stage3: Stage3Analysis
  alternatives: AlternativeAnalysis
  selectedId: string
  onSelect: (option: AlternativeOption) => void
}

const COLORS: Record<string, string> = {
  proposed: '#a42d2d',
  'ecology-optimised': '#287848',
  balanced: '#1b5f7f',
  'cost-optimised': '#b27b24',
}

const latLng = ([lng, lat]: Coordinate): LatLngExpression => [lat, lng]
const line = (coordinates: Coordinate[]) => coordinates.map(latLng)
const polygon = (coordinates: PolygonCoordinates) =>
  coordinates.map((ring) => ring.map(latLng))
const midpoint = (coordinates: Coordinate[]) =>
  latLng(coordinates[Math.floor(coordinates.length / 2)])

export function AlternativeOptionsMap({
  stage3,
  alternatives,
  selectedId,
  onSelect,
}: AlternativeOptionsMapProps) {
  return (
    <div className="map-shell alternative-map-shell">
      <MapContainer
        center={latLng(stage3.spatialContext.center)}
        zoom={11}
        scrollWheelZoom
        className="analysis-map alternative-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LayersControl position="topright">
          <LayersControl.Overlay checked name="Priority-zone context">
            <>
              {stage3.priorityZones.map((zone) => (
                <Polygon
                  key={zone.id}
                  positions={polygon(zone.geometry)}
                  pathOptions={{
                    color: zone.priorityScore >= 70 ? '#a42d2d' : '#c9824d',
                    fillColor: zone.priorityScore >= 70 ? '#a42d2d' : '#d4a72c',
                    fillOpacity: 0.12,
                    weight: 1,
                  }}
                >
                  <Tooltip>{zone.label} · priority {zone.priorityScore}/100</Tooltip>
                </Polygon>
              ))}
            </>
          </LayersControl.Overlay>

          {alternatives.options.map((option) => (
            <LayersControl.Overlay
              checked
              key={option.id}
              name={`${option.rank}. ${option.name}`}
            >
              <>
                <Polyline
                  positions={line(option.geometry)}
                  pathOptions={{
                    color: COLORS[option.id],
                    weight: selectedId === option.id ? 7 : option.kind === 'proposed' ? 5 : 4,
                    opacity: selectedId === option.id ? 1 : 0.75,
                    dashArray: option.kind === 'proposed' ? '10 6' : undefined,
                  }}
                  eventHandlers={{ click: () => onSelect(option) }}
                >
                  <Tooltip sticky>
                    {option.alternativeLocationLabel} · Risk {option.riskScore} · Overall {option.overallScore}
                  </Tooltip>
                </Polyline>
                <CircleMarker
                  center={midpoint(option.geometry)}
                  radius={selectedId === option.id ? 9 : 6}
                  pathOptions={{
                    color: '#f5fbf9',
                    fillColor: COLORS[option.id],
                    fillOpacity: 1,
                    weight: 2,
                  }}
                  eventHandlers={{ click: () => onSelect(option) }}
                >
                  <Tooltip direction="top" permanent={selectedId === option.id}>
                    {option.alternativeLocationLabel}
                  </Tooltip>
                  <Popup>
                    <strong>{option.name}</strong>
                    <br />
                    {option.actionTitle}
                    <br />
                    Location: {option.alternativeLocationLabel}
                    <br />
                    Via: {option.viaPlace}
                    <br />
                    Approx. length: {option.approximateLengthKm} km
                    <br />
                    Estimated PoC Cost: ₹{option.estimatedCostCrore} crore
                    <br />
                    Risk: {option.riskScore}/100
                    <br />
                    Ecology: {option.scores.environmentalCompatibility}/100
                    <br />
                    Connectivity: {option.scores.connectivityPreservation}/100
                    <br />
                    Overall: {option.overallScore}/100
                  </Popup>
                </CircleMarker>
              </>
            </LayersControl.Overlay>
          ))}
        </LayersControl>
      </MapContainer>
      <div className="map-notice">
        <strong>PoC Simulation Geometry — Not engineering-certified</strong>
        <span>
          All configurations preserve the simulated development objective and endpoints. Place-names
          (Seoni, Barghat, Chhapara, Karmajhiri, Wainganga) are deterministic PoC labels fitted to
          the existing demonstration geometry — not surveyed alignments.
        </span>
      </div>
    </div>
  )
}
