import { parse as parseYaml } from 'yaml'
import {
    Filter_ModuleSpec,
    Filter_ThemeSpec as FilterSpecTheme,
} from './FilterTypesSpec'
import { Module, ModuleSpec, ThemeSpec } from './UiTypesSpec'

export const parseModule = (moduleId: string, comment: string): Module => {
    const declarationContent = comment.substring(
        comment.indexOf('\n'), // chop the structured declaration
        comment.indexOf('*/')
    )
    const module = parseYaml(declarationContent)
    return ModuleSpec.parse({
        ...Filter_ModuleSpec.parse(module),
        id: moduleId,
        rs2f: '',
    })
}

export const parseTheme = (id: string, comment: string) => {
    const declarationContent = comment.substring(
        comment.indexOf('\n'), // chop the structured declaration
        comment.indexOf('*/')
    )
    const module = parseYaml(declarationContent)
    return ThemeSpec.parse({ ...FilterSpecTheme.parse(module), id })
}
