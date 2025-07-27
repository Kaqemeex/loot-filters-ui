import { ListDiff, ListOption } from './index'

export const EMPTY_DIFF: ListDiff = {
    added: [],
    removed: [],
}

export const applyDiff = (
    list: (string | ListOption)[],
    diffs: (ListDiff | undefined)[]
): (string | ListOption)[] => {
    return diffs.reduce((acc, diff) => {
        return applyDiffSingle(acc, diff)
    }, list)
}

const applyDiffSingle = (
    list: (string | ListOption)[],
    diff: ListDiff | undefined
): (string | ListOption)[] => {
    if (!diff) {
        return list
    }

    let realDiff = diff
    if (Array.isArray(diff)) {
        realDiff = convertToListDiff(diff, list)
    }

    return list
        .filter((item: any) => {
            if (typeof item === 'string') {
                return !realDiff.removed.includes(item)
            } else if (typeof item === 'object' && 'value' in item) {
                return !realDiff.removed.includes(item.value)
            }
            return false
        })
        .concat(realDiff.added)
}

const listContains = (list: (string | ListOption)[], item: string) => {
    if (list.length === 0) {
        return false
    }
    for (const listItem of list) {
        if (typeof listItem === 'string') {
            if (listItem === item) {
                return true
            }
        } else {
            if (listItem.value === item) {
                return true
            }
        }
    }
    return false
}

export const convertToListDiff = (
    valuesToDiff: (string | ListOption)[],
    inputDefaults: (string | ListOption)[]
): ListDiff => {
    if (inputDefaults.length === 0) {
        return {
            added: convertOptionsToStrings(valuesToDiff),
            removed: [],
        }
    }

    const added = convertOptionsToStrings(
        valuesToDiff.filter(
            (item) =>
                !listContains(
                    inputDefaults,
                    typeof item === 'string' ? item : item.value
                )
        )
    )

    const removed = inputDefaults
        .map((item) => {
            if (typeof item === 'string') {
                return item
            }
            return item.value
        })
        .filter((item) => !listContains(valuesToDiff, item))
    return { added, removed }
}

export const convertOptionsToStrings = (
    list: (string | ListOption)[]
): string[] => {
    return list.map((item) => {
        if (typeof item === 'string') {
            return item
        }
        return item.value
    })
}
