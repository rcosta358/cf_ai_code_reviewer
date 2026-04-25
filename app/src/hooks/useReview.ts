import { useContext } from 'react'
import { ReviewContext } from '../contexts/reviewContextValue'

export function useReview() {
    const context = useContext(ReviewContext)

    if (!context) {
        throw new Error('useReview must be used within a ReviewProvider')
    }

    return context
}
