import { Card, SectionHeader } from '../../components/ui/Card'
import { FieldList } from '../../components/ui/FieldList'
import { DASHBOARD_SECTIONS } from '../../data/placeholderDashboard'
import { useSangam } from '../../context/SangamContext'
import { formatFileSize } from '../../lib/format'
import { OptionComparisonGrid } from '../../components/dashboard/OptionComparisonGrid'
import { ActionableRecommendationFlow } from '../../components/dashboard/ActionableRecommendationFlow'
import { findProposed, findRecommended } from '../../lib/overviewDecision'

export { OverviewPage } from './OverviewPage'

export function ProjectInputPage() {
  const section = DASHBOARD_SECTIONS[0]
  const { projectFile, region, projectName, projectProfile } = useSangam()

  const inputFields = [
    { label: 'Project name', value: projectName },
    { label: 'Source document', value: projectFile?.name ?? '—' },
    {
      label: 'File size',
      value: projectFile ? formatFileSize(projectFile.size) : '—',
    },
    { label: 'PoC analysis region', value: region },
    { label: 'Profile source', value: projectProfile?.source ?? '—' },
    { label: 'Project type', value: projectProfile?.projectType ?? '—' },
    { label: 'Project location', value: projectProfile?.location ?? '—' },
    { label: 'District', value: projectProfile?.district ?? '—' },
    {
      label: 'Development footprint',
      value: projectProfile
        ? `${projectProfile.projectLengthKm} km · ${projectProfile.projectAreaSqKm} km²`
        : '—',
    },
    { label: 'Development objective', value: projectProfile?.developmentObjective ?? '—' },
  ]

  return (
    <div className="stack">
      <SectionHeader
        letter={section.letter}
        kicker="Project input"
        title={section.title}
        description={section.summary}
      />
      <Card>
        <FieldList fields={inputFields} />
        <p className="later-mod">
          Source distinction: uploaded PDF metadata/filename hints create the profile;
          Stage 3 spatial layers come from a separate deterministic PoC simulation dataset.
        </p>
      </Card>
    </div>
  )
}

export function EngineeringOptionsPage() {
  const section = DASHBOARD_SECTIONS[4]
  return (
    <div className="stack">
      <SectionHeader
        letter={section.letter}
        kicker="Engineering options"
        title={section.title}
        description={section.summary}
      />
      <Card>
        <FieldList fields={section.fields} />
        <p className="later-mod">Later module: {section.laterModule}</p>
      </Card>
    </div>
  )
}

export function ComparisonPage() {
  const { alternativeAnalysis } = useSangam()
  const proposed = alternativeAnalysis ? findProposed(alternativeAnalysis) : undefined
  const recommended = alternativeAnalysis ? findRecommended(alternativeAnalysis) : undefined

  return (
    <div className="stack">
      <SectionHeader
        kicker="Comparison"
        title="Place, length, cost and scores"
        description="All four evaluated configurations use the same Sangam ranking. Length and rupee figures are deterministic PoC dummy values, not surveyed distances or quotations."
      />
      {alternativeAnalysis && proposed && recommended ? (
        <>
          <ActionableRecommendationFlow
            scenario={alternativeAnalysis.scenario}
            current={proposed}
            recommended={recommended}
          />
          <OptionComparisonGrid analysis={alternativeAnalysis} />
        </>
      ) : (
        <Card>
          <p>Complete the Sangam analysis to compare dummy lengths, costs and scores.</p>
        </Card>
      )}
    </div>
  )
}

export function RecommendationPage() {
  const { alternativeAnalysis } = useSangam()
  const proposed = alternativeAnalysis ? findProposed(alternativeAnalysis) : undefined
  const recommended = alternativeAnalysis ? findRecommended(alternativeAnalysis) : undefined

  return (
    <div className="stack">
      <SectionHeader
        kicker="Recommendation"
        title="Sangam recommended configuration"
        description="The same ranking shown on Overview and Alternative Options, with dummy place, length and cost values for a non-technical reading."
      />
      {alternativeAnalysis && proposed && recommended ? (
        <Card className="recommended-option">
          <ActionableRecommendationFlow
            scenario={alternativeAnalysis.scenario}
            current={proposed}
            recommended={recommended}
          />
        </Card>
      ) : (
        <Card>
          <p>Complete the Sangam analysis to see the recommended configuration.</p>
        </Card>
      )}
    </div>
  )
}
