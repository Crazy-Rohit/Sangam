import type { AlternativeOption, McdaScores } from '../types/alternatives'

export const SANGAM_MCDA_WEIGHTS: Record<keyof McdaScores, number> = {
  environmentalCompatibility: 0.25,
  connectivityPreservation: 0.2,
  humanSafety: 0.15,
  relativeCost: 0.15,
  engineeringFeasibility: 0.15,
  sustainability: 0.1,
}

const clamp = (value: number) => Math.max(0, Math.min(100, value))

/**
 * The single Sangam decision formula used for the proposed plan and every
 * generated alternative. Higher values are always better.
 */
export function calculateMcdaScore(scores: McdaScores): number {
  return Math.round(
    clamp(
      Object.entries(SANGAM_MCDA_WEIGHTS).reduce(
        (total, [key, weight]) =>
          total + scores[key as keyof McdaScores] * weight,
        0,
      ),
    ),
  )
}

export function rankDevelopmentOptions(
  options: Omit<AlternativeOption, 'overallScore' | 'rank'>[],
): AlternativeOption[] {
  const scored = options.map((option) => ({
    ...option,
    overallScore: calculateMcdaScore(option.scores),
    rank: 0,
  }))
  const rankById = new Map(
    [...scored]
      .sort((a, b) => {
        if (a.feasible !== b.feasible) return a.feasible ? -1 : 1
        return b.overallScore - a.overallScore
      })
      .map((option, index) => [option.id, index + 1]),
  )
  return scored.map((option) => ({
    ...option,
    rank: rankById.get(option.id) ?? scored.length,
  }))
}
