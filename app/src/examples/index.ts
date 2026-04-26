import insecureCppCode from './insecure_cpp.cpp?raw'
import insecureJavascriptCode from './insecure_js.js?raw'
import insecurePythonCode from './insecure_py.py?raw'

export type CodeExample = {
  code: string
  id: string
  label: string
}

export const CODE_EXAMPLES = [
    {
        code: insecurePythonCode,
        id: 'insecure-py',
        label: 'Python: Insecure Profile Manager',
    },
    {
        code: insecureCppCode,
        id: 'insecure-cpp',
        label: 'C/C++: Unsafe Console Utility',
    },
    {
        code: insecureJavascriptCode,
        id: 'insecure-js',
        label: 'JavaScript: Vulnerable Express API',
    },
] as const satisfies readonly CodeExample[]
