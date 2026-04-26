import consoleMathFileToolCode from '../../examples/console_math_file_tool.cpp?raw'
import expressUserApiCode from '../../examples/express_user_api.js?raw'
import goCalculatorCode from '../../examples/calculator.go?raw'
import javaSpringControllerCode from '../../examples/spring_controller.java?raw'
import kotlinComposeComponentCode from '../../examples/compose_component.kt?raw'
import profilePersistenceUtilityCode from '../../examples/profile_persistence_utility.py?raw'
import rustCliParserCode from '../../examples/cli_parser.rs?raw'
import type { CodeExample } from '../types/review'

export const CODE_EXAMPLES = [
  {
    code: profilePersistenceUtilityCode,
    id: 'profile-persistence-utility',
    label: 'Python: Profile Persistence Utility',
  },
  {
    code: consoleMathFileToolCode,
    id: 'console-math-file-tool',
    label: 'C/C++: Console Math and File Tool',
  },
  {
    code: expressUserApiCode,
    id: 'express-user-api',
    label: 'JavaScript: Express User API',
  },
  {
    code: javaSpringControllerCode,
    id: 'java-spring-controller',
    label: 'Java: Spring Boot Order Controller',
  },
  {
    code: rustCliParserCode,
    id: 'rust-cli-parser',
    label: 'Rust: CLI Argument Parser',
  },
  {
    code: goCalculatorCode,
    id: 'go-calculator',
    label: 'Go: Calculator Service',
  },
  {
    code: kotlinComposeComponentCode,
    id: 'kotlin-compose-component',
    label: 'Kotlin: Compose Task Card',
  },
] as const satisfies readonly CodeExample[]
