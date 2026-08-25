import assert from 'node:assert/strict'
import { generateAlternativeAnalysis } from '../src/services/alternativeGeneration'
import { calculateMcdaScore } from '../src/services/decisionAnalysis'
import { runStage3Analysis } from '../src/services/spatialAnalysis'
import type { ProjectProfile } from '../src/types/analysis'

const base: ProjectProfile = {
  projectName: 'Alternative Verification Project',
  projectType: 'Road Corridor',
  location: 'Madhya Pradesh Demonstration Corridor',
  district: 'Demonstration Corridor',
  state: 'Madhya Pradesh',
  projectLengthKm: 32,
  projectAreaSqKm: 4.8,
  budgetCrore: 600,
  timelineMonths: 30,
  developmentObjective: 'Provide the same required connection or service capacity.',
  environmentalInformation: 'Simulation only',
  ecologicalInformation: 'Simulation only',
  infrastructureInformation: 'Simulation only',
  constraints: ['Retain objective and endpoints'],
  source: 'PoC Simulation Fallback',
  extractionNotes: [],
}

const profiles = [
  { key: 'construction', profile: base },
  {
    key: 'tourism',
    profile: {
      ...base,
      projectName: 'Tourism Circuit',
      projectType: 'Sustainable Tourism Development',
      developmentObjective: 'Develop a tourism circuit with safe visitor access.',
    },
  },
  {
    key: 'resource',
    profile: {
      ...base,
      projectName: 'Shared Water Scheme',
      projectType: 'Shared Resource Development',
      developmentObjective: 'Provide required shared water-resource capacity.',
    },
  },
] as const

const results = profiles.map(({ key, profile }) => {
  const stage3 = runStage3Analysis(profile, 'medium')
  const result = generateAlternativeAnalysis(stage3)
  const repeatedResult = generateAlternativeAnalysis(stage3)
  assert.equal(result.options.length, 4)
  assert.deepEqual(result, repeatedResult, 'Actionable alternatives must be deterministic')
  assert.deepEqual(result.options.map((option) => option.rank).sort(), [1, 2, 3, 4])

  const proposed = result.options.find((option) => option.kind === 'proposed')!
  const recommended = result.options.find((option) => option.id === result.recommendedOptionId)!
  assert.ok(recommended.feasible)
  assert.ok(result.options.every((option) => option.objective === profile.developmentObjective))
  assert.ok(result.options.every((option) => option.estimatedCostCrore > 0))
  assert.ok(result.options.every((option) => option.approximateLengthKm > 0))
  assert.ok(result.options.every((option) => option.alternativeLocationLabel.length > 0))
  assert.ok(result.options.every((option) => option.actionTitle.length > 0))
  assert.ok(result.options.every((option) => option.whyBetter.length > 0))
  assert.ok(result.options.every((option) => option.viaPlace.length > 0))
  assert.ok(result.options.every((option) => option.originPlace.length > 0))
  assert.match(
    proposed.alternativeLocationLabel,
    /Seoni|Chhindwara|Karmajhiri|Mundara|Barghat|Wainganga/,
  )
  assert.equal(proposed.estimatedCostCrore, profile.budgetCrore)
  assert.ok(result.options.every((option) => option.overallScore === calculateMcdaScore(option.scores)))
  assert.ok(
    result.options
      .filter((option) => option.kind !== 'proposed')
      .every(
        (option) =>
          option.geometry[0][0] === proposed.geometry[0][0] &&
          option.geometry[0][1] === proposed.geometry[0][1] &&
          option.geometry.at(-1)?.[0] === proposed.geometry.at(-1)?.[0] &&
          option.geometry.at(-1)?.[1] === proposed.geometry.at(-1)?.[1],
      ),
    'Alternatives must preserve the simulated endpoints',
  )
  assert.ok(
    result.options.some(
      (option) =>
        option.kind !== 'proposed' &&
        JSON.stringify(option.geometry) !== JSON.stringify(proposed.geometry),
    ),
  )
  if (!result.proposedSuitable) {
    assert.notEqual(recommended.id, proposed.id)
    assert.ok(recommended.riskScore < proposed.riskScore)
    assert.ok(recommended.estimatedCostCrore < proposed.estimatedCostCrore)
  }

  return {
    key,
    scenario: result.scenario,
    configuration: result.configurationLabel,
    geometrySignature: JSON.stringify(
      result.options.find((option) => option.kind === 'ecology-optimised')?.geometry,
    ),
    proposed: { risk: proposed.riskScore, overall: proposed.overallScore },
    recommended: {
      name: recommended.name,
      risk: recommended.riskScore,
      overall: recommended.overallScore,
    },
  }
})

const acceptablePlan = generateAlternativeAnalysis(
  runStage3Analysis(base, 'low'),
)
assert.equal(acceptablePlan.proposedSuitable, true)
assert.equal(acceptablePlan.recommendedOptionId, acceptablePlan.proposedOptionId)

assert.equal(results[0].scenario, 'sustainable-construction')
assert.equal(results[1].scenario, 'sustainable-tourism')
assert.equal(results[2].scenario, 'shared-resource-development')
assert.equal(new Set(results.map((result) => result.configuration)).size, 3)
assert.equal(new Set(results.map((result) => result.geometrySignature)).size, 3)

console.log('Alternative generation verification passed')
console.log({
  acceptablePlan: {
    proposedSuitable: acceptablePlan.proposedSuitable,
    recommended: acceptablePlan.recommendedOptionId,
  },
})
console.log(results)
