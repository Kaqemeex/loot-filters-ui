import { Lexer } from './lexer'
import { TokenType } from './token'
import { TokenStream } from './tokenstream'
import { Module } from './UiTypesSpec'

export type PrecompiledFilter = {
    prefix?: RenderOptimizedRs2f
    filter: RenderOptimizedRs2f
    suffix?: RenderOptimizedRs2f
}

export type RenderOptimizedRs2f = {
    macroBindings: Record<string, string>
    rs2f: string
}

/**
 * In order to render the filter right now we parse it on-demand. This is slow-af.
 *
 * This function pre-compiles the filter by tokenizing the filter, and replacing the macro defines
 * with `__COMPILE_DEFINE_<macroName>__` placeholders. These placeholders are then replaced at render
 * time with the actual macro values.
 *
 * This allows us to 'pre-compile' the filter, and then render it with different macro values much more quickly.
 */
export const compile = (modules: Module[]): RenderOptimizedRs2f => {
    let rs2f: string[] = []
    const macroBindings: Record<string, string> = {}

    // Because macros are global in scope we don't need to worry about module boundaries.
    // the last macro binding wins, always.
    modules.forEach((m) => {
        const { macroBindings: moduleBindings, rs2f: moduleRs2f } = preCompile(
            m.rs2f
        )
        rs2f.push(moduleRs2f)
        Object.assign(macroBindings, moduleBindings)
    })

    return {
        macroBindings,
        rs2f: rs2f.join(''),
    }
}

const preCompile = (rs2fCode: string): RenderOptimizedRs2f => {
    let replaced: string[] = []
    const bindings: Record<string, string> = {}
    let tokens: TokenStream = new TokenStream(new Lexer(rs2fCode).tokenize())

    while (tokens.hasTokens()) {
        const token = tokens.take(true)
        if (token.type !== TokenType.PREPROC_DEFINE) {
            replaced.push(token.value)
            continue
        }

        // Replace the macro define with a placeholder that we can
        // replace without needing to re-parse. Eat the #define token.
        const macroName = tokens.takeExpect(TokenType.IDENTIFIER).value
        const macroValue = tokens
            .takeLine()
            .getTokens()
            .map((t) => t.value)
            .join('')
        replaced.push(`__COMPILE_DEFINE_${macroName}__\n`)
        bindings[macroName] = macroValue
    }

    return {
        macroBindings: bindings,
        rs2f: replaced.join(''),
    }
}

const transformBindings = (
    bindings: Record<string, string>
): [string, string][] => {
    return Object.entries(bindings).map(([key, value]) => [
        `__COMPILE_DEFINE_${key}__`,
        value,
    ])
}

export const render = (
    filter: RenderOptimizedRs2f,
    filterMacroOverrides: Record<string, string>,
    prefix?: RenderOptimizedRs2f,
    prefixMacroOverrides: Record<string, string> = {},
    suffix?: RenderOptimizedRs2f,
    suffixMacroOverrides: Record<string, string> = {}
): string => {
    // This order preserves the precedence of the macro bindings.
    const finalBindings: Record<string, string> = Object.fromEntries([
        ...transformBindings(prefix?.macroBindings || {}),
        ...transformBindings(prefixMacroOverrides),
        ...transformBindings(filter.macroBindings),
        ...transformBindings(filterMacroOverrides),
        ...transformBindings(suffix?.macroBindings || {}),
        ...transformBindings(suffixMacroOverrides),
    ])

    const combinedRs2f =
        (prefix?.rs2f || '') + filter.rs2f + (suffix?.rs2f || '')
    // Apparently the testing of the string is apparently the slowest part, so doing it once is better.
    const regex = new RegExp(Object.keys(finalBindings).join('|'), 'g')
    return combinedRs2f.replace(
        regex,
        (match) =>
            `#define ${match.replace('__COMPILE_DEFINE_', '').slice(0, -2)}${finalBindings[match] || match}`
    )
}
