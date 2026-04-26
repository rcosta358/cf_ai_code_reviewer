import { renderInlineHtml } from '../utils'

type InlineFormattedTextProps = {
  text: string
}

export function InlineFormattedText({ text }: InlineFormattedTextProps) {
    return <>{renderInlineHtml(text)}</>
}
