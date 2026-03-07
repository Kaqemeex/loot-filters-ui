import { Token, TokenType } from './token'

/**
 * Manipulator for a stream of tokens returned from lexing.
 *
 * This is conceptually equivalent to, BUT behaviorally different from the
 * plugin version of TokenStream - that one ignores comments and needs a bunch
 * more logic for handling expressions, etc. - this one _needs_ comments in
 * certain situations.
 */
export class TokenStream {
    private readonly tokens: Token[]
    private readonly firstToken: Token

    private index: number = 0

    constructor(tokens: Token[]) {
        this.tokens = [...tokens]
        this.firstToken = tokens[0]
    }

    getTokens(): Token[] {
        const tokens: Token[] = []
        for (let i = this.index; i < this.tokens.length; ++i) {
            tokens.push(this.tokens[i])
        }

        return tokens
    }

    hasTokens(): boolean {
        for (let i = this.index; i < this.tokens.length; ++i) {
            if (!isWhitespace(this.tokens[i])) {
                return true
            }
        }
        return false
    }

    /**
     * Peek at the first non-whitespace token in the stream without consuming
     * it.
     */
    peek(): Token {
        for (let i = this.index; i < this.tokens.length; ++i) {
            if (!isWhitespace(this.tokens[i])) {
                return this.tokens[i]
            }
        }

        throw new TokenStreamEOFError(this.firstToken)
    }

    /**
     * Consume the first token in the stream, optionally including whitespace.
     */
    take(includeWhitespace?: boolean): Token {
        for (let i = this.index; i < this.tokens.length; ++i) {
            const next = this.tokens[i]
            if (includeWhitespace || !isWhitespace(next)) {
                this.index = i + 1
                return next
            }
        }

        throw new TokenStreamEOFError(this.firstToken)
    }

    /**
     * Consume the first non-whitespace token in the stream while asserting
     * that it is of the given type.
     */
    takeExpect(expect: TokenType): Token {
        if (!this.hasTokens()) {
            throw new TokenStreamEOFError(this.firstToken)
        }

        const first = this.take()
        if (first?.type !== expect) {
            throw new TokenStreamError('unexpected token', first)
        }
        return first
    }

    /**
     * Take a complete line from the stream, including whitespace, and
     * excluding the newline at the end.
     */
    takeLine(): TokenStream {
        const line: Token[] = []
        let i: number

        for (i = this.index; i < this.tokens.length; ++i) {
            const next = this.tokens[i]
            if (next.type === TokenType.NEWLINE) {
                ++i
                break
            }
            line.push(next)
        }

        this.index = i
        return new TokenStream(line)
    }

    toString(): string {
        return this.getTokens()
            .map((t) =>
                t.type === TokenType.LITERAL_STRING ? `"${t.value}"` : t.value
            )
            .join('')
    }

    takeInt(): number {
        return parseInt(this.takeExpect(TokenType.LITERAL_INT).value)
    }

    takeBool(): boolean {
        const first = this.take()!!
        switch (first.type) {
            case TokenType.TRUE:
                return true
            case TokenType.FALSE:
                return false
            default:
                throw new TokenStreamError('unexpected token', first)
        }
    }

    takeString(): string {
        return this.takeExpect(TokenType.LITERAL_STRING).value
    }

    takeStringList(): string[] {
        return this.takeList().map((token) => {
            if (token.type !== TokenType.LITERAL_STRING) {
                throw new TokenStreamError('unexpected token', token)
            }
            return token.value
        })
    }

    private takeList(): Token[] {
        const list: Token[] = []
        this.takeExpect(TokenType.LIST_START)
        while (this.hasTokens()) {
            if (this.peek().type === TokenType.LIST_END) {
                return list
            }

            list.push(this.take())

            const next = this.peek()
            if (next.type === TokenType.COMMA) {
                this.take()
            } else if (next.type === TokenType.LIST_END) {
                this.take()
                break
            } else {
                throw new TokenStreamError('unexpected token', next)
            }
        }
        return list
    }
}

export function isWhitespace(token: Token): boolean {
    return (
        token.type === TokenType.WHITESPACE || token.type === TokenType.NEWLINE
    )
}

export class TokenStreamError extends Error {
    constructor(message: string, token: Token) {
        var loc = token.location
        super(
            `${message} '${token.value}' at line ${loc.line}, char ${loc.char}`
        )
    }
}

export class TokenStreamEOFError extends Error {
    constructor(token: Token) {
        super(`unexpected end of token stream near line ${token.location.line}`)
    }
}
