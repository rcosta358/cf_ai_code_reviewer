import {
    HIGH_CONFIDENCE_THRESHOLD,
    MEDIUM_CONFIDENCE_THRESHOLD,
    REVIEW_CATEGORY_LABELS,
    REVIEW_CATEGORY_ORDER,
} from '../constants'
import type { IssueLevelFilter } from '../constants'
import type { ReviewCategory, ReviewIssue, ReviewSeverity } from '../types/review'

export type IssueFilters = {
    category: ReviewCategory | 'all'
    confidence: IssueLevelFilter
    severity: IssueLevelFilter
}

export function getConfidenceLabel(confidence: number) {
    if (confidence >= HIGH_CONFIDENCE_THRESHOLD) {
        return 'High'
    }

    if (confidence >= MEDIUM_CONFIDENCE_THRESHOLD) {
        return 'Medium'
    }

    return 'Low'
}

export function getVisibleIssues(issues: ReviewIssue[] = []) {
    return issues.filter((issue) => !issue.dismissed).toSorted(compareIssuesByLine)
}

export function getFilteredIssues(issues: ReviewIssue[], filters: IssueFilters) {
    return issues.filter((issue) => {
        const categoryMatches = filters.category === 'all' || issue.category === filters.category
        const severityMatches = filters.severity === 'all' || issue.severity === filters.severity
        return categoryMatches && severityMatches && matchesConfidence(issue, filters.confidence)
    })
}

export function getCategoryCounts(issues: ReviewIssue[]) {
    return REVIEW_CATEGORY_ORDER.reduce<Record<ReviewCategory, number>>(
        (counts, category) => ({
            ...counts,
            [category]: issues.filter((issue) => issue.category === category).length,
        }),
        {
            correctness: 0,
            security: 0,
            performance: 0,
            maintainability: 0,
            style: 0,
            documentation: 0,
            other: 0,
        },
    )
}

export function formatIssueForCopy(issue: ReviewIssue) {
    return [
        `${REVIEW_CATEGORY_LABELS[issue.category]} / ${issue.severity.toUpperCase()} / ${getConfidenceLabel(issue.confidence)} confidence`,
        issue.line ? `Line ${issue.line}` : 'Line not provided',
        issue.title,
        issue.description,
        `Suggested fix: ${issue.suggestion}`,
    ].join('\n')
}

export function formatIssuesForCopy(issues: ReviewIssue[]) {
    return issues.length > 0
        ? issues.map((issue, index) => `Issue ${index + 1}\n${formatIssueForCopy(issue)}`).join('\n\n')
        : 'No issues found.'
}

export function getSeverityClassName(severity: ReviewSeverity) {
    return `severity-${severity}`
}

function matchesConfidence(issue: ReviewIssue, filter: IssueLevelFilter) {
    if (filter === 'all') {
        return true
    }

    return getConfidenceLabel(issue.confidence).toLowerCase() === filter
}

function compareIssuesByLine(first: ReviewIssue, second: ReviewIssue) {
    return (first.line ?? Number.POSITIVE_INFINITY) - (second.line ?? Number.POSITIVE_INFINITY)
}
