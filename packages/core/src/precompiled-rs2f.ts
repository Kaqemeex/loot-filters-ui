import { z } from 'zod'
import { MacroInputMapping } from './filter-version-settings'
import { InputType } from './inputs'

export const MacroBindingSchema = z.object({
    macroName: z.string(),
    value: z.string().optional(),
})
export type MacroBinding = z.infer<typeof MacroBindingSchema>

export const PrecompiledRs2fSchema = z.object({
    rawRs2f: z.string(),
    precompiledRs2f: z.string(),
    parsedMacros: z.array(MacroBindingSchema),
})
export type PrecompiledRs2f = z.infer<typeof PrecompiledRs2fSchema>

// Typical-whack GitHub URL for reference
export const TYPICAL_WHACK_GITHUB_URL =
    'https://raw.githubusercontent.com/typical-whack/loot-filters-modules/refs/heads/main/filter.rs2f'

// Example filter for testing the ui
export const EXAMPLE_FILTER = `#define VAR_ALCHS_FORCE_SHOWN true

apply (VAR_ALCHS_FORCE_SHOWN && name:VAR_ALCHS_ITEM_LIST) {
    hidden = false;
}

#define VAR_ALCHS_CUSTOMSTYLE \\
    icon = Sprite(41, 0);

apply (name:VAR_ALCHS_ITEM_LIST) {
    VAR_ALCHS_CUSTOMSTYLE
}

#define VAR_ALCHS_ITEM_LIST [ \\
  "Adamant platebody", \\
  "Air battlestaff", \\
  "Dragon battleaxe", \\
  "Dragon dagger", \\
  "Rune sq shield", \\
  "Rune sword", \\
  "Rune warhammer", \\
  "Runite crossbow (u)", \\
  "Runite limbs", \\
  "Water battlestaff", \\
]

#define VAR_ALCHS_TERMINATE false

rule (VAR_ALCHS_TERMINATE && name:VAR_ALCHS_ITEM_LIST) {}
`

/**
 * Precompiles a filter by extracting macros and inserting placeholders for future rendering.
 * This allows us to improve the performance of rendering
 * by making it a simple find and replace; no tokenization needed.
 */
export const precompileFilter = (filterStr: string): PrecompiledRs2f => {
    const macros: MacroBinding[] = []
    let escapedLine = ''
    const precompiledRs2f = []

    for (const line of filterStr.split('\n')) {
        if (line[line.length - 2] !== '\\' && line[line.length - 1] === '\\') {
            // ditch the backslash, the split ate the newline
            escapedLine += line.slice(0, -1)
            continue
        } else {
            escapedLine += line
        }

        if (escapedLine.startsWith('#define')) {
            const defineLineParts = escapedLine.split(' ')
            const macroName = defineLineParts[1]
            const macroValue = defineLineParts.slice(2).join(' ')
            macros.push({ macroName, value: macroValue.trim() })
            precompiledRs2f.push(`//@define ${macroName}`)
            escapedLine = ''
        } else {
            precompiledRs2f.push(escapedLine)
            escapedLine = ''
        }
    }

    return {
        rawRs2f: filterStr,
        precompiledRs2f: precompiledRs2f.join('\n'),
        parsedMacros: macros,
    }
}

const guessInputType = (value: string | undefined): InputType => {
    if (value === undefined) {
        return { type: 'raw_rs2f' }
    }

    if (value.startsWith('true') || value.startsWith('false')) {
        return { type: 'boolean' }
    }

    try {
        console.log(
            'parsing',
            value,
            'to number',
            parseInt(value),
            'is NaN',
            isNaN(parseInt(value))
        )
        if (!isNaN(parseInt(value))) {
            return { type: 'number' }
        }
    } catch (e) {}

    if (value.startsWith('[') && value.endsWith(']')) {
        console.log('checking list list', value)
        // Find first non-whitespace character after opening bracket
        let firstCharOfFirstElement = ''
        for (let i = 1; i < value.length; i++) {
            if (!/[\s\[]/.test(value[i])) {
                firstCharOfFirstElement = value[i]
                break
            }
        }

        // If empty list, assume strings
        if (
            firstCharOfFirstElement === ']' ||
            /["']/.test(firstCharOfFirstElement)
        ) {
            return {
                type: 'list',
                itemTypes: 'string',
                allowCustomItems: true,
            }
        }

        if (/[0-9]/.test(firstCharOfFirstElement)) {
            return {
                type: 'list',
                itemTypes: 'number',
                allowCustomItems: true,
            }
        }
    }

    return { type: 'raw_rs2f' }
}

export const bestEffortMacroMapping = (
    bindings: Array<MacroBinding>
): MacroInputMapping => {
    return Object.fromEntries(
        bindings.map((binding) => [
            binding.macroName,
            guessInputType(binding.value),
        ])
    )
}
