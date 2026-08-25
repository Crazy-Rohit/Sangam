import type {
  Coordinate,
  HabitatPatch,
  MapPoint,
  PolygonCoordinates,
  SimulationZoneInput,
} from '../types/analysis'

export const DEMONSTRATION_CORRIDOR_NAME =
  'Seoni–Chhindwara demonstration belt (Kanha–Pench landscape)'
export const DEMONSTRATION_CENTER: Coordinate = [79.48, 22.16]

export const DEMONSTRATION_ROUTE: Coordinate[] = [
  [79.19, 22.24],
  [79.30, 22.20],
  [79.41, 22.17],
  [79.52, 22.14],
  [79.64, 22.10],
  [79.76, 22.07],
]

const zone = (
  id: string,
  label: string,
  geometry: PolygonCoordinates,
  routeSegment: Coordinate[],
  values: Omit<SimulationZoneInput, 'id' | 'label' | 'geometry' | 'routeSegment'>,
): SimulationZoneInput => ({ id, label, geometry, routeSegment, ...values })

export const SIMULATION_ZONES: SimulationZoneInput[] = [
  zone(
    'zone-1',
    'Zone 1 · Chhindwara–Umreth fringe',
    [[[79.16, 22.29], [79.31, 22.29], [79.31, 22.16], [79.16, 22.16], [79.16, 22.29]]],
    DEMONSTRATION_ROUTE.slice(0, 2),
    {
      habitatSensitivity: 58,
      environmentalProximity: 52,
      waterSensitivity: 44,
      landUseSensitivity: 48,
      humanActivity: 62,
      infrastructurePressure: 56,
      habitatConnectivity: 54,
      patchProximity: 50,
      corridorContinuity: 57,
      developmentIntersection: 64,
    },
  ),
  zone(
    'zone-2',
    'Zone 2 · Seoni west forest fringe',
    [[[79.28, 22.25], [79.42, 22.25], [79.42, 22.12], [79.28, 22.12], [79.28, 22.25]]],
    DEMONSTRATION_ROUTE.slice(1, 3),
    {
      habitatSensitivity: 46,
      environmentalProximity: 42,
      waterSensitivity: 38,
      landUseSensitivity: 50,
      humanActivity: 58,
      infrastructurePressure: 52,
      habitatConnectivity: 48,
      patchProximity: 44,
      corridorContinuity: 46,
      developmentIntersection: 58,
    },
  ),
  zone(
    'zone-3',
    'Zone 3 · Kanha–Pench corridor pinch-point (Seoni)',
    [[[79.39, 22.23], [79.54, 22.23], [79.54, 22.09], [79.39, 22.09], [79.39, 22.23]]],
    DEMONSTRATION_ROUTE.slice(2, 4),
    {
      habitatSensitivity: 86,
      environmentalProximity: 82,
      waterSensitivity: 68,
      landUseSensitivity: 72,
      humanActivity: 42,
      infrastructurePressure: 66,
      habitatConnectivity: 90,
      patchProximity: 88,
      corridorContinuity: 86,
      developmentIntersection: 92,
    },
  ),
  zone(
    'zone-4',
    'Zone 4 · Barghat–Wainganga belt',
    [[[79.50, 22.19], [79.66, 22.19], [79.66, 22.04], [79.50, 22.04], [79.50, 22.19]]],
    DEMONSTRATION_ROUTE.slice(3, 5),
    {
      habitatSensitivity: 64,
      environmentalProximity: 60,
      waterSensitivity: 72,
      landUseSensitivity: 58,
      humanActivity: 54,
      infrastructurePressure: 64,
      habitatConnectivity: 68,
      patchProximity: 66,
      corridorContinuity: 70,
      developmentIntersection: 74,
    },
  ),
  zone(
    'zone-5',
    'Zone 5 · Keolari / eastern Seoni approach',
    [[[79.62, 22.15], [79.79, 22.15], [79.79, 22.01], [79.62, 22.01], [79.62, 22.15]]],
    DEMONSTRATION_ROUTE.slice(4, 6),
    {
      habitatSensitivity: 74,
      environmentalProximity: 70,
      waterSensitivity: 54,
      landUseSensitivity: 66,
      humanActivity: 70,
      infrastructurePressure: 78,
      habitatConnectivity: 76,
      patchProximity: 72,
      corridorContinuity: 74,
      developmentIntersection: 84,
    },
  ),
]

export const HABITAT_PATCHES: HabitatPatch[] = [
  {
    id: 'habitat-west',
    name: 'Satpura foothill patch (Chhindwara)',
    sensitivity: 72,
    geometry: [[
      [79.23, 22.32],
      [79.36, 22.30],
      [79.39, 22.21],
      [79.27, 22.18],
      [79.20, 22.24],
      [79.23, 22.32],
    ]],
  },
  {
    id: 'habitat-central',
    name: 'Kanha–Pench linkage patch (Seoni)',
    sensitivity: 91,
    geometry: [[
      [79.40, 22.27],
      [79.55, 22.25],
      [79.58, 22.14],
      [79.48, 22.08],
      [79.39, 22.14],
      [79.40, 22.27],
    ]],
  },
  {
    id: 'habitat-east',
    name: 'Barghat–Wainganga vegetation patch',
    sensitivity: 78,
    geometry: [[
      [79.61, 22.18],
      [79.76, 22.17],
      [79.80, 22.08],
      [79.70, 22.00],
      [79.61, 22.06],
      [79.61, 22.18],
    ]],
  },
]

export const SENSITIVITY_ZONES: PolygonCoordinates[] = [
  [[[79.36, 22.25], [79.58, 22.25], [79.58, 22.07], [79.36, 22.07], [79.36, 22.25]]],
  [[[79.59, 22.18], [79.79, 22.18], [79.79, 22.00], [79.59, 22.00], [79.59, 22.18]]],
]

export const CONNECTIVITY_CORRIDORS: Coordinate[][] = [
  [[79.25, 22.28], [79.38, 22.22], [79.47, 22.17], [79.56, 22.11], [79.70, 22.07]],
  [[79.34, 22.13], [79.44, 22.17], [79.54, 22.16], [79.65, 22.12]],
]

export const SETTLEMENTS: MapPoint[] = [
  { id: 'settlement-1', name: 'Umreth / Chhindwara fringe', coordinate: [79.27, 22.18], intensity: 58 },
  { id: 'settlement-2', name: 'Seoni', coordinate: [79.58, 22.09], intensity: 66 },
  { id: 'settlement-3', name: 'Barghat', coordinate: [79.73, 22.11], intensity: 78 },
]

export const INFRASTRUCTURE_PRESSURE_POINTS: MapPoint[] = [
  { id: 'infra-1', name: 'NH-44 Chhapara approach', coordinate: [79.32, 22.20], intensity: 52 },
  { id: 'infra-2', name: 'Seoni service node', coordinate: [79.54, 22.13], intensity: 70 },
  { id: 'infra-3', name: 'Barghat utility node', coordinate: [79.69, 22.08], intensity: 82 },
]
