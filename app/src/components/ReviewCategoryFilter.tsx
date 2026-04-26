import { REVIEW_CATEGORY_LABELS, REVIEW_CATEGORY_ORDER } from '../constants'
import type { ReviewCategory } from '../types/review'

type ReviewCategoryFilterProps = {
  activeCategory: ReviewCategory | 'all'
  categoryCounts: Record<ReviewCategory, number>
  onCategoryChange: (category: ReviewCategory | 'all') => void
  totalIssueCount: number
}

export function ReviewCategoryFilter({
    activeCategory,
    categoryCounts,
    onCategoryChange,
    totalIssueCount,
}: ReviewCategoryFilterProps) {
    return (
        <section className="category-filter" aria-label="Issue categories">
            <button
                className={`category-chip category-all ${activeCategory === 'all' ? 'is-active' : ''}`}
                onClick={() => onCategoryChange('all')}
                type="button"
            >
                All <span>{totalIssueCount}</span>
            </button>
            {REVIEW_CATEGORY_ORDER.map((category) => (
                <button
                    className={`category-chip category-${category} ${activeCategory === category ? 'is-active' : ''}`}
                    key={category}
                    onClick={() => onCategoryChange(category)}
                    type="button"
                >
                    {REVIEW_CATEGORY_LABELS[category]} <span>{categoryCounts[category]}</span>
                </button>
            ))}
        </section>
    )
}
