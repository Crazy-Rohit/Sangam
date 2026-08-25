import assert from 'node:assert/strict'
import { runStage3Analysis } from '../src/services/spatialAnalysis'
import { createProjectProfileFromText } from '../src/services/projectProfile'
import type { ProjectFileMeta } from '../src/types'
import type { ProjectProfile } from '../src/types/analysis'

const parsedProfile = createProjectProfileFromText(
  {
    name: 'uploaded-plan.pdf',
    size: 1200,
    type: 'application/pdf',
    uploadedAt: 'verification',
    file: {} as File,
  } satisfies ProjectFileMeta,
  `Project: Green Link Road Corridor
   Location: Seoni, Madhya Pradesh
   Proposed development length: 46 km
   Project area: 7.5 sq km
   Budget: Rs 850 crore
   Timeline: 30 months
   Environmental information: forest and water interfaces require assessment.
   Ecological information: habitat continuity should be retained.`,
)
assert.equal(parsedProfile.location, 'Seoni, Madhya Pradesh')
assert.equal(parsedProfile.projectLengthKm, 46)
assert.equal(parsedProfile.projectAreaSqKm, 7.5)
assert.equal(parsedProfile.budgetCrore, 850)
assert.equal(parsedProfile.timelineMonths, 30)

const profile: ProjectProfile = {
  projectName: 'Verification Corridor',
  projectType: 'Road Corridor',
  location: 'Madhya Pradesh Demonstration Corridor',
  district: 'Demonstration Corridor',
  state: 'Madhya Pradesh',
  projectLengthKm: 32,
  projectAreaSqKm: 4.8,
  budgetCrore: null,
  timelineMonths: null,
  developmentObjective: 'Verification profile',
  environmentalInformation: 'Simulation only',
  ecologicalInformation: 'Simulation only',
  infrastructureInformation: 'Simulation only',
  constraints: [],
  source: 'PoC Simulation Fallback',
  extractionNotes: [],
}

const low = runStage3Analysis(profile, 'low')
const medium = runStage3Analysis(profile, 'medium')
const high = runStage3Analysis(profile, 'high')
const larger = runStage3Analysis(
  { ...profile, projectLengthKm: 58, projectAreaSqKm: 9.5 },
  'medium',
)

assert.equal(medium.priorityZones.length, 5)
assert.equal(medium.layers.habitatPatches.length, 3)
assert.equal(medium.layers.connectivityCorridors.length, 2)
assert.ok(medium.spatialContext.route.length >= 5)

assert.ok(low.spatialContext.developmentPressure < medium.spatialContext.developmentPressure)
assert.ok(medium.spatialContext.developmentPressure < high.spatialContext.developmentPressure)
assert.ok(low.connectivityAssessment.disruptionRisk < high.connectivityAssessment.disruptionRisk)
assert.ok(low.riskAssessment.overallScore < high.riskAssessment.overallScore)
assert.ok(
  Math.max(...low.priorityZones.map((zone) => zone.priorityScore)) <
    Math.max(...high.priorityZones.map((zone) => zone.priorityScore)),
)
assert.ok(
  larger.spatialContext.developmentPressure > medium.spatialContext.developmentPressure,
  'Increasing project length/area must increase development pressure',
)
assert.ok(
  larger.environmentalAssessment.score >= medium.environmentalAssessment.score,
  'Increasing project length/area must not reduce environmental sensitivity',
)

for (const result of [low, medium, high, larger]) {
  assert.ok(result.environmentalAssessment.score >= 0 && result.environmentalAssessment.score <= 100)
  assert.ok(result.connectivityAssessment.importanceScore >= 0 && result.connectivityAssessment.importanceScore <= 100)
  assert.ok(result.riskAssessment.overallScore >= 0 && result.riskAssessment.overallScore <= 100)
  for (const zone of result.priorityZones) {
    assert.ok(zone.priorityScore >= 0 && zone.priorityScore <= 100)
    assert.ok(zone.reasons.length > 0)
  }
}

console.log('Stage 3 verification passed')
console.log({
  parsedProfile: {
    location: parsedProfile.location,
    lengthKm: parsedProfile.projectLengthKm,
    areaSqKm: parsedProfile.projectAreaSqKm,
  },
  pressure: {
    low: low.spatialContext.developmentPressure,
    medium: medium.spatialContext.developmentPressure,
    high: high.spatialContext.developmentPressure,
  },
  risk: {
    low: low.riskAssessment.overallScore,
    medium: medium.riskAssessment.overallScore,
    high: high.riskAssessment.overallScore,
  },
  connectivityDisruption: {
    low: low.connectivityAssessment.disruptionRisk,
    medium: medium.connectivityAssessment.disruptionRisk,
    high: high.connectivityAssessment.disruptionRisk,
  },
  topPriority: {
    low: Math.max(...low.priorityZones.map((zone) => zone.priorityScore)),
    medium: Math.max(...medium.priorityZones.map((zone) => zone.priorityScore)),
    high: Math.max(...high.priorityZones.map((zone) => zone.priorityScore)),
  },
  mediumZones: medium.priorityZones.map((zone) => ({
    zone: zone.label,
    risk: zone.overallRisk,
    priority: zone.priorityScore,
    band: zone.band,
  })),
})
