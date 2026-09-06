/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions": ["node", "node-addons"]}
 */
import React, { act } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { DebugPage } from './DebugPage'
import { reassociateFilter } from '../utils/restoreFilter'

const filter = {
    id: 'test',
    name: 'Test filter',
    rs2f: '',
    source: undefined as string | undefined,
}
const updateFilter = jest.fn()
const setFilterConfiguration = jest.fn()
const addAlert = jest.fn()
jest.mock('@monaco-editor/react', () => ({ Editor: () => null }))
jest.mock('react-router-dom', () => ({ useNavigate: () => jest.fn() }))
jest.mock('../store/filterStore', () => ({
    useFilterStore: () => ({ filters: { test: filter }, updateFilter }),
}))
jest.mock('../store/filterConfigurationStore', () => ({
    useFilterConfigStore: () => ({
        filterConfigurations: {},
        setFilterConfiguration,
    }),
}))
jest.mock('../store/alerts', () => ({ useAlertStore: () => ({ addAlert }) }))
jest.mock('../components/FeatureFlagged', () => ({
    FLAG_NAMES: [],
    useFeatureFlagStore: () => ({}),
}))
jest.mock('../utils/file', () => ({
    allStorageKeys: ['filter-store'],
    localState: async () => ({
        'filter-store': { state: { filters: { test: filter } } },
    }),
}))
jest.mock('../utils/restoreFilter', () => ({ reassociateFilter: jest.fn() }))

let container: HTMLDivElement
let root: Root
beforeEach(async () => {
    jest.clearAllMocks()
    filter.source = undefined
    ;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
    await act(async () => root.render(<DebugPage />))
    await click('Test filter')
})
afterEach(async () => {
    await act(async () => root.unmount())
    container.remove()
    jest.restoreAllMocks()
})
const click = async (label: string) => {
    const button = Array.from(container.querySelectorAll('button')).find(
        (button) => button.textContent === label
    )!
    expect(button).toBeDefined()
    await act(async () => button.click())
}

test('missing source prompts for a URL and re-associates the selected filter', async () => {
    const prompt = jest
        .spyOn(window, 'prompt')
        .mockReturnValue(' https://example.com/filter ')
    const restored = {
        filter,
        config: { inputConfigs: {}, enabledModules: {} },
    }
    jest.mocked(reassociateFilter).mockResolvedValue(restored as any)
    await click('Force re-association')
    expect(prompt).toHaveBeenCalledTimes(1)
    expect(reassociateFilter).toHaveBeenCalledWith(
        filter,
        undefined,
        'https://example.com/filter',
        undefined,
        undefined
    )
    expect(updateFilter).toHaveBeenCalledWith(filter)
    expect(setFilterConfiguration).toHaveBeenCalledWith('test', restored.config)
})

test('cancelling the URL prompt leaves stored data unchanged', async () => {
    jest.spyOn(window, 'prompt').mockReturnValue(null)
    await click('Force re-association')
    expect(reassociateFilter).not.toHaveBeenCalled()
    expect(updateFilter).not.toHaveBeenCalled()
    expect(setFilterConfiguration).not.toHaveBeenCalled()
})

test('a known source skips the prompt and failed association leaves data unchanged', async () => {
    filter.source = 'https://example.com/filter'
    const prompt = jest.spyOn(window, 'prompt')
    jest.mocked(reassociateFilter).mockRejectedValue(
        new Error('Failed to load filter')
    )
    await click('Force re-association')
    expect(prompt).not.toHaveBeenCalled()
    expect(updateFilter).not.toHaveBeenCalled()
    expect(addAlert).toHaveBeenCalledWith({
        children: 'Failed to load filter',
        severity: 'error',
    })
})
