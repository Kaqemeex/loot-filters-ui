import { Lexer } from '../parsing/lexer'
import { TokenType } from '../parsing/token'

// Remove old headers from persisted modules as well as newly parsed filters.
// Use token positions so a matching string literal is never removed.
export const stripSiteMetadata = (text: string): string => {
    let result = text.trim().replaceAll('\r', '')
    const lines = result.split('\n')
    const offsets: number[] = []
    let offset = 0
    for (const line of lines) {
        offsets.push(offset)
        offset += line.length + 1
    }
    const tokens = new Lexer(result)
        .tokenize()
        .filter(
            (token) =>
                token.type === TokenType.COMMENT &&
                token.value.startsWith('/*@ define:sitemeta')
        )
    for (const token of tokens.reverse()) {
        const start = offsets[token.location.line - 1] + token.location.char - 1
        result =
            result.slice(0, start) + result.slice(start + token.value.length)
    }
    return result
}
