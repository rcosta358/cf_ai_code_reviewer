import type { CodeExample } from '../examples'
import { Icon } from './Icon'

type CodeEditorToolbarProps = {
  copied: boolean
  disabled: boolean
  exampleOptions: readonly CodeExample[]
  hasCode: boolean
  language: string
  onCopy: () => void
  onSelectExample: (code: string) => void
  selectedExampleId: string
}

export function CodeEditorToolbar({
    copied,
    disabled,
    exampleOptions,
    hasCode,
    language,
    onCopy,
    onSelectExample,
    selectedExampleId,
}: CodeEditorToolbarProps) {
    return (
        <div className="editor-toolbar">
            <div className="editor-metadata" aria-label="Code editor metadata">
                <span className="language-badge">{language}</span>
            </div>

            <div className="editor-toolbar-actions">
                <label className="example-select">
                    <select
                        aria-label="Load example code"
                        disabled={disabled}
                        onChange={(event) => {
                            const selectedExample = exampleOptions.find((example) => example.id === event.target.value)

                            if (selectedExample) {
                                onSelectExample(selectedExample.code)
                            }
                        }}
                        value={selectedExampleId}
                    >
                        <option value="">Select Example</option>
                        {exampleOptions.map((example) => (
                            <option key={example.id} value={example.id}>
                                {example.label}
                            </option>
                        ))}
                    </select>
                </label>

                <button className="secondary-button" disabled={!hasCode} onClick={onCopy} type="button">
                    <Icon name={copied ? 'check' : 'copy'} />
                    {copied ? 'Copied' : 'Copy'}
                </button>
            </div>
        </div>
    )
}
