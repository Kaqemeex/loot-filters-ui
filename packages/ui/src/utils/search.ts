import Fuse from 'fuse.js'
import { groupBy } from 'underscore'

import { Module, Input, isEnumListInput } from '../parsing/UiTypesSpec'

const MIN_SEARCH_LENGTH = 3

// fuzzy score threshold - 0 means perfect match, 1 means not at all
// this number is selected through trial and error
const FUZZY_THRESHOLD = 0.3

export type SearchState = 'none' | 'expand' | 'hide'

export type ModuleSearchResult = {
    state: SearchState
    groups: Record<string, GroupSearchResult>
}

export type GroupSearchResult = {
    state: SearchState
    inputs: Record<string, InputSearchResult>
}

export type InputSearchResult = {
    state: SearchState
    contents: string[]
}

export const searchModule = (
    input: Module,
    search: string
): ModuleSearchResult => {
    const result = init(input)
    if (search.length < MIN_SEARCH_LENGTH) {
        return result
    }

    result.state = 'hide'
    if (isStringMatch([input.name], search)) {
        result.state = 'expand'
        return result
    }

    for (const [groupName, group] of Object.entries(result.groups)) {
        group.state = 'hide'
        if (isStringMatch([groupName], search)) {
            result.state = 'expand'
            group.state = 'expand'
            continue
        }

        for (const [inputName, input] of Object.entries(group.inputs)) {
            // for now we don't hide unmatched inputs within a module
            // input.state = 'hide'
            if (isStringMatch([inputName, ...input.contents], search)) {
                result.state = 'expand'
                group.state = 'expand'
                input.state = 'expand'
            }
        }
    }

    return result
}

const init = (input: Module): ModuleSearchResult => {
    const result: ModuleSearchResult = {
        state: 'none',
        groups: {},
    }

    const groupedInputs = groupBy(
        input.inputs.map((input) => ({
            ...input,
            group: input.group ?? '_',
        })),
        'group'
    )

    for (const [name, inputs] of Object.entries(groupedInputs)) {
        result.groups[name] = {
            state: 'none',
            inputs: inputs.reduce(
                (acc, v) => ({
                    ...acc,
                    [v.label]: {
                        state: 'none',
                        contents: getInputContents(v),
                    },
                }),
                {} as Record<string, InputSearchResult>
            ),
        }
    }

    return result
}

const getInputContents = (input: Input): string[] => {
    const enums: string[] = []
    if (isEnumListInput(input)) {
        for (const v of input.enum) {
            if (typeof v === 'string') {
                enums.push(v)
            } else {
                enums.push(v.label, v.value)
            }
        }
    }
    return [...(input.default || []), ...enums]
}

const isStringMatch = (inputs: string[], search: string): boolean => {
    const fuse = new Fuse(inputs, {
        includeScore: true,
    })
    const result = fuse.search(search)
    return result.some((r) => (r.score ?? 1) < FUZZY_THRESHOLD)
}
