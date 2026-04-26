import { createElement, type ReactNode } from 'react'


type InlineHtmlTag = 'b' | 'code' | 'i'
type InlineHtmlElement = { children: InlineHtmlNode[]; tag: InlineHtmlTag }
type InlineHtmlNode = string | InlineHtmlElement
type InlineFormattedTextProps = {
  text: string
}

const inlineTagPattern = /<\/?(b|i|code)\s*>/gi

export function InlineFormattedText({ text }: InlineFormattedTextProps) {
    return <>{renderInlineHtml(text)}</>
}

function renderInlineHtml(text: string): ReactNode {
    const root: InlineHtmlNode[] = []
    const stack: Array<{ children: InlineHtmlNode[]; tag: InlineHtmlTag | null }> = [{ children: root, tag: null }]
    const matches = text.matchAll(inlineTagPattern)
    let lastIndex = 0

    for (const match of matches) {
        if (match.index > lastIndex) {
            stack.at(-1)?.children.push(text.slice(lastIndex, match.index))
        }

        const rawTag = match[0]
        const tag = match[1]?.toLowerCase() as InlineHtmlTag | undefined

        if (tag) {
            if (rawTag.startsWith('</')) {
                if (stack.at(-1)?.tag === tag) {
                    stack.pop()
                } else {
                    stack.at(-1)?.children.push(rawTag)
                }
            } else {
                const node: InlineHtmlElement = { children: [], tag }
                stack.at(-1)?.children.push(node)
                stack.push(node)
            }
        }

        lastIndex = match.index + rawTag.length
    }

    if (lastIndex < text.length) {
        stack.at(-1)?.children.push(text.slice(lastIndex))
    }

    const renderNode = (node: InlineHtmlNode, key: number): ReactNode => {
        if (typeof node === 'string') {
            return node
        }

        return createElement(node.tag, { key }, node.children.map(renderNode))
    }

    return root.map(renderNode)
}

