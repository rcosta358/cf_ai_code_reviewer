import { ISSUE_LEVEL_LABELS } from '../constants'
import type { IssueLevelFilter } from '../constants'

type ReviewFiltersProps = {
  confidenceFilter: IssueLevelFilter
  onConfidenceFilterChange: (filter: IssueLevelFilter) => void
  onSeverityFilterChange: (filter: IssueLevelFilter) => void
  severityFilter: IssueLevelFilter
}

export function ReviewFilters({
    confidenceFilter,
    onConfidenceFilterChange,
    onSeverityFilterChange,
    severityFilter,
}: ReviewFiltersProps) {
    return (
        <section className="review-filters" aria-label="Review filters">
            <label>
                Severity
                <select value={severityFilter} onChange={(event) => onSeverityFilterChange(event.target.value as IssueLevelFilter)}>
                    {Object.entries(ISSUE_LEVEL_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>
            </label>

            <label>
                Confidence
                <select
                    value={confidenceFilter}
                    onChange={(event) => onConfidenceFilterChange(event.target.value as IssueLevelFilter)}
                >
                    {Object.entries(ISSUE_LEVEL_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>
            </label>
        </section>
    )
}
