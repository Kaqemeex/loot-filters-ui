import { isArray, isObject } from 'underscore'
import {
    BooleanInput,
    EnumListInput,
    NumberInput,
    StringListInput,
} from './InputsSpec'
import { FilterModule } from './ModularFilterSpec'

export const validateModule = (module: FilterModule) => {
    assertString(module, 'name')
    assertString(module, 'description', true)

    module.inputs.forEach((input) => {
        assertString(input, 'label')
        if (Object.keys(input).includes('macroName')) {
            if (typeof input.macroName === 'string') {
                if (input.macroName.length === 0) {
                    throw new Error(`Module ${module.name} has empty macroName`)
                }
            } else {
                throw new Error(
                    `Module ${module.name} has invalid macroName ${input.macroName} or the macroName is empty`
                )
            }
        } else {
            throw new Error(`Module ${module.name} has no macroName`)
        }

        switch (input.type) {
            case 'boolean':
                checkObjectProperty(input as BooleanInput, 'default', 'boolean')
                break
            case 'number':
                checkObjectProperty(input as NumberInput, 'default', 'number')
                break
            case 'stringlist':
                checkArrayProperty((input as StringListInput).default, 'string')
                break
            case 'enumlist':
                checkArrayProperty((input as EnumListInput).default, 'string')
                break
            case 'style':
                if (!isObject(input.default)) {
                    throw new Error(`Value ${input.default} is not an object`)
                }
                checkObjectProperty(input.default, 'textColor', 'string', true)
                checkObjectProperty(
                    input.default,
                    'backgroundColor',
                    'string',
                    true
                )
                checkObjectProperty(
                    input.default,
                    'borderColor',
                    'string',
                    true
                )
                checkObjectProperty(input.default, 'textAccent', 'number', true)
                checkObjectProperty(
                    input.default,
                    'textAccentColor',
                    'string',
                    true
                )
                checkObjectProperty(input.default, 'fontType', 'number', true)
                checkObjectProperty(
                    input.default,
                    'showLootbeam',
                    'boolean',
                    true
                )
                checkObjectProperty(
                    input.default,
                    'lootbeamColor',
                    'string',
                    true
                )
                checkObjectProperty(input.default, 'showValue', 'boolean', true)
                checkObjectProperty(
                    input.default,
                    'showDespawn',
                    'boolean',
                    true
                )
                checkObjectProperty(input.default, 'notify', 'boolean', true)
                checkObjectProperty(
                    input.default,
                    'hideOverlay',
                    'boolean',
                    true
                )
                checkObjectProperty(
                    input.default,
                    'highlightTile',
                    'boolean',
                    true
                )
                checkObjectProperty(
                    input.default,
                    'menuTextColor',
                    'string',
                    true
                )
                checkObjectProperty(
                    input.default,
                    'tileStrokeColor',
                    'string',
                    true
                )
                checkObjectProperty(
                    input.default,
                    'tileFillColor',
                    'string',
                    true
                )
                break
        }
    })
}

export const assertString = (value: any, key: string, optional = false) => {
    checkObjectProperty(value, key, 'string', optional)
}

const checkArrayProperty = (value: any, type: string, optional = false) => {
    if (value === undefined || value === null) {
        if (!optional) {
            throw new Error(`Value ${value} is undefined`)
        }
        return
    }

    if (!isArray(value)) {
        throw new Error(`Value ${value} is not an array`)
    }

    value.forEach((item: any) => {
        if (typeof item !== type) {
            throw new Error(`Value ${item} is not of type ${type}`)
        }
    })
}

const checkObjectProperty = (
    value: any,
    key: string,
    type: string,
    optional = false
) => {
    if (!isObject(value)) {
        throw new Error(`Value ${value} is not an object`)
    }

    if (!Object.keys(value).includes(key)) {
        if (!optional) {
            throw new Error(
                `Value ${JSON.stringify(value)} has no property ${key} of type ${type}`
            )
        }
        return
    }

    if (typeof value[key] !== type) {
        throw new Error(
            `Value ${JSON.stringify(value)} has property ${key} of type ${typeof value[key]} instead of ${type}`
        )
    }

    return value[key]
}
