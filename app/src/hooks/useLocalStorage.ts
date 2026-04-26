import { useEffect, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { ZodType } from 'zod'

export function useLocalStorage<T>(
    key: string,
    initialValue: T,
    schema: ZodType<T>,
): [T, Dispatch<SetStateAction<T>>] {
    const [value, setValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialValue
        }

        try {
            const storedValue = window.localStorage.getItem(key)
            if (!storedValue) {
                return initialValue
            }

            const result = schema.safeParse(JSON.parse(storedValue))
            return result.success ? result.data : initialValue
        } catch {
            return initialValue
        }
    })

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(value))
        } catch {
            // Storage can be unavailable in private or restricted environments.
        }
    }, [key, value])

    return [value, setValue]
}
