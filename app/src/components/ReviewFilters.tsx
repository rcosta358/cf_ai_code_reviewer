import { ISSUE_LEVEL_FILTERS, ISSUE_LEVEL_LABELS } from '../constants'
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
                <select value={severityFilter} onChange={(event) => onSeverityFilterChange(readIssueLevelFilter(event.target.value))}>
                    {ISSUE_LEVEL_FILTERS.map((value) => (
                        <option key={value} value={value}>
                            {ISSUE_LEVEL_LABELS[value]}
                        </option>
                    ))}
                </select>
            </label>

            <label>
                Confidence
                <select
                    value={confidenceFilter}
                    onChange={(event) => onConfidenceFilterChange(readIssueLevelFilter(event.target.value))}
                >
                    {ISSUE_LEVEL_FILTERS.map((value) => (
                        <option key={value} value={value}>
                            {ISSUE_LEVEL_LABELS[value]}
                        </option>
                    ))}
                </select>
            </label>
        </section>
    )
}

function readIssueLevelFilter(value: string): IssueLevelFilter {
    return ISSUE_LEVEL_FILTERS.find((filter) => filter === value) ?? 'all'
}
