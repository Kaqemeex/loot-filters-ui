import { Input, InputType } from '../types/InputsSpec'
import { UiFilterModule } from '../types/ModularFilterSpec'

type Declaration<T> = {
    type: 'input' | 'module'
    content: string
    declaration: T
}

type InputDeclaration = Declaration<Input> & {
    define: string
}

type ModuleDeclaration = Declaration<UiFilterModule>


const parseDeclaration = (line: string) => {
    const match = line.match(/define:([a-z]+):([a-z0-9_]+)/)
    if (!match) {
        throw new Error(`Unparseable declaration at '${line}'`)
    }
    return {
        type: match[1],
        id: match[2],
    }
}
export const parse = (filter: string) => {
    const declarationBlocks = []

    const lines = filter.split('\n')

    // the define:[module|input]:id bit; as an object
    let declaration: { type: string; id: string } | null = null
    let declarationContent: string | null = null

    for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
        const line = lines[lineNumber]
        if (line.startsWith('/*@')) {
            if (declaration === null && declarationContent === null) {
                declaration = parseDeclaration(line.slice(3).trim())
                continue
            } else {
                throw new Error(
                    `Unexpected new declaration at ${lineNumber}: ${line} still parsing ${declaration}`
                )
            }
        }

        if (line.endsWith('*/') && declaration !== null) {
            if (declaration.type === 'input') {
                declarationBlocks.push({
                    type: declaration!!.type,
                    id: declaration!!.id,
                    content: declarationContent,
                    rs2f: lines[lineNumber + 1],
                })
            } else {
                declarationBlocks.push({
                    type: declaration!!.type,
                    id: declaration!!.id,
                    content: declarationContent,
                })
            }

            declaration = null
            declarationContent = null
        }

        if (declaration !== null) {
            if (declarationContent === null) {
                declarationContent = line + '\n'
            } else {
                declarationContent += line + '\n'
            }
        }
    }
    return declarationBlocks
}
