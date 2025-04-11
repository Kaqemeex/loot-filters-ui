import { FilterDefinition } from '../types/ModularFilterSpec'

const enableDisableModuleFilter: FilterDefinition = {
    name: '[Dev] Enable Disable Module Test',
    description: 'A descriptive description of the filter',
    modules: [
        {
            name: 'Enable Disable Module Test',
            moduleJson: {
                name: 'Enable Disable Module Test',
                subtitle: 'A good sized subtitle with a long description',
                description:
                    "A long description of the input, no longer. Longer than 400px so long it wraps around. Maybe longer. Excessively long so that we can test the limits of chrome. Nope that's not enough we need more.",

                enabled: false,
                inputs: [
                    {
                        type: 'boolean',
                        label: 'A simple input',
                        macroName: 'INPUT_TEST',
                        default: false,
                    },
                ],
            },
            moduleRs2fText: '#define INPUT_TEST',
        },
    ],
}

const markdownTest: FilterDefinition = {
    name: '[Dev] Markdown Test',
    description: 'A filter that allows you to test markdown',
    modules: [
        {
            name: 'Markdown Test',
            moduleJson: {
                name: 'Markdown Test',
                description:
                    '# markdown\n\nA filter that allows you to test markdown. asdf.\n\n[Link](https://www.google.com)\n\n**Bold**\n\n## test\n\n1. foo\n\n2. bar',
                inputs: [],
            },
            moduleRs2fText: '',
        },
    ],
}

const listInputFilter: FilterDefinition = {
    name: '[Dev] List Input Filter',
    description: 'A filter that allows you to select a list of items',
    modules: [
        {
            name: 'List Input',
            moduleJson: {
                name: 'List Input',
                description: 'A list input with no default values',
                inputs: [
                    {
                        type: 'enumlist',
                        macroName: 'VAR_HERB_SHOW',
                        label: 'Herbs to always show regardless of value',
                        enum: [
                            { value: 'guam leaf', label: 'Guam Leaf' },
                            { value: 'marrentill', label: 'Marrentill' },
                            { value: 'tarromin', label: 'Tarromin' },
                            { value: 'harralander', label: 'Harralander' },
                            { value: 'ranarr weed', label: 'Ranarr Weed' },
                            { value: 'toadflax', label: 'Toadflax' },
                            { value: 'irit leaf', label: 'Irit Leaf' },
                            { value: 'avantoe', label: 'Avantoe' },
                            { value: 'kwuarm', label: 'Kwuarm' },
                            { value: 'huasca', label: 'Huasca' },
                            { value: 'snapdragon', label: 'Snapdragon' },
                            { value: 'cadantine', label: 'Cadantine' },
                            { value: 'lantadyme', label: 'Lantadyme' },
                            { value: 'dwarf weed', label: 'Dwarf Weed' },
                            { value: 'torstol', label: 'Torstol' },
                        ],
                        default: [],
                    },
                    {
                        type: 'stringlist',
                        group: 'addl-highlight',
                        label: 'ToA-specific item highlights',
                        macroName: 'VAR_TOA_HIGHLIGHT',
                        default: ['example-item'],
                    },
                ],
            },
            moduleRs2fText: '#define STYLE_INPUT_TEST nop;',
        },
    ],
}

const textInputFilter: FilterDefinition = {
    name: '[Dev] Text Input Filter',
    description: 'A filter that allows you to enter text',
    modules: [
        {
            name: 'Text Input',
            moduleJson: {
                name: 'Text Input',
                description: 'A text input with no default values',
                inputs: [
                    {
                        type: 'text',
                        macroName: 'VAR_TEXT_INPUT',
                        label: 'Text Input',
                        default: '',
                    },
                ],
            },
            moduleRs2fText: '#define VAR_TEXT_INPUT',
        },
    ],
}

const styleInputFilter: FilterDefinition = {
    name: '[Dev] Style Input Filter',
    description: 'A filter that allows you to select a style',
    modules: [
        {
            name: 'Style Input',
            moduleJson: {
                name: 'Style Input',
                description: 'A style input with no default values',
                inputs: [
                    {
                        type: 'style',
                        macroName: 'VAR_STYLE_INPUT',
                        label: 'Style Input',
                        default: {},
                    },
                ],
            },
            moduleRs2fText: '#define VAR_STYLE_INPUT',
        },
    ],
}

export const DEV_FILTERS = [
    enableDisableModuleFilter,
    listInputFilter,
    textInputFilter,
    styleInputFilter,
    markdownTest,
]
