import { InputType } from "../types/InputsSpec"


/**
 * Extract default values from rs2f macro defines. Does not handle multiple nested defines
 */
const parseRs2fMacroDefine = (line: string, inputType: InputType) => {
    const match = line.match(/#define\s+([A-Z0-9_]+)\s+(.+)/)
    if (!match) {
        throw new Error(`Unparseable rs2f macro define at '${line}'`)
    }

    switch (inputType) {
        case 'boolean':
            return {
                macroName: match[1],
                macroValue: match[2] === 'true' ? true : false,
            }
        case 'number':
            return {
                macroName: match[1],
                macroValue: parseInt(match[2]),
            }
        case 'stringlist':
        case 'enumlist':
            return {
                macroName: match[1],
                macroValue: match[2].split(','),
            }
        case 'includeExcludeList':
            return {
                macroName: match[1],
                macroValue: {
                    includes: match[2].split(','),
                    excludes: match[3].split(','),
                },
            }
        case 'style':
            return {
                macroName: match[1],
                macroValue: {
                    ...match[2].split(','),
                },
            }
    }

    return {
        macroName: match[1],
        macroValue: match[2],
    }
}