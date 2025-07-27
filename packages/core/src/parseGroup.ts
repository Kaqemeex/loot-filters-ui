import { parse as parseYaml } from 'yaml'
import { Filter_Group, Filter_GroupSpec } from './FilterTypesSpec'

export const parseGroup = (comment: string): Filter_Group => {
    const declarationContent = comment.substring(
        comment.indexOf('\n'), // chop the structured declaration
        comment.indexOf('*/')
    )
    const groupYaml = parseYaml(declarationContent)
    return Filter_GroupSpec.parse(groupYaml)
}
