import type { ProjectFileMeta } from '../types'
import type { ProjectProfile } from '../types/analysis'

const MP_DISTRICTS = [
  'Bhopal',
  'Indore',
  'Jabalpur',
  'Gwalior',
  'Seoni',
  'Mandla',
  'Balaghat',
  'Chhindwara',
  'Narmadapuram',
  'Raisen',
  'Sagar',
  'Satna',
  'Rewa',
]

const TYPE_RULES: Array<[RegExp, string, string]> = [
  [/tourism|resort|visitor|recreation/i, 'Sustainable Tourism Development', 'Develop a tourism facility or circuit while retaining habitat continuity and safe access.'],
  [/shared resource|water supply|resource distribution|reservoir/i, 'Shared Resource Development', 'Provide required resource capacity through a lower-impact infrastructure configuration.'],
  [/rail|railway/i, 'Rail Corridor', 'Improve regional rail connectivity while maintaining landscape permeability.'],
  [/canal|irrigation/i, 'Canal / Water Infrastructure', 'Improve water conveyance with reduced ecological fragmentation.'],
  [/power|transmission/i, 'Power Transmission Corridor', 'Expand energy infrastructure with lower habitat disturbance.'],
  [/industrial|plant|factory/i, 'Industrial Development', 'Enable planned industrial growth with environmental safeguards.'],
  [/road|highway|expressway|corridor/i, 'Road Corridor', 'Improve safe regional mobility while reducing ecological conflict.'],
]

const getNumber = (text: string, unit: string) => {
  const match = text.match(new RegExp(`(\\d+(?:\\.\\d+)?)\\s*${unit}`, 'i'))
  return match ? Number(match[1]) : null
}

/**
 * Stage 2 compatibility bridge. It uses deterministic filename hints when
 * available and falls back to an explicitly-labelled demonstration profile.
 * No PDF text is claimed to have been parsed.
 */
export function createProjectProfile(file: ProjectFileMeta | null): ProjectProfile {
  const rawName = file?.name.replace(/\.pdf$/i, '') ?? 'MP Development Corridor'
  const readableName = rawName.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim()
  const district =
    MP_DISTRICTS.find((name) => new RegExp(`\\b${name}\\b`, 'i').test(readableName)) ??
    inferSeoniBelt(readableName)
  const typeRule = TYPE_RULES.find(([pattern]) => pattern.test(readableName))
  const length = getNumber(readableName, 'km')
  const area = getNumber(readableName, '(?:sq\\s*km|km2)')
  const hasHints = Boolean(district || typeRule || length || area)
  const projectType = typeRule?.[1] ?? 'Road Corridor'
  const seoniBelt = district === 'Seoni' || district === 'Chhindwara' || district === 'Mandla' || district === 'Balaghat'

  return {
    projectName: readableName || 'MP Development Corridor',
    projectType,
    location: seoniBelt
      ? `${district}, Madhya Pradesh · Kanha–Pench landscape`
      : district
        ? `${district}, Madhya Pradesh`
        : 'Seoni–Chhindwara belt, Madhya Pradesh',
    district: district ?? 'Seoni',
    state: 'Madhya Pradesh',
    projectLengthKm: length ?? 32,
    projectAreaSqKm: area ?? 4.8,
    budgetCrore: null,
    timelineMonths: null,
    developmentObjective:
      typeRule?.[2] ?? 'Improve regional connectivity while enabling safer human–animal coexistence.',
    environmentalInformation: 'To be populated by a future field-validated environmental data source.',
    ecologicalInformation: 'Stage 3 uses deterministic, non-field-validated habitat simulation layers.',
    infrastructureInformation: `${projectType} footprint assessed against simulated infrastructure pressure.`,
    constraints: [
      'Project location must remain within the Madhya Pradesh PoC scope.',
      'Ecological and spatial layers are simulation data, not field observations.',
    ],
    source: hasHints ? 'Project Plan PDF' : 'PoC Simulation Fallback',
    extractionNotes: hasHints
      ? ['Profile uses deterministic hints found in the uploaded PDF filename.', 'PDF body parsing is not active in this build.']
      : ['No usable location/scale hint was available; the predefined demonstration corridor is used.'],
  }
}

const firstMatchingLine = (text: string, pattern: RegExp) =>
  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length > 8 && pattern.test(line))

function inferSeoniBelt(text: string): string | undefined {
  if (/chhindwara/i.test(text)) return 'Chhindwara'
  if (/mandla|kanha/i.test(text)) return 'Mandla'
  if (/balaghat/i.test(text)) return 'Balaghat'
  if (
    /seoni|pench|wainganga|kanha.?pench|connectivity corridor|nature tourism|shared water/i.test(
      text,
    )
  ) {
    return 'Seoni'
  }
  return undefined
}

/** Enriches the deterministic fallback with text extracted from a real PDF. */
export function createProjectProfileFromText(
  file: ProjectFileMeta,
  text: string,
): ProjectProfile {
  const base = createProjectProfile(file)
  const compact = text.replace(/\s+/g, ' ').trim()
  if (compact.length < 40) return base

  const district =
    MP_DISTRICTS.find((name) => new RegExp(`\\b${name}\\b`, 'i').test(compact)) ??
    inferSeoniBelt(compact)
  const typeRule = TYPE_RULES.find(([pattern]) => pattern.test(compact))
  const length = getNumber(compact, 'km')
  const area = getNumber(compact, '(?:sq\\s*km|km2|square\\s*kilomet(?:er|re)s?)')
  const budgetMatch = compact.match(/(?:budget|cost)[^\d]{0,20}(?:₹|rs\.?)?\s*(\d+(?:\.\d+)?)\s*(?:crore|cr)/i)
  const timelineMatch = compact.match(/(?:timeline|duration|period)[^\d]{0,20}(\d+(?:\.\d+)?)\s*months?/i)
  const objective = firstMatchingLine(text, /objective|purpose|proposed development/i)
  const environment = firstMatchingLine(text, /environment|forest|water|land use/i)
  const ecology = firstMatchingLine(text, /ecolog|habitat|wildlife|biodiversity/i)
  const infrastructure = firstMatchingLine(text, /infrastructure|road|rail|canal|transmission/i)

  return {
    ...base,
    projectType: typeRule?.[1] ?? base.projectType,
    location: district ? `${district}, Madhya Pradesh` : base.location,
    district: district ?? base.district,
    projectLengthKm: length ?? base.projectLengthKm,
    projectAreaSqKm: area ?? base.projectAreaSqKm,
    budgetCrore: budgetMatch ? Number(budgetMatch[1]) : base.budgetCrore,
    timelineMonths: timelineMatch ? Number(timelineMatch[1]) : base.timelineMonths,
    developmentObjective: objective ?? typeRule?.[2] ?? base.developmentObjective,
    environmentalInformation: environment ?? base.environmentalInformation,
    ecologicalInformation: ecology ?? base.ecologicalInformation,
    infrastructureInformation: infrastructure ?? base.infrastructureInformation,
    source: 'Project Plan PDF',
    extractionNotes: [
      'Text was read directly from the uploaded PDF in the browser.',
      district
        ? `A usable Madhya Pradesh district was found: ${district}.`
        : 'No usable Madhya Pradesh district was found; demonstration corridor location retained.',
      'Scanned/image-only PDF content requires future OCR and will use the simulation fallback.',
    ],
  }
}
